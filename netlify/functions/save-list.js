exports.handler = async function (event) {
  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const siteId = process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_TOKEN || process.env.NETLIFY_ACCESS_TOKEN;

  if (!siteId || !token) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing NETLIFY_SITE_ID or NETLIFY_TOKEN env vars" }) };
  }

  const baseUrl = `https://api.netlify.com/api/v1/blobs/${siteId}/college-lists`;

  // SAVE
  if (body.action === "save") {
    try {
      const adjectives = ["Tiger","Maple","River","Golden","Silver","Crimson","Bright","Swift","Noble","Falcon","Cedar","Sapphire","Ember","Willow","Cobalt"];
      const nouns = ["Path","Crest","Peak","Grove","Forge","Tide","Spark","Ridge","Shore","Vault","Drift","Bloom","Quest","Arrow","Bridge"];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const num = Math.floor(1000 + Math.random() * 9000);
      const code = `${adj}-${noun}-${num}`;

      const payload = JSON.stringify({
        savedAt: new Date().toISOString(),
        answers: body.answers || {},
        result: body.result || {}
      });

      const res = await fetch(`${baseUrl}/${code}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: payload
      });

      if (!res.ok) {
        const text = await res.text();
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Blob save failed: " + text }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, code }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Save error: " + err.message }) };
    }
  }

  // LOAD
  if (body.action === "load") {
    try {
      const raw = (body.code || "").trim();
      const code = raw.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('-');

      const res = await fetch(`${baseUrl}/${code}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 404) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: false, error: "Code not found. Double-check and try again." }) };
      }
      if (!res.ok) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: false, error: "Could not load list. Please try again." }) };
      }

      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, ...data }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Load error: " + err.message }) };
    }
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid action" }) };
};
