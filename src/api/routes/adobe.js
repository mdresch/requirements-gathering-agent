// Adobe PDF conversion endpoint
const express = require("express");
const router = express.Router();
const { convertMarkdownToAdobePDF } = require("../services/adobePdfService");

router.post("/convert", async (req, res) => {
  try {
    const { markdown } = req.body;
    if (!markdown) return res.status(400).json({ error: "Missing markdown content" });

    // Load credentials from environment variables
    const credentials = {
      clientId: process.env.ADOBE_CLIENT_ID,
      clientSecret: process.env.ADOBE_CLIENT_SECRET,
      technicalAccountId: process.env.ADOBE_TECHNICAL_ACCOUNT_ID,
      orgId: process.env.ADOBE_ORG_ID,
      privateKey: process.env.ADOBE_PRIVATE_KEY,
    };
    if (!credentials.clientId || !credentials.clientSecret || !credentials.technicalAccountId || !credentials.orgId || !credentials.privateKey) {
      return res.status(500).json({ error: "Adobe credentials not set in environment" });
    }

    const pdfUrl = await convertMarkdownToAdobePDF(markdown, credentials);
    return res.json({ pdfUrl });
  } catch (err) {
    console.error("Adobe PDF conversion error:", err);
    res.status(500).json({ error: "PDF conversion failed", details: err.message });
  }
});

module.exports = router;