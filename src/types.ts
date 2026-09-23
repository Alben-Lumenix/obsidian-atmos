export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  adm1?: string;
  adm2?: string;
  country?: string;
}

export interface WeatherData {
  condition: string;
  temperature: number;
  unit: string;
  feelsLike?: number;
  humidity?: number;
  attribution: string[];
}

export interface AtmosSettings {
  apiHost: string;
  apiKey: string;
  location: Location | null;
}

export const DEFAULT_SETTINGS: AtmosSettings = {
  apiHost: '',
  apiKey: '',
  location: null,
};
