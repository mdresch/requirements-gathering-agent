# Adobe.io Integration Setup Instructions

## Quick Start: Get Your Adobe PDF Conversion Working in 5 Minutes

### Step 1: Get Your Adobe.io Credentials (2 minutes)

1. **Go to Adobe Developer Console**: https://developer.adobe.com/console
2. **Sign in** with your Adobe ID
3. **Find your existing project** or create a new one
4. **Copy these 3 values:**
   - **Client ID** (looks like: `1234567890abcdef1234567890abcdef`)
   - **Client Secret** (looks like: `p8e-AbCdEfGhIjKlMnOpQrStUvWxYz`)
   - **Organization ID** (looks like: `ABCDEF1234567890FEDCBA@AdobeOrg`)

### Step 2: Add Your Credentials to the Code (1 minute)

1. **Open**: `ADPA/src/config/adobe-config.ts`
2. **Find lines around 15** that look like:
   ```typescript
   const clientId = 'your_adobe_client_id_here';
   const clientSecret = 'your_adobe_client_secret_here';
   const organizationId = 'your_adobe_organization_id_here';
   ```
3. **Replace** with your actual credentials:
   ```typescript
   const clientId = '1234567890abcdef1234567890abcdef';
   const clientSecret = 'p8e-AbCdEfGhIjKlMnOpQrStUvWxYz';
   const organizationId = 'ABCDEF1234567890FEDCBA@AdobeOrg';
   ```

**Note**: You'll also need your Organization ID from the Adobe Developer Console. It looks like `ABCDEF1234567890FEDCBA@AdobeOrg`.

### Step 3: Test Your Integration (2 minutes)

1. **Build and run** your ADPA add-in:
   ```bash
   cd ADPA
   npm run dev-server
   ```

2. **Open Microsoft Word**

3. **Load your add-in** (sideload if needed)

4. **Look for the "InDesign Layout" button** in the ribbon (NEW!)

5. **Click "InDesign Layout"** to convert your document to professional print-ready format!

6. **Try other creative features:**
   - **Generate Diagrams** - Extract flowcharts and diagrams from your content
   - **Multi-Format Package** - Create PDF + InDesign + Diagrams all at once

## What You'll See

✅ **Success**: Document converts to professional PDF with ADPA branding  
✅ **InDesign Layout**: Print-ready PDF with professional typography and CMYK colors  
✅ **Professional formatting**: Corporate colors and styling applied  
✅ **Diagram extraction**: Automatic flowchart and diagram generation from content
✅ **Multi-format output**: PDF, InDesign, and diagrams generated simultaneously  

## Troubleshooting

### "Adobe authentication failed"
- Double-check your Client ID and Client Secret
- Make sure you copied them exactly (no extra spaces)
- Verify your Adobe Developer Console project is active

### "Adobe upload failed" 
- Check your internet connection
- Verify your Adobe.io account has PDF Services enabled
- Try again in a few minutes (temporary service issue)

### "PDF generation timed out"
- Large documents take longer to process
- Try with a smaller document first
- Check Adobe.io service status

## Next Steps After It Works

1. **Test with real documents** from your `generated-documents` folder
2. **Customize the HTML styling** in the `markdownToHTML()` function
3. **Add more Adobe services** (InDesign, Illustrator, Sign)
4. **Improve error handling** and user feedback
5. **Add batch processing** for multiple documents

## Security Note

⚠️ **For Development Only**: This implementation puts credentials directly in the client-side code, which is fine for development and testing.

🔒 **For Production**: Move Adobe API calls to a server endpoint to keep credentials secure.

## Support

- **Adobe Developer Documentation**: https://developer.adobe.com/document-services/docs/
- **ADPA Issues**: Create an issue in this repository
- **Adobe Support**: Contact Adobe Developer Support if you have API issues

---

**Ready to start?** Just get your Adobe.io credentials and update the two lines in `word.ts`. You'll have professional PDF generation working in minutes!
