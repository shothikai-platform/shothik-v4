import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";

export async function POST() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_GEOLOCATION_KEY; // Server-side env var

  if (!apiKey) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  try {
    const geolocationResponse = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!geolocationResponse.ok) {
      throw new Error("Invalid response from geolocation API");
    }

    const geolocationData = await geolocationResponse.json();

    if (!geolocationData.location) {
      throw new Error("Invalid response from geolocation API");
    }

    const { lat, lng } = geolocationData.location;

    const geocodingResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
    );

    if (!geocodingResponse.ok) {
      throw new Error("Invalid response from geocoding API");
    }

    const geocodingData = await geocodingResponse.json();

    if (!geocodingData.results) {
      throw new Error("Invalid response from geocoding API");
    }

    const countryResult = geocodingData.results.find((result) =>
      result.types.includes("country"),
    );

    if (!countryResult?.formatted_address) {
      throw new Error("Country not found in geocoding response");
    }

    const country = countryResult.formatted_address.toLowerCase();

    return NextResponse.json({ location: country });
  } catch (error) {
    console.error("Geolocation error:", error);
    return NextResponse.json(
      { error: "Failed to determine location" },
      { status: 500 },
    );
  }
}
