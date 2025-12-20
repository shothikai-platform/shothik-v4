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
        // Call Google Geolocation API directly from client
        // This way Google sees the user's IP, not your server's IP
        const geolocationResponse = await fetch(
          `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GOOGLE_GEOLOCATION_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              considerIp: true, // Uses the client's IP address
            }),
          },
        );

        if (!geolocationResponse.ok) {
          const errorData = await geolocationResponse.json();
          throw new Error(
            errorData.error?.message || "Failed to get geolocation",
          );
        }

        const geolocationData = await geolocationResponse.json();

        if (!geolocationData.location) {
          throw new Error("No location data received");
        }

        const { lat, lng } = geolocationData.location;
        const accuracy = geolocationData.accuracy;

        console.log("Geolocation data:", { lat, lng, accuracy });

        // Now get detailed address information
        const geocodingResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_GEOLOCATION_KEY}`,
        );

        if (!geocodingResponse.ok) {
          throw new Error("Failed to get address details");
        }

        const geocodingData = await geocodingResponse.json();

        console.log(geocodingData, "geo coding data");

        if (!geocodingData.results || geocodingData.results.length === 0) {
          throw new Error("No address found for location");
        }

        // Extract detailed location information
        const detailedAddress = geocodingData.results[0];
        const addressComponents = detailedAddress.address_components;

        const locationData = {
          formattedAddress: detailedAddress.formatted_address,
          latitude: lat,
          longitude: lng,
          accuracy: accuracy, // In meters
          city:
            addressComponents.find((c) => c.types.includes("locality"))
              ?.long_name ||
            addressComponents.find((c) =>
              c.types.includes("administrative_area_level_2"),
            )?.long_name ||
            null,
          state:
            addressComponents.find((c) =>
              c.types.includes("administrative_area_level_1"),
            )?.long_name || null,
          country:
            addressComponents.find((c) => c.types.includes("country"))
              ?.long_name || null,
          countryCode:
            addressComponents.find((c) => c.types.includes("country"))
              ?.short_name || null,
          postalCode:
            addressComponents.find((c) => c.types.includes("postal_code"))
              ?.long_name || null,
        };

        // console.log("Final location data:", locationData);
        setLocation(locationData.country.toLowerCase());
      } catch (err) {
        console.error("Geolocation error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { location };
};

export default useGeolocation;
