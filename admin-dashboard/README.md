# Admin Dashboard

This is a standalone admin dashboard for managing templates, projects, and feedback via the admin API.

## Features
- Material UI styling
- Secure API integration with admin API endpoints
- Pages for templates, projects, and more

## Setup
1. Install dependencies:
   ```sh
   npm install
   ```
2. Set your admin API URL and key in `.env.local`.
3. Run the development server:
   ```sh
   npm run dev
   ```

## API Integration
Edit `src/lib/adminApi.ts` to add more admin API calls as needed.

## Next Steps
- Add authentication and login page
- Add pages for projects and feedback
- Customize dashboard layout
