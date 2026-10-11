import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadSourceModule } from './helpers.mjs';

const source = (name) => fileURLToPath(new URL(`../src/${name}.ts`, import.meta.url));

test('weather API coordinates are rounded to two decimal places at the request boundary', async () => {
  const { currentWeather, formatApiCoordinate } = await loadSourceModule(source('weather-provider'));
  assert.equal(formatApiCoordinate(12.345), '12.35');
  assert.equal(formatApiCoordinate(-12.345), '-12.35');
  assert.equal(formatApiCoordinate(-0.005), '-0.01');
  assert.equal(formatApiCoordinate(90), '90.00');
  assert.equal(formatApiCoordinate(-180), '-180.00');

  const manualLocation = { name: 'manual', latitude: 12.345678, longitude: -45.678912 };
  let requestedPath;
  await currentWeather('api.example', 'test-key', manualLocation, async (_host, _key, path) => {
    requestedPath = path;
    return { condition: { text: '晴' }, temperature: { value: 20, unit: '°C' } };
  });
  assert.equal(requestedPath, '/weather/v1/current/12.35/-45.68?lang=zh');
  assert.equal(manualLocation.latitude, 12.345678);
  assert.equal(manualLocation.longitude, -45.678912);
});

test('search results keep their precision while weather requests use rounded coordinates', async () => {
  const { searchLocations } = await loadSourceModule(source('location-search'));
  const { currentWeather } = await loadSourceModule(source('weather-provider'));
  const locations = await searchLocations('api.example', 'test-key', '深圳', async () => ({
    code: '200',
    location: [{ name: '深圳', lat: '22.543096', lon: '114.057865' }],
  }));
  assert.equal(locations[0].latitude, 22.543096);
  assert.equal(locations[0].longitude, 114.057865);

  let requestedPath;
  await currentWeather('api.example', 'test-key', locations[0], async (_host, _key, path) => {
    requestedPath = path;
    return { condition: { text: '晴' }, temperature: { value: 20 } };
  });
  assert.equal(requestedPath, '/weather/v1/current/22.54/114.06?lang=zh');
});
