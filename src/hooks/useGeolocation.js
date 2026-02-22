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
        // Sentinel: Removed insecure Google API key usage.
        // Replaced with secure, free IP geolocation services.

        // 1. Primary: Use ipwho.is (Free, HTTPS, No Key)
        try {
          const res = await fetch("https://ipwho.is/");
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              country = data.country;
            }
          }
        } catch (e) {
          console.warn("Primary geolocation (ipwho.is) failed, trying fallback...", e);
        }

        // 2. Fallback: Use ipapi.co (Free, HTTPS, No Key)
        if (!country) {
          try {
            const res = await fetch("https://ipapi.co/json/");
            if (res.ok) {
              const data = await res.json();
              country = data.country_name;
            }
          } catch (e) {
            console.warn("Fallback geolocation (ipapi.co) failed", e);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { location, isLoading, error };
};

export default useGeolocation;
