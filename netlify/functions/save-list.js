const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const store = getStore("college-lists");

  // SAVE
  if (body.action === "save") {
    try {
      const adjectives = ["Tiger","Maple","River","Golden","Silver","Crimson","Bright","Swift","Noble","Falcon","Cedar","Sapphire","Ember","Willow","Cobalt"];
      const nouns = ["Path","Crest","Peak","Grove","Forge","Tide","Spark","Ridge","Shore","Vault","Drift","Bloom","Quest","Arrow","Bridge"];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const num = Math.floor(1000 + Math.random() * 9000);
      const code = `${adj}-${noun}-${num}`;

      await store.setJSON(code, {
        savedAt: new Date().toISOString(),
        answers: body.answers || {},
        result: body.result || {}
      });

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, code }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to save: " + err.message }) };
    }
  }

  // LOAD
  if (body.action === "load") {
    try {
      const code = (body.code || "").trim().toUpperCase();
      // normalize to match how it was saved (Title-Case)
      const normalized = code.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('-');

      const data = await store.get(normalized, { type: "json" });
      if (!data) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: "Code not found. Check your code and try again." }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, ...data }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to load: " + err.message }) };
    }
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid action" }) };
};
