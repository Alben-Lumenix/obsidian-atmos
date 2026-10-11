import { closeSync, openSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import esbuild from 'esbuild';

const root = fileURLToPath(new URL('..', import.meta.url));
const configPath = path.join(root, '.env.atmos-integration');
const budgetPath = path.join(root, '.atmos-integration-budget.json');
const budgetLimit = 4;
const timeoutMs = 10_000;

function requireIgnored(filePath) {
  try {
    execFileSync('git', ['check-ignore', '-q', filePath], { cwd: root, stdio: 'ignore' });
  } catch {
    throw new Error(`Refusing to use ${path.basename(filePath)} because Git does not ignore it.`);
  }
}

function parseEnvFile(contents) {
  const values = {};
  for (const [index, rawLine] of contents.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^(QWEATHER_API_HOST|QWEATHER_API_KEY)=(.*)$/);
    if (!match) throw new Error(`Invalid configuration at line ${index + 1}.`);
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

function credentials() {
  requireIgnored(configPath);
  let fromFile = {};
  try {
    fromFile = parseEnvFile(readFileSync(configPath, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const host = process.env.QWEATHER_API_HOST?.trim() || fromFile.QWEATHER_API_HOST?.trim();
  const key = process.env.QWEATHER_API_KEY?.trim() || fromFile.QWEATHER_API_KEY?.trim();
  if (!host || !key) throw new Error('Set QWEATHER_API_HOST and QWEATHER_API_KEY in the environment or ignored local config file.');
  return { host, key };
}

function reserveRequest() {
  requireIgnored(budgetPath);
  let lock;
  const lockPath = `${budgetPath}.lock`;
  try {
    lock = openSync(lockPath, 'wx', 0o600);
  } catch {
    throw new Error('The local integration request budget is locked by another run.');
  }
  let used = 0;
  try {
    try {
      const saved = JSON.parse(readFileSync(budgetPath, 'utf8'));
      if (!Number.isSafeInteger(saved.used) || saved.used < 0) throw new Error();
      used = saved.used;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw new Error('The local integration request budget file is invalid.');
    }
    if (used >= budgetLimit) throw new Error('The local integration request budget of 4 has been exhausted.');
    // Persist the debit before network activity so failures and timeouts still consume budget.
    writeFileSync(budgetPath, `${JSON.stringify({ used: used + 1 })}\n`, { mode: 0o600 });
    return used + 1;
  } finally {
    closeSync(lock);
    unlinkSync(lockPath);
  }
}

const geoNanjing = process.argv.includes('--geo-nanjing');
if (!process.argv.includes('--live') && !geoNanjing) {
  console.error('Live integration is opt-in. Run: npm run test:integration:live');
  process.exit(2);
}

try {
  const { host, key } = credentials();
  const entryPoints = geoNanjing
    ? [path.join(root, 'src/location-search.ts'), path.join(root, 'src/weather-provider.ts'), path.join(root, 'src/http.ts')]
    : [path.join(root, 'src/weather-provider.ts'), path.join(root, 'src/renderer.ts'), path.join(root, 'src/http.ts')];
  const bundle = await esbuild.build({
    entryPoints,
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    outdir: 'out',
    plugins: [{
      name: 'obsidian-live-test-boundary',
      setup(build) {
        build.onResolve({ filter: /^obsidian$/ }, () => ({ path: 'obsidian', namespace: 'test-stub' }));
        build.onLoad({ filter: /.*/, namespace: 'test-stub' }, () => ({
          contents: 'module.exports = { requestUrl: async () => { throw new Error("Unexpected requestUrl use"); } };',
          loader: 'js',
        }));
      },
    }],
  });
  const modules = new Map();
  for (const output of bundle.outputFiles) {
    const loaded = { exports: {} };
    new Function('module', 'exports', output.text)(loaded, loaded.exports);
    modules.set(path.basename(output.path, '.js'), loaded.exports);
  }
  const { currentWeather, formatApiCoordinate } = modules.get('weather-provider');
  const { getJson } = modules.get('http');
  const location = geoNanjing ? undefined : { name: '北京（集成测试）', latitude: 39.9042, longitude: 116.4074 };
  let budgetUsed;
  const transport = async (url, apiKey) => {
    budgetUsed = reserveRequest();
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-QW-Api-Key': apiKey },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'error',
    });
    let json;
    try { json = await response.json(); } catch { json = undefined; }
    return { status: response.status, json };
  };
  if (geoNanjing) {
    const { searchLocations } = modules.get('location-search');
    const locations = await searchLocations(host, key, '南京', (requestHost, requestKey, requestPath) =>
      getJson(requestHost, requestKey, requestPath, transport));
    const city = locations.find((item) => item.name === '南京' && item.latitude === 32.0603 && item.longitude === 118.7969)
      || locations.find((item) => item.name === '南京');
    if (!city || !city.adm1 || !city.adm2 || !city.country || !Number.isFinite(city.latitude) || !Number.isFinite(city.longitude)) {
      throw new Error('GeoAPI response did not contain a complete Nanjing location.');
    }
    let weatherPath;
    await currentWeather(host, key, city, async (_host, _key, requestPath) => {
      weatherPath = requestPath;
      return { condition: { text: '集成测试' }, temperature: { value: 20, unit: '°C' } };
    });
    const expectedCoordinates = `/${formatApiCoordinate(city.latitude)}/${formatApiCoordinate(city.longitude)}?lang=zh`;
    if (!weatherPath?.includes(expectedCoordinates)) throw new Error('Parsed GeoAPI coordinates were not accepted by weather lookup.');
    process.stdout.write(`GeoAPI parsed: ${city.name} · ${city.adm2} · ${city.adm1} · ${city.country}; ${city.latitude}, ${city.longitude}\n`);
    process.stdout.write('Parsed location accepted by weather query parser (no weather HTTP request sent).\n');
  } else {
    const { renderWeather } = modules.get('renderer');
    const weather = await currentWeather(host, key, location, (requestHost, requestKey, requestPath) =>
      getJson(requestHost, requestKey, requestPath, transport));
    const rendered = renderWeather(location, weather).split(key).join('[REDACTED]');
    process.stdout.write(`${rendered}\n`);
  }
  process.stdout.write(`Live QWeather API integration passed. Request budget used: ${budgetUsed}/4.\n`);
} catch {
  process.stderr.write('Live QWeather API integration failed. Error details were suppressed to protect credentials. Any sent request consumed budget.\n');
  process.exitCode = 1;
}
