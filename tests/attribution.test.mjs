import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadSourceModule } from './helpers.mjs';

const source = (name) => fileURLToPath(new URL(`../src/${name}.ts`, import.meta.url));

test('weather rendering always links QWeather and retains every valid metadata attribution', async () => {
  const { renderWeather } = await loadSourceModule(source('renderer'));
  const rendered = renderWeather(
    { name: '深圳' },
    {
      condition: '多云', temperature: 25, unit: '°C', feelsLike: 27, humidity: 0.63,
      attribution: ['https://developer.qweather.com/attribution.html', 'https://source.example/data'],
    },
  );

  assert.equal(rendered, '深圳：多云，25°C · 体感 27°C · 湿度 63%\n\n数据来源：[和风天气](https://www.qweather.com)；其他归因：[developer.qweather.com](<https://developer.qweather.com/attribution.html>)、[source.example](<https://source.example/data>)');
});

test('missing and malformed attribution metadata cannot damage Markdown', async () => {
  const { currentWeather } = await loadSourceModule(source('weather-provider'));
  const { renderWeather } = await loadSourceModule(source('renderer'));
  const fixtures = [
    { condition: { text: '晴' }, temperature: { value: 20 }, metadata: { attributions: null } },
    { condition: { text: '晴' }, temperature: { value: 20 }, metadata: { attributions: ['not a URL', 'javascript:alert(1)', 42, null, 'https://valid.example/a(b)'] } },
    { condition: { text: '晴' }, temperature: { value: 20 }, metadata: null },
  ];

  const first = await currentWeather('api.example', 'test-key', { name: '深圳', latitude: 22, longitude: 114 }, async () => fixtures[0]);
  assert.deepEqual(first.attribution, []);
  assert.match(renderWeather({ name: '深圳' }, first), /\n\n数据来源：\[和风天气\]\(https:\/\/www\.qweather\.com\)/);

  const second = await currentWeather('api.example', 'test-key', { name: '深圳', latitude: 22, longitude: 114 }, async () => fixtures[1]);
  assert.deepEqual(second.attribution, ['not a URL', 'javascript:alert(1)', 'https://valid.example/a(b)']);
  const rendered = renderWeather({ name: '深圳' }, second);
  assert.match(rendered, /https:\/\/valid\.example\/a\(b\)/);
  assert.doesNotMatch(rendered, /javascript:|not a URL|undefined|null/);
  assert.equal(rendered.split('\n').length, 3);

  const third = await currentWeather('api.example', 'test-key', { name: '深圳', latitude: 22, longitude: 114 }, async () => fixtures[2]);
  assert.deepEqual(third.attribution, []);
});
