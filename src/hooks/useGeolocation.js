"use client";

import { useUserLocation } from "@/hooks/utils/useUserLocation";

const useGeolocation = () => {
  const { country, loading, error } = useUserLocation();
  const location = country ? country.toLowerCase() : null;

  return { location, isLoading: loading, error };
};

export default useGeolocation;
