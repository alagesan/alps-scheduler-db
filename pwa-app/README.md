# ALPS Scheduler PWA

React Progressive Web App for the ALPS DB Based Scheduler system.

## Overview

This is the unified frontend for the ALPS Scheduler system, providing:
- **Google OAuth Authentication** - Secure sign-in with Google accounts
- **Role-based Access Control** - Admin and Staff roles
- **Task Viewer** - View today's, weekly, and searchable tasks
- **Admin Pages** - Task Master, User Management, Batch Control, API Test (Admin only)
- **Nginx Reverse Proxy** - Routes all API calls to backend services

## Features

### Authentication
- Google Sign-In integration using `@react-oauth/google`
- JWT token management with automatic inclusion in API requests
- Session persistence in localStorage
- Automatic redirect on token expiry

### Pages

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Home | `/` | All Users | Task viewer with Today/Week/Search tabs |
| Batch Control | `/batch` | Admin | Email batch control panel |
| Task Master | `/master` | Admin | Task CRUD with filters & search |
| Users | `/users` | Admin | User management with filters & search |
| API Test | `/api-test` | Admin | Interactive API testing |

### Task Viewer (Home)
- Three tabs: Today, Week, Search
- Department filter dropdown
- Task count summary
- Color-coded frequency badges
- Mobile responsive design

### Task Master Management
- Full CRUD operations
- Filter by department or frequency
- Search by activity name or comments
- Stats bar showing total/filtered counts

### User Management
- Full CRUD operations
- Filter by status (Enabled/Disabled) or role (Admin/Staff)
- Search by email address
- Stats bar showing total/enabled/admin counts

## Project Structure

```
pwa-app/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── App.js              # Main app with React Router
│   ├── App.css             # Main styles
│   ├── index.js            # BrowserRouter + GoogleOAuthProvider
│   ├── services/
│   │   └── api.js          # Axios with JWT interceptors
│   ├── context/
│   │   └── AuthContext.js  # Auth state management
│   ├── components/
│   │   ├── Login.js        # Google Sign-In component
│   │   └── Login.css
│   └── pages/
│       ├── Home.js         # Task viewer
│       ├── TaskMaster.js   # Task CRUD
│       ├── Users.js        # User management
│       ├── BatchControl.js # Email control
│       ├── ApiTest.js      # API testing
│       └── AdminPages.css  # Shared admin styles
├── nginx.conf              # Reverse proxy config
├── Dockerfile              # Multi-stage build
└── package.json
```

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app runs at http://localhost:3000 in development mode.

**Note:** For full functionality, you need the backend services running. Use Docker Compose from the project root.

### Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` folder.

## Docker Deployment

This app is deployed as part of the Docker Compose setup:

```bash
# From project root
docker compose up --build -d
```

The Docker build:
1. Builds React app in Node.js container
2. Serves static files via Nginx
3. Configures reverse proxy to backend services

### Nginx Configuration

The `nginx.conf` handles:
- Serving React SPA with fallback routing
- Proxying `/api/*` requests to API App
- Proxying `/api/batch/*` requests to Batch App
- Gzip compression
- Static asset caching
- PWA service worker handling

## Technology Stack

- **React 19** - UI framework
- **React Router DOM v7** - Client-side routing
- **@react-oauth/google** - Google Sign-In
- **Axios** - HTTP client with JWT interceptors
- **date-fns** - Date utilities
- **Nginx** - Production server & reverse proxy

## Environment Variables

Configure in `.env` at project root:

```
GOOGLE_OAUTH_CLIENT_ID=your-oauth-client-id.apps.googleusercontent.com
```

The React app reads this at build time via `REACT_APP_GOOGLE_CLIENT_ID`.

## API Integration

All API calls go through the Axios instance in `services/api.js`:

```javascript
import { scheduleService, masterService, userService, batchService } from './services/api';

// Examples
const tasks = await scheduleService.getToday();
const users = await userService.getAllUsers();
```

JWT tokens are automatically included via Axios interceptors.

## Related Documentation

- [Main README](../README.md) - Full project documentation
- [Quick Start](../QUICK_START.md) - Get running in 10 minutes
- [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md) - Production deployment guide
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md) - Technical details
