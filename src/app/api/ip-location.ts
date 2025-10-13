// app/api/ip-location/route.ts
export const runtime = 'edge'; // works well on Vercel/Edge

export async function GET(req: Request) {
  const city = req.headers.get('x-vercel-ip-city');
  const region = req.headers.get('x-vercel-ip-country-region');
  const country = req.headers.get('x-vercel-ip-country');

  // If deployed on Vercel, the above headers are usually present.
  // If not present (local dev or other hosts), fall back to a public IP geolocation service.
  if (city || region || country) {
    return new Response(
      JSON.stringify({ city, region, country }),
      { headers: { 'content-type': 'application/json' } }
    );
  }

  try {
    // Fallback: IP-based JSON (no key) — simple & CORS-friendly
    // Note: For production, consider a paid provider or caching.
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return new Response(
        JSON.stringify({
          city: data.city ?? null,
          region: data.region ?? null,
          country: data.country_name ?? null,
        }),
        { headers: { 'content-type': 'application/json' } }
      );
    }
  } catch {
    // ignore
  }

  return new Response(JSON.stringify({ city: null, region: null, country: null }), {
    headers: { 'content-type': 'application/json' },
  });
}
