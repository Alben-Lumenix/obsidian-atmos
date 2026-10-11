import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadSourceModule } from './helpers.mjs';

const source = (name) => fileURLToPath(new URL(`../src/${name}.ts`, import.meta.url));

test('current weather parser keeps supported fields and applies the unit default', async () => {
  const { currentWeather } = await loadSourceModule(source('weather-provider'));
  const weather = await currentWeather('api.example', 'test-key', { name: '深圳', latitude: 22, longitude: 114 }, async () => ({
    condition: { text: '小雨' },
    temperature: { value: 18, unit: '°C' },
    feelsLike: { value: 17 },
    humidity: 0.82,
    metadata: { attributions: ['https://one.example', 'https://two.example'] },
  }));
  assert.deepEqual(weather, {
    condition: '小雨', temperature: 18, unit: '°C', feelsLike: 17, humidity: 0.82,
    attribution: ['https://one.example', 'https://two.example'],
  });

  const defaultUnit = await currentWeather('api.example', 'test-key', { name: '深圳', latitude: 22, longitude: 114 }, async () => ({
    condition: { text: '晴' }, temperature: { value: 23 },
  }));
  assert.equal(defaultUnit.unit, '°C');
  assert.equal(defaultUnit.feelsLike, undefined);
  assert.equal(defaultUnit.humidity, undefined);
});

test('current weather parser rejects incomplete service responses', async () => {
  const { currentWeather } = await loadSourceModule(source('weather-provider'));
  await assert.rejects(
    currentWeather('api.example', 'test-key', { name: '深圳', latitude: 22, longitude: 114 }, async () => ({
      condition: { text: '' }, temperature: { value: '20' },
    })),
    /天气服务返回的数据不完整/,
  );
});

test('manual coordinates accept legal boundaries and reject invalid input', async () => {
  const { parseCoordinates } = await loadSourceModule(source('location'));
  assert.deepEqual(parseCoordinates('-90', '180', ''), {
    name: '-90, 180', latitude: -90, longitude: 180,
  });
  assert.throws(() => parseCoordinates('90.0001', '0', 'outside'), /请输入有效坐标/);
  assert.throws(() => parseCoordinates('0', '-180.01', 'outside'), /请输入有效坐标/);
  assert.throws(() => parseCoordinates('', '0', 'empty'), /请输入有效坐标/);
});

test('city search reports empty queries and service error codes', async () => {
  const { searchLocations } = await loadSourceModule(source('location-search'));
  await assert.rejects(searchLocations('api.example', 'test-key', '  ', async () => ({})), /请输入城市或地区名称/);
  await assert.rejects(searchLocations('api.example', 'test-key', '深圳', async () => ({ code: '401' })), /城市搜索失败（代码 401）/);
});

test('HTTP boundary rejects missing credentials and malformed API hosts before requesting', async () => {
  const { getJson, normalizeApiHost } = await loadSourceModule(source('http'));
  assert.equal(normalizeApiHost('api.example'), 'https://api.example');
  await assert.rejects(getJson('api.example', ' ', '/weather'), /请先填写和风天气 API Key/);
  await assert.rejects(getJson('api.example/path', 'test-key', '/weather'), /API Host 只能填写 HTTPS 域名/);
});
