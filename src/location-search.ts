import { AtmosError } from './errors';
import { getJson } from './http';
import type { Location } from './types';

interface QWeatherCity {
  name?: string;
  lat?: string;
  lon?: string;
  adm1?: string;
  adm2?: string;
  country?: string;
}
interface QWeatherLookup { code?: string; location?: QWeatherCity[] }

export async function searchLocations(host: string, key: string, query: string): Promise<Location[]> {
  if (!query.trim()) throw new AtmosError('请输入城市或地区名称。');
  const params = new URLSearchParams({ location: query.trim(), range: 'cn', lang: 'zh', number: '10' });
  const data = await getJson<QWeatherLookup>(host, key, `/geo/v2/city/lookup?${params}`);
  if (data.code !== '200') throw new AtmosError(`城市搜索失败（代码 ${data.code || '未知'}）。`);
  return (data.location || []).flatMap((item) => {
    const latitude = Number(item.lat);
    const longitude = Number(item.lon);
    if (!item.name || !item.lat || !item.lon || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
    return [{ name: item.name, latitude, longitude, adm1: item.adm1, adm2: item.adm2, country: item.country }];
  });
}
