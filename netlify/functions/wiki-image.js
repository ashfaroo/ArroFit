exports.handler = async function(event) {
  const headers = { "Content-Type": "application/json" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }
  let body;
  try { body = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { name } = body;
  if (!name) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing name" }) };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing API key" }) };

  try {
    // Step 1: Search for the university to get a place_id
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name)}&inputtype=textquery&fields=place_id,photos&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.candidates || !searchData.candidates.length) {
      return { statusCode: 404, headers, body: JSON.stringify({ found: false }) };
    }

    const candidate = searchData.candidates[0];
    if (!candidate.photos || !candidate.photos.length) {
      return { statusCode: 404, headers, body: JSON.stringify({ found: false }) };
    }

    // Step 2: Get the photo using the photo_reference
    const photoRef = candidate.photos[0].photo_reference;
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`;

    // Step 3: Fetch and proxy the photo bytes
    const imgRes = await fetch(photoUrl);
    if (!imgRes.ok) return { statusCode: 404, headers, body: JSON.stringify({ found: false }) };

    const imgBuffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400"
      },
      body: Buffer.from(imgBuffer).toString("base64"),
      isBase64Encoded: true
    };

  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
