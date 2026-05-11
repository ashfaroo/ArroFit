exports.handler = async function(event) {
  const headers = { "Content-Type": "application/json" };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing GOOGLE_PLACES_API_KEY" }) };

  // GET request = test mode
  if (event.httpMethod === 'GET') {
    try {
      const testRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.displayName,places.photos'
        },
        body: JSON.stringify({ textQuery: 'Harvard University campus' })
      });
      const data = await testRes.json();
      return { statusCode: 200, headers, body: JSON.stringify({
        apiKeyPresent: true,
        httpStatus: testRes.status,
        error: data.error,
        placesFound: data.places?.length,
        hasPhotos: data.places?.[0]?.photos?.length > 0,
        photoCount: data.places?.[0]?.photos?.length
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
    // Step 1: Search using Places API (New)
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.photos'
      },
      body: JSON.stringify({ textQuery: name + ' university campus' })
    });
    const searchData = await searchRes.json();

    if (!searchData.places?.length || !searchData.places[0].photos?.length) {
      return { statusCode: 200, headers, body: JSON.stringify({ found: false, debug: JSON.stringify(searchData).slice(0,200) }) };
    }

    // Step 2: Fetch the photo
    const photoName = searchData.places[0].photos[0].name;
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey}`;
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
