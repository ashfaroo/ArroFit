exports.handler = async function(event) {
  const headers = { "Content-Type": "application/json" };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing GOOGLE_PLACES_API_KEY" }) };

  // GET request = test mode, returns debug info
  if (event.httpMethod === 'GET') {
    try {
      const testUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Harvard+University&inputtype=textquery&fields=place_id,photos,name&key=${apiKey}`;
      const res = await fetch(testUrl);
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ 
        apiKeyPresent: true,
        apiKeyPrefix: apiKey.slice(0,8) + '...',
        status: data.status,
        error_message: data.error_message,
        candidates: data.candidates?.length,
        hasPhotos: data.candidates?.[0]?.photos?.length > 0
      })};
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { name } = body;
  if (!name) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing name" }) };

  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name + ' university')}&inputtype=textquery&fields=place_id,photos,name&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status !== 'OK' || !searchData.candidates?.length) {
      return { statusCode: 200, headers, body: JSON.stringify({ found: false, status: searchData.status }) };
    }

    const candidate = searchData.candidates[0];
    if (!candidate.photos?.length) {
      return { statusCode: 200, headers, body: JSON.stringify({ found: false, reason: 'no photos' }) };
    }

    const photoRef = candidate.photos[0].photo_reference;
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`;
    const imgRes = await fetch(photoUrl);

    if (!imgRes.ok) {
      return { statusCode: 200, headers, body: JSON.stringify({ found: false, reason: 'photo fetch failed: ' + imgRes.status }) };
    }

    const imgBuffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";

    return {
      statusCode: 200,
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" },
      body: Buffer.from(imgBuffer).toString("base64"),
      isBase64Encoded: true
    };

  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
