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

        // 1. Try Google API via our server route
        try {
          const apiResponse = await fetch('/api/geolocation', {
            method: 'POST',
          });
          if (apiResponse.ok) {
            const data = await apiResponse.json();
            if (data.location) {
              country = data.location;
            }
          }
        } catch (apiErr) {
          console.warn("Server geolocation failed, trying fallback...", apiErr);
        }

        // 2. Fallback to free IP geolocation if Google failed or no key
        if (!country) {
          const res = await fetch('https://ipapi.co/json/');
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
        // Default to something safe if everything fails, or keep null
        // setLocation("bangladesh"); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { location };
};

export default useGeolocation;
