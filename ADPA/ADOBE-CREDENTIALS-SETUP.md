# How to Get Your Adobe.io Credentials

## Step 1: Access Adobe Developer Console

1. Go to https://developer.adobe.com/console
2. Sign in with your Adobe ID (the same one you use for Adobe Creative Cloud)

## Step 2: Find or Create Your Project

### If you already have a project:
1. Click on your existing project
2. Go to the **Credentials** section

### If you need to create a new project:
1. Click **Create new project**
2. Give it a name like "ADPA Document Processing"
3. Click **Create**

## Step 3: Add Adobe PDF Services API

1. In your project, click **Add API**
2. Find **Adobe PDF Services API** in the list
3. Click **Next**
4. Choose **Server-to-Server** authentication
5. Click **Save configured API**

## Step 4: Get Your Credentials

After adding the API, you'll see your credentials:

### Copy these values to your .env file:

```bash
# From the "Credentials" section in Adobe Developer Console:

ADOBE_CLIENT_ID=your_client_id_from_console
ADOBE_CLIENT_SECRET=your_client_secret_from_console  
ADOBE_ORGANIZATION_ID=your_org_id_from_console
```

### Where to find each value:

- **ADOBE_CLIENT_ID**: Listed as "Client ID" in the credentials section
- **ADOBE_CLIENT_SECRET**: Listed as "Client Secret" (click "Retrieve client secret")
- **ADOBE_ORGANIZATION_ID**: Listed as "Organization ID" at the top of the console

## Step 5: Test Your Credentials

Run this test to make sure your credentials work:

```bash
curl -X POST "https://ims-na1.adobelogin.com/ims/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&scope=openid"
```

If successful, you'll get back an access token!

## Step 6: Update Your .env File

1. Open your `.env` file in the ADPA directory
2. Replace the placeholder values with your actual credentials:

```bash
ADOBE_CLIENT_ID=abcd1234efgh5678    # Your actual Client ID
ADOBE_CLIENT_SECRET=xxxx-yyyy-zzzz  # Your actual Client Secret
ADOBE_ORGANIZATION_ID=12345@AdobeOrg # Your actual Organization ID
```

3. Save the file

## Security Note

- ✅ Your `.env` file is in `.gitignore` so it won't be committed to Git
- ✅ These credentials are for server-side use only
- ✅ Never share these credentials or put them in client-side code
- ✅ The `.env.example` file shows the structure without real credentials

## What's Next?

Once you have your credentials in the `.env` file:

1. **Test the integration** with your ADPA Office Add-in
2. **Generate your first PDF** from a Word document
3. **Iterate and improve** the formatting and features

## Need Help?

- **Adobe Developer Console**: https://developer.adobe.com/console
- **Adobe PDF Services Documentation**: https://developer.adobe.com/document-services/docs/
- **Adobe API Reference**: https://developer.adobe.com/document-services/docs/apis/

## Common Issues

### "Invalid Client" Error
- Double-check your Client ID and Client Secret
- Make sure you're using Server-to-Server authentication (not OAuth)

### "Organization ID" Not Found
- Look for "Organization ID" at the top of the Adobe Developer Console
- It usually ends with "@AdobeOrg"

### "Scope" Issues  
- Make sure you've added the Adobe PDF Services API to your project
- The default scopes in the .env file should work for most use cases
