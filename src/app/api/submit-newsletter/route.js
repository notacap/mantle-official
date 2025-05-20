export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const FORM_ID = "1"; // As per your instruction, but please verify
  const GF_CONSUMER_KEY = process.env.GRAVITY_FORMS_CONSUMER_KEY;
  const GF_CONSUMER_SECRET = process.env.GRAVITY_FORMS_CONSUMER_SECRET_KEY;
  const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;

  if (!GF_CONSUMER_KEY || !GF_CONSUMER_SECRET || !WORDPRESS_URL) {
    console.error("Missing Gravity Forms API credentials or WordPress URL in .env.local");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const endpoint = `${WORDPRESS_URL}/wp-json/gf/v2/forms/${FORM_ID}/submissions`;
  const credentials = Buffer.from(`${GF_CONSUMER_KEY}:${GF_CONSUMER_SECRET}`).toString("base64");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({ input_1: email }), // Email field ID is 1
    });

    const data = await response.json();

    if (response.ok) {
      return new Response(JSON.stringify({ message: "Subscription successful", data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      console.error("Gravity Forms API error:", data);
      return new Response(JSON.stringify({ error: data.message || "Submission failed" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error submitting to Gravity Forms:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 