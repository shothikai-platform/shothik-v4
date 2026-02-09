"use client";

import { useEffect, useState } from "react";
import { getUserLocation } from "@/utils/getUserLocation";

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchLocation = async () => {
      try {
        const data = await getUserLocation();

        if (mounted) {
          if (data && data.country) {
            setLocation(data.country.toLowerCase());
          } else {
            setError("Could not determine location");
          }
        }
      } catch (err) {
        if (mounted) {
          console.error("Geolocation error:", err);
          setError(err.message || "Unknown error");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return { location, isLoading, error };
};

export default useGeolocation;
