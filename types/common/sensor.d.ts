export type SensorData = {
  recordDateTime: string;
  timestamp: string;
  gyroMag: number;
  accelMag: number;
  latitude: number | null;
  longitude: number | null;
  markAnomaly: number;
};
