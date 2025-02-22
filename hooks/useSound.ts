import { useEffect, useState } from "react";
import { Audio } from "expo-av";

export function useSound() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    // Load beep sound
    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/beep.mp3"),
      );
      setSound(sound);
    })();

    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const playBeep = () => {
    if (sound) {
      sound.playAsync().then();
    }
  };

  return { playBeep };
}
