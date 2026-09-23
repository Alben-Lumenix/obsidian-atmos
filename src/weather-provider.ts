import { AtmosError } from './errors';
import { getJson } from './http';
import type { Location, WeatherData } from './types';

interface QWeatherCurrent {
  condition?: { text?: string };
  temperature?: { value?: number; unit?: string };
  feelsLike?: { value?: number };
  humidity?: number;
  metadata?: { attributions?: string[] };
}

export async function currentWeather(host: string, key: string, location: Location): Promise<WeatherData> {
  const query = new URLSearchParams({ lang: 'zh' });
  const data = await getJson<QWeatherCurrent>(host, key, `/weather/v1/current/${location.latitude}/${location.longitude}?${query}`);
  if (!data.condition?.text || typeof data.temperature?.value !== 'number') {
    throw new AtmosError('天气服务返回的数据不完整，无法插入笔记。');
  }
  return {
    condition: data.condition.text,
    temperature: data.temperature.value,
    unit: data.temperature.unit || '°C',
    feelsLike: typeof data.feelsLike?.value === 'number' ? data.feelsLike.value : undefined,
    humidity: typeof data.humidity === 'number' ? data.humidity : undefined,
    attribution: Array.isArray(data.metadata?.attributions) ? data.metadata.attributions.filter((item) => /^https:\/\//.test(item)) : [],
  };
}
