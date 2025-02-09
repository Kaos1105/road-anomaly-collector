import { useSensorData } from "@/hooks/useSensorData";
import { useLocation } from "@/hooks/useLocation";
import { SensorData } from "@/types/common/sensor";
import { useStore } from "@/stores/stores";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSQLRecord } from "@/hooks/useSQLRecord";
import { useSound } from "@/hooks/useSound";

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

// Buffer settings (30s window = 150 samples, 1s overlap = 5 samples)
const WINDOW_SIZE = 200;
const OVERLAP_SIZE = 100;

export function useCircularBuffer<T>() {
  const { gyroData, accelData, gyroMag, accelMag } = useSensorData();
  const { getLocation } = useLocation();
  const { commonStore } = useStore();

  const buffer = new CircularBuffer<SensorData>(WINDOW_SIZE, OVERLAP_SIZE);

  // Check if an anomaly is detected
  useEffect(() => {
    (async () => {
      if (!commonStore.isLogging || !gyroData || !accelData) return;
      const now = new Date();
      const timestamp = now.toISOString();
      const readableTime = now.toLocaleString("en-GB", { timeZone: "UTC" }); // Convert to human-readable format
      const loc = await getLocation();

      // Store data in the circular buffer
      buffer.add({
        timestamp,
        recordDateTime: readableTime,
        latitude: loc?.latitude || 0,
        longitude: loc?.longitude || 0,
        gyroMag: gyroMag(gyroData),
        accelMag: accelMag(accelData),
        markAnomaly: 0,
      });
    })();
  }, [gyroData, accelData, commonStore.isLogging]);

  return { buffer };
}
