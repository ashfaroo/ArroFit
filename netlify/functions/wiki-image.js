exports.handler = async function(event) {
  const headers = { "Content-Type": "application/json" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }
  let body;
  try { body = JSON.parse(event.body); } 
  catch(e) { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { title } = body;
  if (!title) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing title" }) };

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const page = pages[Object.keys(pages)[0]];
    if (!page || !page.thumbnail) {
      return { statusCode: 200, headers, body: JSON.stringify({ found: false }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ found: true, url: page.thumbnail.source }) };
  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
