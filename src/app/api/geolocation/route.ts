import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user IP from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(/, /)[0] : request.ip;

    if (!ip || ip === '127.0.0.1' || ip === '::1') {
       // For local development or if IP is missing, we might not be able to get location from IP
       // In production, x-forwarded-for should be present.
       // We can return a generic error or try to use a default.
       console.warn("Could not determine user IP for geolocation");
    }

    // Use a server-side IP geolocation service
    // ipapi.co or similar can be used here.
    // If we have a Google Key, we could use that, but IP-based is simpler for server-side
    const geolocationUrl = ip
      ? `https://ipapi.co/${ip}/json/`
      : `https://ipapi.co/json/`;

    const res = await fetch(geolocationUrl);
    if (!res.ok) {
        throw new Error("Failed to fetch location from IP service");
    }

    const data = await res.json();
    const country = data.country_name;

    if (!country) {
        throw new Error("Country not found in IP service response");
    }

    return NextResponse.json({ location: country.toLowerCase() });
  } catch (error) {
    console.error("Geolocation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
