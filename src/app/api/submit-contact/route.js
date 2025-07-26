import { contactSchema, validateInput, getSecurityHeaders, validateRequestSize } from '@/app/lib/validation';

export async function POST(req) {
  // Security headers
  const headers = {
    "Content-Type": "application/json",
    ...getSecurityHeaders()
  };

  try {
    // Validate request size
    const contentLength = req.headers.get('content-length');
    if (!validateRequestSize(parseInt(contentLength), 100 * 1024)) { // 100KB max
      return new Response(JSON.stringify({ 
        error: "Request too large",
        message: "Form data exceeds maximum allowed size"
      }), {
        status: 413,
        headers,
      });
    }

    // Rate limiting check (basic IP-based)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';

    // Parse and validate JSON
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: "Invalid JSON",
        message: "Request body must be valid JSON"
      }), {
        status: 400,
        headers,
      });
    }

    // Validate input data
    const validation = validateInput(contactSchema, requestData);
    if (!validation.success) {
      return new Response(JSON.stringify({ 
        error: "Validation failed",
        message: "Invalid form data provided",
        details: validation.errors
      }), {
        status: 400,
        headers,
      });
    }

    const { formId, submissionData } = validation.data;

    // Environment validation
    const GF_CONSUMER_KEY = process.env.GRAVITY_FORMS_CONSUMER_KEY;
    const GF_CONSUMER_SECRET = process.env.GRAVITY_FORMS_CONSUMER_SECRET_KEY;
    const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;

    if (!GF_CONSUMER_KEY || !GF_CONSUMER_SECRET || !WORDPRESS_URL) {
      console.error("Missing Gravity Forms API credentials or WordPress URL in .env.local");
      return new Response(JSON.stringify({ 
        error: "Configuration error",
        message: "Server configuration error" 
      }), {
        status: 500,
        headers,
      });
    }

    // Create secure API endpoint
    const endpoint = `${WORDPRESS_URL}/wp-json/gf/v2/forms/${formId}/submissions`;
    const credentials = Buffer.from(`${GF_CONSUMER_KEY}:${GF_CONSUMER_SECRET}`).toString("base64");

    // Submit to Gravity Forms API
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${credentials}`,
        "User-Agent": "Mantle-Contact-Form/1.0",
      },
      body: JSON.stringify(submissionData),
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = { message: "Failed to parse response from Gravity Forms" };
    }

    if (response.ok) {
      // Log successful submission (without sensitive data)
      console.log('Contact form submitted successfully:', {
        formId: formId,
        submissionId: responseData.id,
        ip: ip,
        timestamp: new Date().toISOString(),
        fieldCount: Object.keys(submissionData).length
      });

      return new Response(JSON.stringify({ 
        success: true,
        message: "Form submitted successfully", 
        submissionId: responseData.id
      }), {
        status: 200,
        headers,
      });
    } else {
      console.error(`Gravity Forms API error for form ${formId}:`, {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        ip: ip
      });
      
      return new Response(JSON.stringify({ 
        error: "Submission failed",
        message: responseData.message || "Failed to submit form" 
      }), {
        status: response.status,
        headers,
      });
    }

  } catch (error) {
    console.error(`Error submitting to Gravity Forms for form ${formId}:`, {
      error: error.message,
      stack: error.stack,
      formId: formId,
      ip: ip,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: "An unexpected error occurred while processing your form submission" 
    }), {
      status: 500,
      headers,
    });
  }
} 