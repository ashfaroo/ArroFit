exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const apiKey = process.env.COLLEGE_SCORECARD_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "COLLEGE_SCORECARD_API_KEY not set" })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { schoolName } = body;
  if (!schoolName) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Missing schoolName" }) };
  }

  try {
    const fields = [
      "school.name",
      "school.city",
      "school.state",
      "latest.admissions.admission_rate.overall",
      "latest.cost.tuition.in_state",
      "latest.cost.tuition.out_of_state",
      "latest.student.size",
      "school.ownership"
    ].join(",");

    const url = `https://api.data.gov/ed/collegescorecard/v1/schools.json?school.name=${encodeURIComponent(schoolName)}&fields=${fields}&api_key=${apiKey}&per_page=1`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ found: false })
      };
    }

    const s = data.results[0];
    const admRate = s["latest.admissions.admission_rate.overall"];
    const inState = s["latest.cost.tuition.in_state"];
    const outOfState = s["latest.cost.tuition.out_of_state"];
    const size = s["latest.student.size"];
    const ownership = s["school.ownership"]; // 1=public, 2=private nonprofit, 3=private for-profit

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        found: true,
        name: s["school.name"],
        city: s["school.city"],
        state: s["school.state"],
        acceptanceRate: admRate != null ? Math.round(admRate * 100) + "%" : null,
        tuitionInState: inState ? "$" + inState.toLocaleString() + "/yr" : null,
        tuitionOutOfState: outOfState ? "$" + outOfState.toLocaleString() + "/yr" : null,
        enrollment: size ? size.toLocaleString() + " undergrads" : null,
        isPublic: ownership === 1
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
