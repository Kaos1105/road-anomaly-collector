import { useEffect, useState } from "react";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";

export function useLocation() {
  // const [location, setLocation] = useState<Location.LocationObject | null>(
  //   null,
  // );

  useEffect(() => {
    // Request location permissions
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Location permission denied",
        });
      }
    })();
  }, []);

  const getLocation = async () => {
    try {
      let loc = await Location.getCurrentPositionAsync({});
      return loc.coords;
    } catch (error) {
      console.error("Failed to get location", error);
      Toast.show({
        type: "error",
        text1: "Failed to get location",
      });
      return { latitude: 0, longitude: 0 }; // Default to avoid crash
    }
  };

  return { getLocation };
}
