export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpSMS(phone: string, otp: string) {
  const apiKey = process.env.SMS_API_KEY;
  const route = process.env.SMS_API_ROUTE;
  const sender = process.env.SMS_API_SENDER;
  const templateId = process.env.SMS_API_TEMPLATE_ID;
  const hostname = process.env.SMS_API_HOSTNAME ?? "site.ping4sms.com";

  if (!apiKey || !route || !sender || !templateId) {
    throw new Error("Ping4SMS credentials are not configured");
  }

  const baseUrl = hostname.startsWith("http") ? hostname : `https://${hostname}`;
  const phoneNumber = phone.replace(/^\+/, "");
  const message = `Please enter ${otp} as the OTP for mobile verification GLOBIZS Web Solutions`;
  const url = new URL("/api/smsapi", baseUrl);
  url.search = new URLSearchParams({
    key: apiKey,
    route,
    sender,
    number: phoneNumber,
    sms: message,
    templateid: templateId,
  }).toString();

  const response = await fetch(url, { method: "GET" });

  const responseBody = (await response.text()).trim();

  if (process.env.NODE_ENV !== "production") {
    console.log("[SMS OTP]", {
      url: url.toString().replace(apiKey, "[hidden]"),
      status: response.status,
      sender,
      route,
      templateId,
      phoneNumber,
      response: responseBody,
    });
  }

  if (!response.ok) {
    throw new Error(`Ping4SMS request failed: ${responseBody}`);
  }

  const errorMessage = getPing4SmsErrorMessage(responseBody);
  if (errorMessage) {
    throw new Error(`Ping4SMS error ${responseBody}: ${errorMessage}`);
  }
}

function getPing4SmsErrorMessage(code: string) {
  const errors: Record<string, string> = {
    "101": "Invalid user",
    "102": "Invalid sender ID",
    "103": "Invalid contact number",
    "104": "Invalid route",
    "105": "Invalid message",
    "106": "Spam blocked",
    "107": "Promotional block",
    "108": "Low credits in the specified route",
    "109": "Promotional route works from 9am to 8:45pm only",
    "110": "Invalid DLT Template ID",
  };

  return errors[code];
}
