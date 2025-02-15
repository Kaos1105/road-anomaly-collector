import { useSensorData } from "@/hooks/useSensorData";
import { useLocation } from "@/hooks/useLocation";
import { SensorData } from "@/types/common/sensor";
import { useStore } from "@/stores/stores";
import { useEffect } from "react";

class CircularBuffer<T> {
  private buffer: (T | null)[];
  private index: number;
  private readonly overlapSize: number;

  constructor(
    private readonly size: number,
    overlap: number,
  ) {
    this.buffer = new Array(size).fill(null);
    this.index = 0;
    this.overlapSize = overlap;
  }

  add(data: T): void {
    if (this.index >= this.size) {
      // Shift last `overlapSize` elements to the beginning
      for (let i = 0; i < this.overlapSize; i++) {
        this.buffer[i] = this.buffer[this.size - this.overlapSize + i];
      }
      this.index = this.overlapSize; // Continue filling after overlap
    }

    this.buffer[this.index] = data;
    this.index++;
  }

  public getData(): T[] {
    return this.buffer
      .slice(0, this.index)
      .filter((item): item is T => item !== null);
  }
}

// Buffer settings (10s window = 500 samples, 1s overlap = 50 samples at 50hz)
const WINDOW_SIZE = 500;
const OVERLAP_SIZE = 50;

export function useCircularBuffer<T>() {
  const { gyroData, accelData, getMagnitudeData } = useSensorData();
  const { getLocation } = useLocation();
  const buffer = new CircularBuffer<SensorData>(WINDOW_SIZE, OVERLAP_SIZE);

  const getSensorData = async (): Promise<SensorData> => {
    const now = new Date();
    const timestamp = now.toISOString();
    const readableTime = now.toLocaleString("en-GB", { timeZone: "UTC" }); // Convert to human-readable format
    const loc = await getLocation();

    // Store data in the circular buffer
    return {
      timestamp,
      recordDateTime: readableTime,
      latitude: loc?.latitude || 0,
      longitude: loc?.longitude || 0,
      gyroMag: getMagnitudeData(gyroData),
      accelMag: getMagnitudeData(accelData),
      markAnomaly: 0,
    };
  };

  return { buffer, getSensorData };
}
