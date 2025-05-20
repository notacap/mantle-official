export async function POST(req) {
  const { formId, submissionData } = await req.json();

  if (!formId || !submissionData) {
    return new Response(JSON.stringify({ error: "Form ID and submission data are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  const endpoint = `${WORDPRESS_URL}/wp-json/gf/v2/forms/${formId}/submissions`;
  const credentials = Buffer.from(`${GF_CONSUMER_KEY}:${GF_CONSUMER_SECRET}`).toString("base64");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(submissionData),
    });

    const data = await response.json();

    if (response.ok) {
      return new Response(JSON.stringify({ message: "Submission successful", data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      console.error(`Gravity Forms API error for form ${formId}:`, data);
      return new Response(JSON.stringify({ error: data.message || "Submission failed" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error(`Error submitting to Gravity Forms for form ${formId}:`, error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 