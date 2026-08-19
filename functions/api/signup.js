const turnstileVerifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const thunderCallSignupPath = "/api/users/signup";
const signatureHeader = "X-Thundercall-Signup-Signature";
const timestampHeader = "X-Thundercall-Signup-Timestamp";
const clientIPHeader = "X-Thundercall-Client-IP";

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (_error) {
    return jsonResponse(400, { message: "Invalid JSON body." });
  }

  if (!requestBody || typeof requestBody !== "object" || Array.isArray(requestBody)) {
    return jsonResponse(400, { message: "Invalid signup payload." });
  }

  const { payload, turnstileToken } = requestBody;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonResponse(400, { message: "Invalid signup payload." });
  }

  const apiBaseURL = trimTrailingSlash(env.THUNDERCALL_API_BASE_URL || "https://api.thundercall.com");
  const sharedSecret = String(env.THUNDERCALL_API_PUBLIC_SIGNUP_PROXY_SHARED_SECRET || "").trim();
  if (sharedSecret === "") {
    return jsonResponse(500, { message: "ThunderCall signup proxy is not configured." });
  }

  const clientIP = forwardedClientIP(request);
  const turnstileSecret = String(env.TURNSTILE_SECRET_KEY || "").trim();
  if (turnstileSecret !== "") {
    const token = typeof turnstileToken === "string" ? turnstileToken.trim() : "";
    if (token === "") {
      return jsonResponse(400, { message: "Complete the security check and try again." });
    }

    const verification = await verifyTurnstile(turnstileSecret, token, clientIP);
    if (!verification.success) {
      return jsonResponse(400, { message: "Security check failed. Please try again." });
    }
  }

  const payloadBody = JSON.stringify(payload);
  const timestamp = new Date().toISOString();
  const signature = await computeProxySignature(
    sharedSecret,
    "POST",
    thunderCallSignupPath,
    timestamp,
    payloadBody
  );

  const upstreamResponse = await fetch(`${apiBaseURL}${thunderCallSignupPath}`, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain",
      "Content-Type": "application/json",
      [signatureHeader]: signature,
      [timestampHeader]: timestamp,
      [clientIPHeader]: clientIP,
    },
    body: payloadBody,
  });

  const responseHeaders = new Headers();
  const contentType = upstreamResponse.headers.get("Content-Type");
  if (contentType) {
    responseHeaders.set("Content-Type", contentType);
  } else {
    responseHeaders.set("Content-Type", "application/json");
  }

  return new Response(await upstreamResponse.text(), {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

async function verifyTurnstile(secret, token, clientIP) {
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (clientIP !== "") {
    body.set("remoteip", clientIP);
  }

  const response = await fetch(turnstileVerifyURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    return { success: false };
  }

  const result = await response.json();
  return {
    success: result?.success === true,
  };
}

async function computeProxySignature(secret, method, path, timestamp, body) {
  const payload = [String(method).trim().toUpperCase(), String(path).trim(), String(timestamp).trim(), body].join("\n");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(signature);
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function trimTrailingSlash(value) {
  return String(value).replace(/\/+$/, "");
}

function forwardedClientIP(request) {
  const cfConnectingIP = request.headers.get("CF-Connecting-IP");
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  const forwardedFor = request.headers.get("X-Forwarded-For");
  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    if (first) {
      return first.trim();
    }
  }

  return "";
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
