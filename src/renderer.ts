import type { Location, WeatherData } from './types';

const QWEATHER_URL = 'https://www.qweather.com';

function attributionLinks(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const links = new Map<string, string>();
  for (const value of values) {
    if (typeof value !== 'string') continue;
    try {
      const url = new URL(value.trim());
      if ((url.protocol !== 'https:' && url.protocol !== 'http:') || !url.hostname || url.username || url.password) continue;
      if (url.href === `${QWEATHER_URL}/` || url.href === QWEATHER_URL) continue;
      const label = url.hostname.replace(/^www\./, '');
      links.set(url.href, `[${label}](<${url.href}>)`);
    } catch {
      // Ignore malformed metadata so it cannot break the inserted Markdown.
    }
  }
  return [...links.values()];
}

export function renderWeather(location: Location, weather: WeatherData): string {
  const place = location.name.replace(/[\r\n|]/g, ' ').trim();
  const parts = [`${place}：${weather.condition}，${weather.temperature}${weather.unit}`];
  if (weather.feelsLike !== undefined) parts.push(`体感 ${weather.feelsLike}${weather.unit}`);
  if (weather.humidity !== undefined) parts.push(`湿度 ${Math.round(weather.humidity * 100)}%`);
  const otherAttributions = attributionLinks(weather.attribution);
  const additional = otherAttributions.length ? `；其他归因：${otherAttributions.join('、')}` : '';
  return `${parts.join(' · ')}\n\n数据来源：[和风天气](${QWEATHER_URL})${additional}`;
}
