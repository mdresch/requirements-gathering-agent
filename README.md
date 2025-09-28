# ADPA Template Admin Interface

A modern, responsive admin interface for managing ADPA enterprise framework templates. Built with React, Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎯 **Modern UI/UX**: Clean, professional interface with Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🔍 **Advanced Search**: Powerful filtering and search capabilities
- 📝 **Template Editor**: Rich editor with tabbed interface for template management
- 📊 **Analytics Dashboard**: Real-time statistics and usage metrics
- 🚀 **Real-time Updates**: Live updates when templates are modified
- 🔐 **Secure**: API key authentication and validation
- ⚡ **Fast**: Optimized for performance with Next.js

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Lucide React Icons
- **Forms**: React Hook Form with Zod validation
- **API Client**: Custom fetch-based client
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- ADPA API server running on port 3002

### Installation

1. Navigate to the admin interface directory:
```bash
cd admin-interface
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.local.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_API_KEY=dev-api-key-123
```

### Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3003](http://localhost:3003) in your browser

3. The admin interface will connect to your ADPA API server

### Production Build

```bash
npm run build
npm start
```

## Architecture

```
src/
├── app/                   # Next.js App Router pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── TemplateList.tsx  # Template listing and pagination
│   ├── TemplateEditor.tsx # Template creation/editing
│   ├── TemplateStats.tsx # Analytics dashboard
│   ├── SearchFilters.tsx # Search and filtering
│   └── Navbar.tsx        # Navigation bar
├── lib/                  # Utilities and services
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
└── types/               # TypeScript definitions
    └── template.ts      # Template type definitions
```

## Key Components

### TemplateList
- Displays templates in a responsive grid
- Pagination support
- Quick actions (edit, delete)
- Loading states and empty states

### TemplateEditor
- Tabbed interface (Basic Info, Content, Advanced)
- Form validation with error display
- Support for tags, context requirements, dependencies
- Rich metadata editing

### TemplateStats
- Real-time statistics dashboard
- Top categories and tags visualization
- Recent activity tracking
- Usage metrics

### SearchFilters
- Global search across template content
- Category, framework, and complexity filters
- Tag-based filtering
- Advanced filter toggles

## API Integration

The admin interface integrates with the ADPA Template API:

- **GET /api/templates** - List and search templates
- **GET /api/templates/:id** - Get specific template
- **POST /api/templates** - Create new template
- **PUT /api/templates/:id** - Update template
- **DELETE /api/templates/:id** - Delete template
- **GET /api/templates/stats** - Get usage statistics

## Customization

### Styling
Templates use Tailwind CSS classes. Customize colors and spacing in `tailwind.config.js`.

### Components
All components are modular and can be customized. Each component has clear props interfaces.

### API Configuration
API endpoints and authentication can be modified in `src/lib/api.ts`.

## Contributing

1. Follow TypeScript best practices
2. Use functional components with hooks
3. Maintain responsive design patterns
4. Add proper error handling
5. Include loading states
6. Write descriptive commit messages

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ADPA API base URL | `http://localhost:3002` |
| `NEXT_PUBLIC_API_KEY` | API authentication key | `dev-api-key-123` |
| `NODE_ENV` | Environment mode | `development` |

## Performance

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Run `npm run build` to see bundle sizes
- **Caching**: API responses cached appropriately

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure ADPA API server is running on port 3002
   - Check API key in environment variables
   - Verify network connectivity

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS classes
   - Verify PostCSS configuration

### Debug Mode

Set `NODE_ENV=development` to enable:
- Detailed error messages
- React Developer Tools support
- Hot reloading
- Source maps

## License

This project is part of the ADPA Enterprise Framework and follows the same licensing terms.
