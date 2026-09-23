import { AtmosError } from './errors';
import type { Location } from './types';

export function parseCoordinates(latitudeText: string, longitudeText: string, name: string): Location {
  const latitude = Number(latitudeText.trim());
  const longitude = Number(longitudeText.trim());
  if (!latitudeText.trim() || !longitudeText.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new AtmosError('请输入有效坐标：纬度 -90～90，经度 -180～180。');
  }
  return { name: name.trim() || `${latitude}, ${longitude}`, latitude, longitude };
}

export function locationLabel(location: Location): string {
  return [location.name, location.adm2, location.adm1, location.country]
    .filter((value, index, all) => value && all.indexOf(value) === index)
    .join(' · ');
}
