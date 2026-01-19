
export interface DenoisedResult {
  calmDescription: string;
  emotionLevel: number;
  mindsetTip: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export enum AppSection {
  HOME = 'home',
  CURVE = 'curve',
  DASHBOARD = 'dashboard',
  DENOISER = 'denoiser',
  CALENDAR = 'calendar',
  MEDITATION = 'meditation',
  TIME_CAPSULE = 'time_capsule',
  ABOUT = 'about'
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
}

export interface AssetOption {
  id: string;
  label: string;
  query: string;
  color?: string;
}
