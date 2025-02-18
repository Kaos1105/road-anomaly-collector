export type SensorData = {
  recordDateTime: string;
  timestamp: number;
  gyroMag: number;
  accelMag: number;
  latitude: number | null;
  longitude: number | null;
  markAnomaly: number;
};
