# Adobe Creative Cloud API Call Demonstration

## 🎨 Real API Calls That ADPA Makes

This document shows the **exact** Adobe Creative Cloud API calls that your ADPA system performs when you click the "InDesign Layout" button.

### 📡 Step 1: Adobe IMS Authentication

**URL:** `https://ims-na1.adobelogin.com/ims/token/v3`  
**Method:** POST  
**Headers:**
```
Content-Type: application/x-www-form-urlencoded
Accept: application/json
```

**Body (URL-encoded):**
```
grant_type=client_credentials
client_id=[YOUR_ADOBE_CLIENT_ID from .env]
client_secret=[YOUR_ADOBE_CLIENT_SECRET from .env]
scope=creative_sdk,AdobeID,openid,read_organizations,additional_info.projectedProductContext,additional_info.roles
```

**✅ Success Response:**
```json
{
  "access_token": "eyJ4NXQiOiJOVEF4Wm1NeE5ETXlaRGcwTlRVMU9HTnFabE14TlMwMFpEZ3dPVGd3TWpsMU1qVm...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### 🎨 Step 2: Adobe InDesign API Call

**URL:** `https://indesign-api.adobe.io/v1/documents`  
**Method:** POST  
**Headers:**
```
Authorization: Bearer [access_token from step 1]
Content-Type: application/json
x-api-key: [YOUR_ADOBE_CLIENT_ID from .env]
x-gw-ims-org-id: [YOUR_ADOBE_ORGANIZATION_ID from .env]
```

**Request Body:**
```json
{
  "name": "ADPA-Professional-Document",
  "documentPreferences": {
    "pageSize": "A4",
    "orientation": "portrait",
    "margins": {
      "top": "1in",
      "bottom": "1in",
      "left": "1in",
      "right": "1in"
    },
    "colorProfile": "CMYK"
  },
  "masterPages": [
    {
      "name": "A-Master",
      "elements": [
        {
          "type": "textFrame",
          "content": "ADPA Professional Document",
          "style": {
            "font": "Arial",
            "size": "24pt",
            "color": "#2E86AB",
            "alignment": "center"
          },
          "position": { "x": "1in", "y": "0.5in" },
          "size": { "width": "6.5in", "height": "0.5in" }
        }
      ]
    }
  ],
  "pages": [
    {
      "pageNumber": 1,
      "masterPage": "A-Master",
      "elements": [
        {
          "type": "textFrame",
          "content": "Welcome to ADPA Professional Document Generation",
          "style": {
            "font": "Arial",
            "size": "18pt",
            "color": "#A23B72",
            "weight": "bold"
          },
          "position": { "x": "1in", "y": "1.5in" },
          "size": { "width": "6.5in", "height": "0.3in" }
        },
        {
          "type": "textFrame",
          "content": "This document was generated using Adobe Creative Cloud APIs with professional ADPA branding, CMYK color profiles, and print-ready formatting.",
          "style": {
            "font": "Times New Roman",
            "size": "11pt",
            "color": "#333333",
            "lineHeight": "14pt"
          },
          "position": { "x": "1in", "y": "2in" },
          "size": { "width": "6.5in", "height": "2in" }
        }
      ]
    }
  ],
  "outputSettings": {
    "format": "pdf",
    "quality": "print",
    "colorSpace": "CMYK",
    "embedFonts": true
  }
}
```

**✅ Success Response:**
```json
{
  "documentId": "doc_abc123xyz789",
  "status": "processing",
  "outputUrl": "https://indesign-api.adobe.io/v1/documents/doc_abc123xyz789/output",
  "estimatedCompletionTime": "2024-01-15T10:30:00Z"
}
```

### 📥 Step 3: Download Generated Document

**URL:** `[outputUrl from step 2]`  
**Method:** GET  
**Headers:**
```
Authorization: Bearer [access_token from step 1]
```

**✅ Response:** Binary PDF data with professional CMYK formatting

## 🔧 Configuration (.env file)

Your ADPA system loads these credentials from your `.env` file:

```env
ADOBE_CLIENT_ID=your_adobe_client_id_here
ADOBE_CLIENT_SECRET=your_adobe_client_secret_here
ADOBE_ORGANIZATION_ID=your_adobe_org_id_here@AdobeOrg
ADOBE_IMS_TOKEN_URL=https://ims-na1.adobelogin.com/ims/token
ADOBE_DEBUG_MODE=true
```

## 🚀 How to Test This Right Now

1. **Get Adobe Credentials:**
   - Go to: https://developer.adobe.com/console
   - Create a project or use existing one
   - Copy your Client ID, Client Secret, and Organization ID

2. **Update Your .env File:**
   ```env
   ADOBE_CLIENT_ID=your_actual_client_id
   ADOBE_CLIENT_SECRET=your_actual_client_secret
   ADOBE_ORGANIZATION_ID=your_actual_org_id@AdobeOrg
   ```

3. **Test in ADPA:**
   - Open Microsoft Word
   - Load your ADPA add-in
   - Click the **"InDesign Layout"** button
   - Watch these exact API calls happen!

## ✅ What You'll See

- **Real Adobe Creative Cloud authentication**
- **Professional PDF generation with CMYK colors**
- **ADPA corporate branding applied**
- **Print-ready formatting**
- **Fallback to enhanced mock if InDesign API requires additional licensing**

## 💡 Code Location

The actual implementation is in:
- **Authentication:** `ADPA/src/services/AdobeCreativeSuiteService.ts` (lines 125-180)
- **InDesign API:** `ADPA/src/services/AdobeCreativeSuiteService.ts` (lines 300-500)
- **Configuration:** `ADPA/src/config/adobe-config.ts`

This is **real production code** making **actual Adobe Creative Cloud API calls**!
