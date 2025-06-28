# ADPA Template Management - Admin Interfaces

The ADPA Enterprise Framework now includes two modern admin interfaces for managing templates:

1. **Basic HTML Interface** - Simple, lightweight web interface
2. **Next.js Admin Interface** - Modern, feature-rich React application

## Quick Start

### Start Both API and Admin Interface

```bash
# Build the project first
npm run build

# Start the API server (runs on port 3002)
npm run api:start

# In a new terminal, start the Next.js admin interface (runs on port 3003)
npm run admin:dev
```

### Access the Interfaces

- **Next.js Admin Interface**: http://localhost:3003 (Recommended)
- **Basic HTML Interface**: http://localhost:3002/admin/template-manager.html
- **API Documentation**: http://localhost:3002/api/docs

## Feature Comparison

| Feature | Basic HTML | Next.js Admin | CLI |
|---------|------------|---------------|-----|
| Template CRUD | ✅ | ✅ | ✅ |
| Search & Filter | ✅ | ✅ | ✅ |
| Real-time Updates | ✅ | ✅ | ✅ |
| Statistics Dashboard | ❌ | ✅ | ❌ |
| Advanced Editor | ❌ | ✅ | ❌ |
| Responsive Design | ❌ | ✅ | ❌ |
| Type Safety | ❌ | ✅ | ✅ |
| Modern UI/UX | ❌ | ✅ | ❌ |
| Bulk Operations | ❌ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ❌ |

## Next.js Admin Interface (Recommended)

### Features

🎯 **Modern UI/UX**
- Clean, professional interface built with Tailwind CSS
- Responsive design that works on all devices
- Dark mode support and accessibility features

📊 **Advanced Analytics**
- Real-time template statistics
- Usage metrics and trends
- Top categories and tags visualization
- Recent activity tracking

📝 **Rich Template Editor**
- Tabbed interface for organized editing
- Advanced metadata management
- Context requirements and dependencies
- Form validation with helpful error messages

🔍 **Powerful Search & Filtering**
- Global text search across all template content
- Advanced filters by category, framework, complexity
- Tag-based filtering with autocomplete
- Saved search preferences

⚡ **Performance & Reliability**
- Built with Next.js 14 for optimal performance
- TypeScript for type safety and better development experience
- Real-time updates when templates change
- Optimistic UI updates for better user experience

### Getting Started

1. **Install Dependencies** (first time only):
   ```bash
   npm run admin:install
   ```

2. **Start Development Server**:
   ```bash
   npm run admin:dev
   ```

3. **Open in Browser**:
   Navigate to http://localhost:3003

### Key Components

#### Dashboard Overview
- Template count and statistics
- Quick access to recent templates
- Usage analytics and trends

#### Template List
- Paginated list of all templates
- Quick actions (edit, delete, duplicate)
- Sortable columns and bulk selection

#### Template Editor
- **Basic Info Tab**: Name, description, category, tags
- **Content Tab**: Template content and AI instructions
- **Advanced Tab**: Metadata, dependencies, context requirements

#### Search & Filters
- Global search with real-time results
- Advanced filter panel with multiple criteria
- Filter presets for common searches

### Development

The Next.js admin interface is built with:
- **React 18** with hooks and functional components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Next.js 14** with App Router
- **React Hook Form** for form management
- **Zod** for validation

## Basic HTML Interface

### Features

✅ **Simple and Fast**
- Lightweight HTML/CSS/JavaScript
- No build process required
- Works in any modern browser

✅ **Core Functionality**
- Create, read, update, delete templates
- Basic search and filtering
- Form validation

### Access

Navigate to http://localhost:3002/admin/template-manager.html when the API server is running.

### Usage

1. **Create Template**: Click "Create New Template" button
2. **Edit Template**: Click the edit icon on any template card
3. **Delete Template**: Click the delete icon (with confirmation)
4. **Search**: Use the search bar to filter templates
5. **Refresh**: Click "Refresh Templates" to reload data

## CLI Interface

### Features

✅ **Command Line Power**
- Full template management from terminal
- Scripting and automation support
- Batch operations

### Usage

```bash
# List all templates
node dist/cli.js --list-templates

# Create template from file
node dist/cli.js --create-template --file=template.json

# Search templates
node dist/cli.js --search-templates --query="requirements"

# Export templates
node dist/cli.js --export-templates --output=backup.json

# Generate document using template
node dist/cli.js --generate --template="Project Charter" --output="charter.md"
```

## API Integration

All interfaces use the same REST API endpoints:

### Core Endpoints

- `GET /api/templates` - List templates with search/filter
- `GET /api/templates/:id` - Get specific template
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Advanced Endpoints

- `GET /api/templates/stats` - Usage statistics
- `GET /api/templates/categories` - Available categories
- `GET /api/templates/tags` - Available tags
- `POST /api/templates/bulk-delete` - Delete multiple templates
- `GET /api/templates/export` - Export templates
- `POST /api/templates/import` - Import templates

### Authentication

All requests require an API key in the header:
```
x-api-key: dev-api-key-123
```

## Configuration

### Environment Variables

Create `.env.local` in the admin-interface directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_API_KEY=dev-api-key-123

# Development
NODE_ENV=development
```

### API Server Configuration

The API server configuration is in `src/api/server.ts`:

```typescript
const PORT = process.env.PORT || 3002;
const API_KEY = process.env.API_KEY || 'dev-api-key-123';
```

## Production Deployment

### Next.js Admin Interface

1. **Build for Production**:
   ```bash
   npm run admin:build
   ```

2. **Start Production Server**:
   ```bash
   npm run admin:start
   ```

3. **Environment Configuration**:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   NEXT_PUBLIC_API_KEY=your-production-api-key
   NODE_ENV=production
   ```

### Docker Deployment

```dockerfile
# Dockerfile for admin interface
FROM node:18-alpine

WORKDIR /app
COPY admin-interface/package*.json ./
RUN npm ci --only=production

COPY admin-interface/.next ./.next
COPY admin-interface/public ./public

EXPOSE 3003
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **"API Connection Failed"**
   - Ensure API server is running on port 3002
   - Check API key configuration
   - Verify network connectivity

2. **"Templates Not Loading"**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check CORS configuration

3. **"Build Errors"**
   - Clear node_modules: `rm -rf admin-interface/node_modules`
   - Reinstall: `npm run admin:install`
   - Check TypeScript errors: `cd admin-interface && npm run type-check`

### Debug Mode

Set environment variables for debugging:
```env
NODE_ENV=development
DEBUG=adpa:*
```

### Performance Optimization

1. **Reduce Bundle Size**:
   - Analyze with `npm run build` in admin-interface
   - Remove unused dependencies
   - Use dynamic imports for large components

2. **API Performance**:
   - Implement caching for frequently accessed templates
   - Use pagination for large result sets
   - Add database indexing for search fields

## Contributing

### Development Workflow

1. **Make Changes**:
   - Edit components in `admin-interface/src/components/`
   - Update types in `admin-interface/src/types/`
   - Modify API client in `admin-interface/src/lib/api.ts`

2. **Test Changes**:
   ```bash
   npm run admin:dev
   ```

3. **Build and Validate**:
   ```bash
   npm run admin:build
   ```

### Code Style

- Use TypeScript for all new code
- Follow React hooks patterns
- Use Tailwind CSS classes for styling
- Add proper error handling and loading states
- Include JSDoc comments for public functions

### Adding New Features

1. **API First**: Add endpoint to the API server
2. **Types**: Update TypeScript interfaces
3. **API Client**: Add client method
4. **Components**: Create/update React components
5. **Integration**: Wire up in main application

## Migration Guide

### From Basic HTML to Next.js

The Next.js interface provides all functionality of the basic HTML interface plus:

- Better performance and user experience
- Advanced features like analytics and bulk operations
- Type safety and better error handling
- Responsive design for mobile/tablet use

### Template Data Migration

Both interfaces use the same data format, so no migration is needed. Templates created in one interface are immediately available in the other.

## Support

For issues and questions:

1. Check this documentation
2. Review API documentation at `/api/docs`
3. Check the browser console for errors
4. Review server logs for API issues
5. File an issue in the project repository

## Future Enhancements

Planned features for the admin interfaces:

- [ ] Template versioning and history
- [ ] User authentication and permissions
- [ ] Template sharing and collaboration
- [ ] Advanced analytics and reporting
- [ ] Template marketplace/library
- [ ] AI-powered template suggestions
- [ ] Automated testing for templates
- [ ] Integration with external tools (Jira, Confluence, etc.)
