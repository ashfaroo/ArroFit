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

  // Try multiple title variations to maximize hit rate
  const titles = [
    title,
    name,
    name ? name.replace('The ', '') : null,
    name ? name + ', campus' : null,
  ].filter(Boolean);

  for (const t of titles) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(t)}&prop=pageimages&format=json&pithumbsize=900`;
      const res = await fetch(url);
      const data = await res.json();
      const pages = data.query.pages;
      const page = pages[Object.keys(pages)[0]];
      if (page && page.thumbnail && page.thumbnail.source) {
        // Make sure it's not a logo or person photo — filter small images
        if (page.thumbnail.width >= 300) {
          return { statusCode: 200, headers, body: JSON.stringify({ found: true, url: page.thumbnail.source }) };
        }
      }
    } catch(e) { continue; }
  }

  return { statusCode: 200, headers, body: JSON.stringify({ found: false }) };
};
