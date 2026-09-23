import type { Location, WeatherData } from './types';

export function renderWeather(location: Location, weather: WeatherData): string {
  const place = location.name.replace(/[\r\n|]/g, ' ').trim();
  const parts = [`${place}：${weather.condition}，${weather.temperature}${weather.unit}`];
  if (weather.feelsLike !== undefined) parts.push(`体感 ${weather.feelsLike}${weather.unit}`);
  if (weather.humidity !== undefined) parts.push(`湿度 ${Math.round(weather.humidity * 100)}%`);
  const attribution = weather.attribution.length ? `（数据来源：[和风天气](${weather.attribution[0]})）` : '（数据来源：和风天气）';
  return `${parts.join(' · ')} ${attribution}`;
}
