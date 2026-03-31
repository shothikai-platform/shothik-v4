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
        // Use ipapi.co for client-side IP geolocation.
        // This avoids exposing sensitive API keys (like Google Maps) in the client.
        // The free tier supports reasonable volume for client-side requests (rate limited per IP).
        const res = await fetch('https://ipapi.co/json/');

        if (!res.ok) {
           throw new Error("Failed to fetch location from ipapi.co");
        }

        const data = await res.json();

        if (data.country_name) {
          setLocation(data.country_name.toLowerCase());
        } else {
          throw new Error("Could not determine location from response");
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

  return { location, error, isLoading };
};

export default useGeolocation;
