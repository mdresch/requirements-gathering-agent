# Admin Interface (.NET)

This is an ASP.NET Core MVC web application for template maintenance. It allows you to:
- List, create, edit, and delete templates
- Connect to the Template API endpoints (e.g., /api/v1/templates)
- Manage templates in a user-friendly web interface

## Getting Started

1. **Build and run the app:**
   ```sh
   dotnet build
   dotnet run
   ```
2. **Configure API endpoint:**
   - Update the API base URL in `appsettings.json` or in the relevant service class if needed.

3. **Features:**
   - List all templates
   - Create new templates
   - Edit existing templates
   - Delete templates

## Project Structure
- `Controllers/TemplateController.cs` - Handles template management UI and API calls
- `Views/Template/` - Razor views for template CRUD
- `Services/TemplateApiService.cs` - Service for calling the Template API

## Requirements
- .NET 8 SDK

## Customization
- Update API URLs as needed for your environment.

---
This project was generated for template maintenance and admin operations.
