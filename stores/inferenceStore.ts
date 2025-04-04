import { create } from "zustand";

interface InferenceStore {
  inferenceLabel: string;
  setInferenceLabel: (label: string) => void;
}

export const useInferenceStore = create<InferenceStore>((set) => ({
  inferenceLabel: "", // Default empty label
  setInferenceLabel: (label) => set({ inferenceLabel: label }),
}));
