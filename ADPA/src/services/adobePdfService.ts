// Node.js compatibility imports
import fetch from "node-fetch";
import FormData from "form-data";
import { Buffer } from "buffer";
import { URLSearchParams } from "url";
import { setTimeout } from "timers";

export interface AdobeCredentials {
  clientId: string;
  clientSecret: string;
}

export async function getAdobeAccessToken({ clientId, clientSecret }: AdobeCredentials): Promise<string> {
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "openid,AdobeID,session",
  });
  const response = await fetch("https://ims-na1.adobelogin.com/ims/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const { access_token } = await response.json();
  if (!access_token) throw new Error("Failed to get Adobe access token");
  return access_token;
}

export function markdownToHTML(markdown: string): string {
  let html = markdown;
  html = html.replace(/^# (.*$)/gim, '<h1 style="color: #2E86AB; border-bottom: 2px solid #2E86AB;">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="color: #A23B72;">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 style="color: #F18F01;">$1</h3>');
  html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");
  html = html.replace(/\n/gim, "<br>");
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ADPA Generated Document</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #2E86AB; border-bottom: 2px solid #2E86AB; padding-bottom: 10px; }
        h2 { color: #A23B72; margin-top: 30px; }
        h3 { color: #F18F01; margin-top: 25px; }
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 40px;">
        <h1>ADPA Document</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Powered by:</strong> Adobe.io + ADPA</p>
    </div>
    ${html}
</body>
</html>`;
}

export async function uploadToAdobe(htmlContent: string, accessToken: string, clientId: string): Promise<any> {
  const formData = new FormData();
  formData.append("file", Buffer.from(htmlContent, "utf-8"), {
    filename: "document.html",
    contentType: "text/html",
  });
  const response = await fetch("https://pdf-services.adobe.io/assets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": clientId,
      ...formData.getHeaders(),
    },
    body: formData as any,
  });
  return await response.json();
}

export async function createPDFJob(assetID: string, accessToken: string, clientId: string): Promise<any> {
  const response = await fetch("https://pdf-services.adobe.io/operation/createpdf", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": clientId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assetID: assetID,
      outputFormat: "pdf",
    }),
  });
  return await response.json();
}

export async function pollForPDF(jobID: string, accessToken: string, clientId: string): Promise<string> {
  const maxAttempts = 30;
  let attempts = 0;
  while (attempts < maxAttempts) {
    const response = await fetch(`https://pdf-services.adobe.io/operation/${jobID}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-api-key": clientId,
      },
    });
    const jobStatus = await response.json();
    if (jobStatus.status === "done") {
      return jobStatus.downloadUri;
    } else if (jobStatus.status === "failed") {
      throw new Error("PDF generation failed");
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
    attempts++;
  }
  throw new Error("PDF generation timed out");
}

export async function convertMarkdownToAdobePDF(
  markdownContent: string,
  credentials: AdobeCredentials
): Promise<string> {
  const accessToken = await getAdobeAccessToken(credentials);
  const htmlContent = markdownToHTML(markdownContent);
  const uploadResponse = await uploadToAdobe(htmlContent, accessToken, credentials.clientId);
  const pdfResponse = await createPDFJob(uploadResponse.assetID, accessToken, credentials.clientId);
  const resultUrl = await pollForPDF(pdfResponse.jobID, accessToken, credentials.clientId);
  return resultUrl;
}
