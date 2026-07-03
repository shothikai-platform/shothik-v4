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

        // 1. Try secure server-side API first
        try {
          const res = await fetch('/api/geolocation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ considerIp: true })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.location) {
              country = data.location;
            }
          }
        } catch (err) {
          console.warn("Internal Geolocation API failed, trying fallback...", err);
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
