"use client";

import { useEffect, useState } from "react";

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoading(true);

      try {
        let country = null;

        // 1. Try internal secure Geolocation API
        try {
          const response = await fetch("/api/geolocation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.location) {
              country = data.location;
            }
          }
        } catch (apiErr) {
          console.warn(
            "Internal Geolocation API failed, trying fallback...",
            apiErr,
          );
        }

        // 2. Fallback to free IP geolocation if internal API failed or returned no location
        if (!country) {
          const res = await fetch("https://ipapi.co/json/");
          if (res.ok) {
            const data = await res.json();
            country = data.country_name;
          }
        }

        if (country) {
          setLocation(country.toLowerCase());
        } else {
          throw new Error("Could not determine location");
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
