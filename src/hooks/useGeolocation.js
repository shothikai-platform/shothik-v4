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

        // 1. Call internal API which uses server-side IP detection and handles auth
        try {
          const res = await fetch("/api/geolocation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (res.ok) {
            const data = await res.json();
            country = data.location;
          }
        } catch (apiErr) {
          console.warn("Internal Geolocation API failed, trying fallback...", apiErr);
        }

        // 2. Fallback to free client-side IP geolocation if internal API failed or returned nothing
        if (!country) {
          const fallbackRes = await fetch("https://ipapi.co/json/");
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            country = data.country_name;
          }
        }

        if (country) {
          setLocation(country.toLowerCase());
        } else {
          throw new Error("Could not determine location");
        }
      } catch (err) {
        console.error("Geolocation hook error:", err);
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
