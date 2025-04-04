import { SensorData } from "@/types/common/sensor";
import { scaleLinear } from "d3-scale";
import * as FileSystem from "expo-file-system";
import * as math from "mathjs";
import * as ss from "simple-statistics";
import { useEffect, useState } from "react";
import { Asset } from "expo-asset";
import { InferenceSession, Tensor } from "onnxruntime-react-native";
import { useCommonStore } from "@/stores/commonStore";

export function useInference() {
  const [session, setSession] = useState<InferenceSession>();
  const [scalerParams, setScalerParams] = useState<{
    mean: number[];
    scale: [];
  } | null>();
  const commonStore = useCommonStore();

  const [labelEncoderClasses, setLabelEncoderClasses] = useState<string[]>([]);

  const loadModel = async () => {
    try {
      const modelAsset = Asset.fromModule(
        require("../assets/models/xgb_model.onnx"),
      );
      await modelAsset.downloadAsync();
      const modelUri = modelAsset.localUri || modelAsset.uri;
      const inferenceSession = await InferenceSession.create(modelUri);
      setSession(inferenceSession);

      // Load scaler parameters
      const scalerAsset = Asset.fromModule(
        require("../assets/models/scaler_params.txt"),
      );
      await scalerAsset.downloadAsync();
      const scalerUri = scalerAsset.localUri || scalerAsset.uri;
      const scalerData = await FileSystem.readAsStringAsync(scalerUri);
      setScalerParams(JSON.parse(scalerData));

      // Load label encoder classes
      const encoderAsset = Asset.fromModule(
        require("../assets/models/label_encoder_classes.txt"),
      );
      await encoderAsset.downloadAsync();
      const encoderUri = encoderAsset.localUri || encoderAsset.uri;
      const encoderData = await FileSystem.readAsStringAsync(encoderUri);
      setLabelEncoderClasses(JSON.parse(encoderData));
    } catch (error) {
      console.error("Error loading model:", error);
    }
  };

  // StandardScaler implementation in JavaScript
  const scaleFeatures = (
    features: number[],
    mean: number[],
    scale: number[],
  ) => {
    return features.map((x, i) => (x - mean[i]) / scale[i]);
  };

  useEffect(() => {
    (async () => {
      await loadModel();
    })();
  }, []);

  const makePrediction = async (data: Array<SensorData>) => {
    if (!session || !scalerParams || !labelEncoderClasses) {
      return null;
    }

    try {
      // Parse input features
      const features = await extractDataFeature(data);

      // Scale features
      const scaledFeatures = scaleFeatures(
        features,
        scalerParams.mean,
        scalerParams.scale,
      );

      // Prepare input tensor
      const inputTensor = new Tensor(
        "float32",
        new Float32Array(scaledFeatures),
        [1, scaledFeatures.length],
      );

      // Run inference
      const inputName = session.inputNames[0]; // Get the input name dynamically
      const outputMap = await session.run({ [inputName]: inputTensor });
      const outputTensor = outputMap[session.outputNames[0]]; // Get the output tensor
      const predictedIndex = Number(outputTensor.data[0]); // Assuming single prediction

      // Map back to original label
      return labelEncoderClasses[Math.round(predictedIndex)];
    } catch (error) {
      console.error("Prediction error:", error);
    }
  };

  // Helper function for basic statistics
  const computeBasicStats = (data: number[]): number[] => {
    return [
      ss.mean(data),
      ss.standardDeviation(data),
      ss.min(data),
      ss.max(data),
      ss.sampleSkewness(data),
      ss.sampleKurtosis(data),
    ];
  };

  // Fast Fourier Transform (FFT)
  const computeFFT = (data: number[]): number[] => {
    const fftValues = math.abs(math.fft(data)) as number[];
    return fftValues.slice(0, Math.floor(data.length / 2)); // Only the first half of the FFT
  };

  // Calculate the dominant frequency and spectral entropy
  const computeFrequencyFeatures = (data: number[]): [number, number] => {
    const fftValues = computeFFT(data);
    const domFreq = fftValues.indexOf(Math.max(...fftValues)); // Most dominant frequency
    const spectralEntropy = -fftValues
      .map((v) => (v / math.sum(fftValues)) * Math.log2(v + 1e-6))
      .reduce((sum, value) => sum + value, 0); // Spectral entropy
    return [domFreq, spectralEntropy];
  };

  // Root Mean Square (RMS) for time-domain feature
  const computeRMS = (data: number[]): number => {
    return Math.sqrt(math.mean(data.map((x) => x * x)));
  };

  // Peak detection (based on local maxima above a certain threshold)
  const findPeaks = (data: number[], threshold: number): number[] => {
    const peaks: number[] = [];
    for (let i = 1; i < data.length - 1; i++) {
      if (
        data[i] > threshold &&
        data[i] > data[i - 1] &&
        data[i] > data[i + 1]
      ) {
        peaks.push(i);
      }
    }
    return peaks;
  };

  // Main feature extraction for one signal (gyro or accel)
  const extractXGBoostFeatures = (sensorData: number[]): number[] => {
    // Basic Stats
    const basicStats = computeBasicStats(sensorData);

    // Frequency Features (FFT)
    const [domFreq, spectralEntropy] = computeFrequencyFeatures(sensorData);

    // Time-Domain Features (RMS & Peaks)
    const rms = computeRMS(sensorData);
    const peaks = findPeaks(
      sensorData,
      ss.mean(sensorData) + ss.standardDeviation(sensorData),
    );

    // Combine All Features
    return [...basicStats, domFreq, spectralEntropy, rms, peaks.length];
  };

  // Function to extract features for both gyro and accel data
  const extractAllFeatures = (
    gyroData: number[],
    accelData: number[],
    timestamps: number[],
  ): number[] => {
    // Extract gyro features
    const gyroFeatures = extractXGBoostFeatures(gyroData);

    // Extract accel features
    const accelFeatures = extractXGBoostFeatures(accelData);

    // Compute time differences (for event duration)
    const timeDiffs = timestamps.slice(1).map((t, i) => t - timestamps[i]);
    const avgTimeGap = timeDiffs.length > 0 ? ss.mean(timeDiffs) : 0;

    // Cross-Signal Features
    const corr = ss.sampleCorrelation(gyroData, accelData); // Pearson correlation
    const meanDiff = ss.mean(
      gyroData.map((val, i) => Math.abs(val - accelData[i])),
    );
    const energyRatio =
      Math.sqrt(ss.mean(gyroData.map((x) => x * x))) /
      Math.sqrt(ss.mean(accelData.map((x) => x * x)));

    // Merge Features
    return [
      ...gyroFeatures,
      ...accelFeatures,
      avgTimeGap,
      corr,
      meanDiff,
      energyRatio,
    ];
  };

  const preprocessSensorData = async (
    data: Array<SensorData>,
    // filePath: string,
    targetFs = 50,
    duration = 2.0,
  ) => {
    // Read CSV file
    // const fileContent = await readAsStringAsync(filePath);
    // const { data } = Papa.parse(fileContent, {
    //   header: true,
    //   skipEmptyLines: true,
    // }) as { data: SensorData[] };
    //
    // const requiredCols = ["timestamp", "gyroMag", "accelMag"];
    // for (const col of requiredCols) {
    //   if (!data[0]?.hasOwnProperty(col)) {
    //     throw new Error(`CSV missing required column: ${col}`);
    //   }
    // }

    if (data.length === 0) throw new Error("Data array is empty");

    // Convert timestamps to relative time
    const minTime = data[0].timestamp;
    data.forEach((row) => (row.timestamp -= minTime));
    const totalTime = data[data.length - 1].timestamp;

    // Handle duplicate timestamps by averaging values
    const groupedData: Record<
      number,
      { gyroMag: number[]; accelMag: number[] }
    > = {};
    data.forEach(({ timestamp, gyroMag, accelMag }) => {
      if (!groupedData[timestamp]) {
        groupedData[timestamp] = { gyroMag: [], accelMag: [] };
      }
      groupedData[timestamp].gyroMag.push(gyroMag);
      groupedData[timestamp].accelMag.push(accelMag);
    });

    const uniqueData = Object.entries(groupedData).map(
      ([timestamp, values]) => ({
        timestamp: parseFloat(timestamp),
        gyroMag:
          values.gyroMag.reduce((a, b) => a + b, 0) / values.gyroMag.length,
        accelMag:
          values.accelMag.reduce((a, b) => a + b, 0) / values.accelMag.length,
      }),
    );

    // Normalize timestamps
    if (totalTime > 0) {
      uniqueData.forEach((row) => (row.timestamp *= duration / totalTime));
    }

    // Generate new evenly spaced timestamps
    const newTime = Array.from({ length: targetFs * duration }, (_, i) =>
      parseFloat(((i / (targetFs * duration - 1)) * duration).toFixed(4)),
    );

    // Create interpolation functions using d3-scale
    const gyroInterpolator = scaleLinear()
      .domain(uniqueData.map((d) => d.timestamp))
      .range(uniqueData.map((d) => d.gyroMag)); // Ensures extrapolation is limited

    const accelInterpolator = scaleLinear()
      .domain(uniqueData.map((d) => d.timestamp))
      .range(uniqueData.map((d) => d.accelMag));

    // Get interpolated values
    const newGyro = newTime.map((t) =>
      parseFloat(gyroInterpolator(t).toFixed(6)),
    );
    const newAccel = newTime.map((t) =>
      parseFloat(accelInterpolator(t).toFixed(6)),
    );
    return { newGyro, newAccel, newTime };
  };

  const extractDataFeature = async (data: Array<SensorData>) => {
    const { newGyro, newAccel, newTime } = await preprocessSensorData(data);
    return extractAllFeatures(newGyro, newAccel, newTime);
  };

  return { preprocessSensorData, extractDataFeature, makePrediction };
}
