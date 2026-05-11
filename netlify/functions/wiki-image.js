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

  // Hardcoded landscape campus photo URLs for top US universities
  const CAMPUS_PHOTOS = {
    "Harvard University": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Harvard_University_campus.jpg/800px-Harvard_University_campus.jpg",
    "Yale University": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Yale_University_Old_Campus.jpg/800px-Yale_University_Old_Campus.jpg",
    "Princeton University": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Princeton_University_Nassau_Hall.jpg/800px-Princeton_University_Nassau_Hall.jpg",
    "Columbia University": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Columbia_University_Butler_Library.jpg/800px-Columbia_University_Butler_Library.jpg",
    "University of Pennsylvania": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/University_of_Pennsylvania_campus.jpg/800px-University_of_Pennsylvania_campus.jpg",
    "Brown University": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Brown_University_Campus.jpg/800px-Brown_University_Campus.jpg",
    "Dartmouth College": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Dartmouth_College_campus_from_Baker_Tower.jpg/800px-Dartmouth_College_campus_from_Baker_Tower.jpg",
    "Cornell University": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Cornell_University_Uris_Library_and_the_Arts_Quad.jpg/800px-Cornell_University_Uris_Library_and_the_Arts_Quad.jpg",
    "Massachusetts Institute of Technology": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_Campus_Aerial.jpg/800px-MIT_Campus_Aerial.jpg",
    "Stanford University": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Stanford_Main_Quad_May_2013_003.jpg/800px-Stanford_Main_Quad_May_2013_003.jpg",
    "California Institute of Technology": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Caltech_campus.jpg/800px-Caltech_campus.jpg",
    "Duke University": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Duke_University_campus_aerial.jpg/800px-Duke_University_campus_aerial.jpg",
    "Northwestern University": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Northwestern_University_campus_lake.jpg/800px-Northwestern_University_campus_lake.jpg",
    "University of Chicago": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/University_of_Chicago_campus.jpg/800px-University_of_Chicago_campus.jpg",
    "Vanderbilt University": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Vanderbilt_University_campus.jpg/800px-Vanderbilt_University_campus.jpg",
    "Rice University": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Rice_University_aerial.jpg/800px-Rice_University_aerial.jpg",
    "Emory University": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Emory_University_campus.jpg/800px-Emory_University_campus.jpg",
    "Georgetown University": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Georgetown_University_campus.jpg/800px-Georgetown_University_campus.jpg",
    "Tufts University": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Tufts_University_campus.jpg/800px-Tufts_University_campus.jpg",
    "Boston College": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Boston_College_campus.jpg/800px-Boston_College_campus.jpg",
    "Boston University": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Boston_University_campus.jpg/800px-Boston_University_campus.jpg",
    "Northeastern University": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Northeastern_University_campus.jpg/800px-Northeastern_University_campus.jpg",
    "New York University": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/NYU_Bobst_Library.jpg/800px-NYU_Bobst_Library.jpg",
    "University of Notre Dame": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Notre_Dame_Golden_Dome.jpg/800px-Notre_Dame_Golden_Dome.jpg",
    "Wake Forest University": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Wake_Forest_University_campus.jpg/800px-Wake_Forest_University_campus.jpg",
    "Tulane University": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Tulane_University_campus.jpg/800px-Tulane_University_campus.jpg",
    "University of Southern California": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/University_of_Southern_California_campus.jpg/800px-University_of_Southern_California_campus.jpg",
    "University of California, Los Angeles": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/UCLA_campus_aerial_view.jpg/800px-UCLA_campus_aerial_view.jpg",
    "University of California, Berkeley": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/UC_Berkeley_campus.jpg/800px-UC_Berkeley_campus.jpg",
    "University of California, San Diego": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/UCSD_campus.jpg/800px-UCSD_campus.jpg",
    "University of California, Santa Barbara": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/UCSB_campus.jpg/800px-UCSB_campus.jpg",
    "University of California, Davis": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/UC_Davis_campus.jpg/800px-UC_Davis_campus.jpg",
    "University of Michigan": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/University_of_Michigan_campus.jpg/800px-University_of_Michigan_campus.jpg",
    "University of Virginia": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/University_of_Virginia_Academical_Village.jpg/800px-University_of_Virginia_Academical_Village.jpg",
    "University of North Carolina at Chapel Hill": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/UNC_Chapel_Hill_campus.jpg/800px-UNC_Chapel_Hill_campus.jpg",
    "University of Florida": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/University_of_Florida_campus.jpg/800px-University_of_Florida_campus.jpg",
    "University of Georgia": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/University_of_Georgia_campus.jpg/800px-University_of_Georgia_campus.jpg",
    "Georgia Institute of Technology": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Georgia_Tech_campus.jpg/800px-Georgia_Tech_campus.jpg",
    "Ohio State University": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/OSU_campus_aerial.jpg/800px-OSU_campus_aerial.jpg",
    "University of Illinois Urbana-Champaign": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/UIUC_campus.jpg/800px-UIUC_campus.jpg",
    "Purdue University": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Purdue_University_campus.jpg/800px-Purdue_University_campus.jpg",
    "Indiana University Bloomington": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Indiana_University_campus.jpg/800px-Indiana_University_campus.jpg",
    "University of Wisconsin-Madison": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/UW_Madison_campus.jpg/800px-UW_Madison_campus.jpg",
    "University of Minnesota": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/University_of_Minnesota_campus.jpg/800px-University_of_Minnesota_campus.jpg",
    "University of Texas at Austin": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/UT_Austin_campus.jpg/800px-UT_Austin_campus.jpg",
    "Texas A&M University": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Texas_AM_campus.jpg/800px-Texas_AM_campus.jpg",
    "University of Washington": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/University_of_Washington_campus.jpg/800px-University_of_Washington_campus.jpg",
    "University of Colorado Boulder": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/CU_Boulder_campus.jpg/800px-CU_Boulder_campus.jpg",
    "University of Arizona": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/University_of_Arizona_campus.jpg/800px-University_of_Arizona_campus.jpg",
    "Arizona State University": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/ASU_campus.jpg/800px-ASU_campus.jpg",
    "Pennsylvania State University": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Penn_State_campus.jpg/800px-Penn_State_campus.jpg",
    "University of Pittsburgh": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/University_of_Pittsburgh_Cathedral_of_Learning.jpg/800px-University_of_Pittsburgh_Cathedral_of_Learning.jpg",
    "Carnegie Mellon University": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Carnegie_Mellon_University_campus.jpg/800px-Carnegie_Mellon_University_campus.jpg",
    "Case Western Reserve University": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Case_Western_Reserve_campus.jpg/800px-Case_Western_Reserve_campus.jpg",
    "University of Rochester": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/University_of_Rochester_campus.jpg/800px-University_of_Rochester_campus.jpg",
    "Brandeis University": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Brandeis_University_campus.jpg/800px-Brandeis_University_campus.jpg",
    "Lehigh University": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Lehigh_University_campus.jpg/800px-Lehigh_University_campus.jpg",
    "Villanova University": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Villanova_University_campus.jpg/800px-Villanova_University_campus.jpg",
    "Fordham University": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Fordham_University_campus.jpg/800px-Fordham_University_campus.jpg",
    "George Washington University": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/GWU_campus.jpg/800px-GWU_campus.jpg",
    "American University": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/American_University_campus.jpg/800px-American_University_campus.jpg",
    "University of Maryland": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/University_of_Maryland_campus.jpg/800px-University_of_Maryland_campus.jpg",
    "University of Delaware": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/University_of_Delaware_campus.jpg/800px-University_of_Delaware_campus.jpg",
    "Rutgers University": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Rutgers_University_campus.jpg/800px-Rutgers_University_campus.jpg",
    "University of Connecticut": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/UConn_campus.jpg/800px-UConn_campus.jpg",
    "University of Massachusetts Amherst": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/UMass_Amherst_campus.jpg/800px-UMass_Amherst_campus.jpg",
    "University of Miami": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/University_of_Miami_campus.jpg/800px-University_of_Miami_campus.jpg",
    "University of South Carolina": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/University_of_South_Carolina_campus.jpg/800px-University_of_South_Carolina_campus.jpg",
    "Clemson University": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Clemson_University_campus.jpg/800px-Clemson_University_campus.jpg",
    "University of Tennessee": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/University_of_Tennessee_campus.jpg/800px-University_of_Tennessee_campus.jpg",
    "University of Kentucky": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/University_of_Kentucky_campus.jpg/800px-University_of_Kentucky_campus.jpg",
    "Michigan State University": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Michigan_State_University_campus.jpg/800px-Michigan_State_University_campus.jpg",
    "University of Iowa": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/University_of_Iowa_campus.jpg/800px-University_of_Iowa_campus.jpg",
    "Iowa State University": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Iowa_State_University_campus.jpg/800px-Iowa_State_University_campus.jpg",
    "University of Missouri": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/University_of_Missouri_campus.jpg/800px-University_of_Missouri_campus.jpg",
    "Washington University in St. Louis": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Washington_University_St_Louis_campus.jpg/800px-Washington_University_St_Louis_campus.jpg",
    "Saint Louis University": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Saint_Louis_University_campus.jpg/800px-Saint_Louis_University_campus.jpg",
    "University of Kansas": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/University_of_Kansas_campus.jpg/800px-University_of_Kansas_campus.jpg",
    "Kansas State University": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Kansas_State_University_campus.jpg/800px-Kansas_State_University_campus.jpg",
    "University of Nebraska-Lincoln": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/University_of_Nebraska_campus.jpg/800px-University_of_Nebraska_campus.jpg",
    "Colorado State University": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Colorado_State_University_campus.jpg/800px-Colorado_State_University_campus.jpg",
    "University of Utah": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/University_of_Utah_campus.jpg/800px-University_of_Utah_campus.jpg",
    "Brigham Young University": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/BYU_campus.jpg/800px-BYU_campus.jpg",
    "University of Oregon": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/University_of_Oregon_campus.jpg/800px-University_of_Oregon_campus.jpg",
    "Oregon State University": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Oregon_State_University_campus.jpg/800px-Oregon_State_University_campus.jpg",
    "University of Nevada, Las Vegas": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/UNLV_campus.jpg/800px-UNLV_campus.jpg",
    "Pomona College": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pomona_College_campus.jpg/800px-Pomona_College_campus.jpg",
    "Swarthmore College": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Swarthmore_College_campus.jpg/800px-Swarthmore_College_campus.jpg",
    "Williams College": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Williams_College_campus.jpg/800px-Williams_College_campus.jpg",
    "Amherst College": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Amherst_College_campus.jpg/800px-Amherst_College_campus.jpg",
    "Middlebury College": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Middlebury_College_campus.jpg/800px-Middlebury_College_campus.jpg",
    "Bowdoin College": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bowdoin_College_campus.jpg/800px-Bowdoin_College_campus.jpg",
    "Colby College": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Colby_College_campus.jpg/800px-Colby_College_campus.jpg",
    "Colgate University": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Colgate_University_campus.jpg/800px-Colgate_University_campus.jpg",
    "Hamilton College": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Hamilton_College_campus.jpg/800px-Hamilton_College_campus.jpg",
    "Wellesley College": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Wellesley_College_campus.jpg/800px-Wellesley_College_campus.jpg",
    "Smith College": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Smith_College_campus.jpg/800px-Smith_College_campus.jpg",
    "Barnard College": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Barnard_College_campus.jpg/800px-Barnard_College_campus.jpg",
    "Vassar College": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Vassar_College_campus.jpg/800px-Vassar_College_campus.jpg",
    "Oberlin College": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Oberlin_College_campus.jpg/800px-Oberlin_College_campus.jpg",
    "Wesleyan University": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Wesleyan_University_campus.jpg/800px-Wesleyan_University_campus.jpg",
    "Trinity College": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Trinity_College_Hartford_campus.jpg/800px-Trinity_College_Hartford_campus.jpg",
    "Davidson College": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Davidson_College_campus.jpg/800px-Davidson_College_campus.jpg",
    "Grinnell College": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Grinnell_College_campus.jpg/800px-Grinnell_College_campus.jpg",
    "Harvey Mudd College": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Harvey_Mudd_College_campus.jpg/800px-Harvey_Mudd_College_campus.jpg",
    "Claremont McKenna College": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Claremont_McKenna_campus.jpg/800px-Claremont_McKenna_campus.jpg",
    "University of Richmond": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/University_of_Richmond_campus.jpg/800px-University_of_Richmond_campus.jpg",
    "University of San Diego": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/University_of_San_Diego_campus.jpg/800px-University_of_San_Diego_campus.jpg",
    "Loyola Marymount University": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/LMU_campus.jpg/800px-LMU_campus.jpg",
    "Santa Clara University": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Santa_Clara_University_campus.jpg/800px-Santa_Clara_University_campus.jpg",
    "Gonzaga University": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Gonzaga_University_campus.jpg/800px-Gonzaga_University_campus.jpg"
  };

  // Try exact match first, then partial match
  let photoUrl = CAMPUS_PHOTOS[name];
  if (!photoUrl) {
    const key = Object.keys(CAMPUS_PHOTOS).find(k =>
      k.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(k.toLowerCase().split(' ').slice(0,3).join(' '))
    );
    if (key) photoUrl = CAMPUS_PHOTOS[key];
  }

  if (!photoUrl) {
    return { statusCode: 404, headers, body: JSON.stringify({ found: false }) };
  }

  try {
    const imgRes = await fetch(photoUrl, {
      headers: {
        "User-Agent": "ArrofitAI/1.0 (https://arrofitai.com; hello@arrofitai.com)",
        "Referer": "https://en.wikipedia.org"
      }
    });
    if (!imgRes.ok) return { statusCode: 404, headers, body: JSON.stringify({ found: false }) };
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
