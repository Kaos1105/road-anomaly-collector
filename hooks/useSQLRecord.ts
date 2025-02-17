import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "@/stores/stores";

export function useSQLRecord() {
  const { commonStore } = useStore();
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [sensorData, setSensorData] = useState([]);

  // Open SQLite Database
  useEffect(() => {
    (async () => {
      await initDatabase();
    })();
  }, []);

  const saveToDatabase = async () => {
    if (!db) return;
    const uuid = uuidv4();
    const data = commonStore.buffer.getData();

    try {
      for (const {
        timestamp,
        recordDateTime,
        latitude,
        longitude,
        gyroMag,
        accelMag,
        markAnomaly,
      } of data) {
        await db.runAsync(
          `INSERT INTO sensor_data (uuid, timestamp, record_date_time, latitude, longitude, gyro_mag,
                                              accel_mag, mark_anomaly)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            uuid,
            timestamp,
            recordDateTime,
            latitude,
            longitude,
            gyroMag,
            accelMag,
            markAnomaly,
          ],
        );
      }
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  // function fetchSensorData() {
  //   if (!db) return;
  //   const allRows = (await = db.getAllSync(
  //     "SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 10;",
  //   ));
  //   for (const row of allRows) {
  //     console.log(row.id, row.value, row.intValue);
  //   }
  // }

  const markLast5Seconds = async () => {
    if (!db) return;
    try {
      await db.execAsync(
        `UPDATE sensor_data
                 SET mark_anomaly = 1
                 WHERE timestamp >= strftime('%Y-%m-%d %H:%M:%S', 'now', '-5 seconds');`,
      );
    } catch (error) {
      console.error("Error updating last 5 seconds:", error);
    }
  };

  const initDatabase = async () => {
    try {
      const initDb = await SQLite.openDatabaseAsync("road_anomalies.db");
      setDb(initDb);

      await initDb.execAsync(
        `CREATE TABLE IF NOT EXISTS sensor_data
                 (
                     id               INTEGER PRIMARY KEY AUTOINCREMENT,
                     uuid             TEXT,
                     timestamp        TEXT,
                     record_date_time TEXT,
                     latitude         REAL,
                     longitude        REAL,
                     gyro_mag         REAL,
                     accel_mag        REAL,
                     mark_anomaly     INTEGER DEFAULT 0
                 );`,
      );
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  };

  return { saveToDatabase, markLast5Seconds };
}
