import type { Route } from "./+types/api.places-search";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    throw new Response('Method not allowed', { status: 405 });
  }

  const formData = await request.formData();
  const query = formData.get('query')?.toString();

  if (!query) {
    return Response.json({ error: 'Query is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }

  try {
    // Google Places Text Search API呼び出し
    // language=ja: 日本語で住所を取得
    // region=jp: 日本地域を優先して検索
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=ja&region=jp&key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Places API request failed');
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results) {
      const results = data.results.slice(0, 5).map((result: any) => ({
        place_id: result.place_id,
        name: result.name,
        formatted_address: result.formatted_address,
        geometry: {
          location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          }
        }
      }));

      return Response.json({ success: true, results });
    } else {
      return Response.json({ success: false, results: [], error: data.status });
    }
  } catch (error) {
    console.error('Places search error:', error);
    return Response.json({ error: 'Failed to search places' }, { status: 500 });
  }
}