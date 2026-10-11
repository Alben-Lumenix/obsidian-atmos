import esbuild from 'esbuild';

export async function loadSourceModule(entryPoint) {
  const result = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    plugins: [{
      name: 'obsidian-test-stub',
      setup(build) {
        build.onResolve({ filter: /^obsidian$/ }, () => ({ path: 'obsidian', namespace: 'test-stub' }));
        build.onLoad({ filter: /.*/, namespace: 'test-stub' }, () => ({
          contents: 'module.exports = { requestUrl: async () => { throw new Error("Unexpected network request in test"); } };',
          loader: 'js',
        }));
      },
    }],
  });
  const loaded = { exports: {} };
  new Function('module', 'exports', result.outputFiles[0].text)(loaded, loaded.exports);
  return loaded.exports;
}
