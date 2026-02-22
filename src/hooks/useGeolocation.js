"use client";

import { useEffect, useState } from "react";

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoading(true);
      let country = null;

      try {
        // 1. Try ipwho.is (free, no key required, supports HTTPS)
        // Sentinel: Replaced exposed Google API key with free secure alternative.
        try {
          const res = await fetch("https://ipwho.is/");
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.country) {
              country = data.country;
            }
          }
        } catch (err) {
          console.warn("ipwho.is failed, trying fallback...", err);
        }

        // 2. Fallback to ipapi.co (free, rate limited) if primary failed
        if (!country) {
          try {
            const res = await fetch("https://ipapi.co/json/");
            if (res.ok) {
              const data = await res.json();
              // ipapi.co returns 'country_name'
              if (data.country_name) {
                country = data.country_name;
              }
            }
          } catch (err) {
            console.warn("ipapi.co fallback failed", err);
          }
        }

        if (country) {
          setLocation(country.toLowerCase());
        } else {
          throw new Error("Could not determine location from any provider");
        }
      } catch (err) {
        console.error("Geolocation error:", err);
        setError(err.message);
        // Default to something safe if everything fails, or keep null
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { location, isLoading, error };
};

export default useGeolocation;
