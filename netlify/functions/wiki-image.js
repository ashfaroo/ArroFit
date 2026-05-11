exports.handler = async function(event) {
  const headers = { "Content-Type": "application/json" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }
  let body;
  try { body = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { title, name } = body;
  if (!title && !name) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing title" }) };

  const titles = [title, name].filter(Boolean);

  for (const t of titles) {
    try {
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(t)}&prop=pageimages&format=json&pithumbsize=900`;
      const res = await fetch(apiUrl, {
        headers: {
          "User-Agent": "ArrofitAI/1.0 (https://arrofitai.com; hello@arrofitai.com)",
          "Accept": "application/json"
        }
      });
      const data = await res.json();
      const pages = data.query.pages;
      const page = pages[Object.keys(pages)[0]];
      if (page && page.thumbnail && page.thumbnail.source && page.thumbnail.width >= 200) {
        // Proxy the image through our function to avoid browser CORS/hotlink issues
        const imgRes = await fetch(page.thumbnail.source, {
          headers: {
            "User-Agent": "ArrofitAI/1.0 (https://arrofitai.com; hello@arrofitai.com)",
            "Referer": "https://en.wikipedia.org"
          }
        });
        if (imgRes.ok) {
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
        }
      }
    } catch(e) { continue; }
  }

  return { statusCode: 404, headers, body: JSON.stringify({ found: false }) };
};
