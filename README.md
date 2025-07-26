# WantedTracker

A comprehensive law enforcement portal for browsing and searching the FBI's Most Wanted database. Features modern React architecture with robust backend caching and authentication.

## Tech Stack

### Backend
- **Node.js 20** - Runtime environment
- **Express 5** - Web framework
- **Axios** - HTTP client for FBI API calls
- **Redis** - Distributed caching (5-minute TTL, fallback to in-memory)
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS 3** - Styling framework

### Testing
- **Jest** - Backend testing framework (Node.js/API)
- **Vitest** - Frontend testing framework (React components)
- **Supertest** - HTTP testing (backend)
- **React Testing Library** - Component testing (frontend)

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Redis** - Caching service
- **Nginx** - Production web server for frontend

##  Features

### Core Functionality
- **Browse** FBI Most Wanted list with infinite scroll/pagination
- **Search** wanted persons by name or description
- **Filter** by hair color and race
- **View Details** - Complete person information with images
- **Mobile-First Design** - Responsive across all devices
- **Error Handling** - Friendly error messages and loading states
- **Caching** - 5-minute server-side caching for improved performance

### API Endpoints
- `GET /api/wanted?page={n}&pageSize={size}` - List wanted persons
- `GET /api/wanted/search?query={q}` - Search wanted persons
- `GET /api/wanted/:id` - Get person details
- `GET /api/wanted/filters/options` - Get available filter options
- `GET /health` - Health check endpoint

## 📁 Project Structure

```
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── Header.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── WantedCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── WantedList.jsx
│   │   │   └── WantedDetail.jsx
│   │   ├── store/              # Zustand store
│   │   │   └── wantedStore.js
│   │   ├── utils/              # Utility functions
│   │   │   └── debounce.js
│   │   ├── tests/              # Frontend tests
│   │   └── App.jsx
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Backend Node.js application
│   ├── routes/
│   │   └── wanted.js
│   ├── tests/
│   │   └── wanted.test.js
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js 20+**
- **Docker & Docker Compose**
- **Git**

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fbi-wanted-directory
   ```

2. **Environment Setup**
   ```bash
   # Server environment
   cp server/env.example server/.env
   # Client environment  
   cp client/env.example client/.env
   ```

3. **Backend Setup**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   Backend runs on http://localhost:4000

4. **Frontend Setup** (in new terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Frontend runs on http://localhost:3000

5. **Demo Authentication**
   - Username: `admin`
   - Password: `admin`
   - Note: This is for demonstration purposes only

### Workspace Commands (from root)

```bash
# Development
npm run dev:server        # Start backend development server
npm run dev:client         # Start frontend development server

# Testing
npm run test              # Run all tests
npm run test:server       # Run backend tests only
npm run test:client       # Run frontend tests only

# Linting
npm run lint              # Lint all code
npm run lint:server       # Lint backend only
npm run lint:client       # Lint frontend only

# Docker
npm run docker:build      # Build Docker images
npm run docker:up         # Start all services
npm run docker:down       # Stop all services
```

### Docker Development

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Health Check: http://localhost:4000/health

3. **Stop the containers**
   ```bash
   docker-compose down
   ```

## Testing

### Backend Tests (Jest + Supertest)
```bash
cd server
npm test                # Run Jest tests
npm run test:watch      # Jest watch mode
npm run test:coverage   # Jest coverage report
```

### Frontend Tests (Vitest + React Testing Library)
```bash
cd client
npm test                # Run Vitest tests
npm run test:watch      # Vitest watch mode
npm run test:ui         # Vitest interactive UI
npm run test:coverage   # Vitest coverage report
```

### Test Coverage Requirements
- **Minimum 80% coverage** for all metrics (branches, functions, lines, statements)
- Tests include API endpoints, components, and store functionality
- Mocked external API calls for consistent testing

## Environment Variables

Copy the example files and customize as needed:

```bash
cp server/env.example server/.env
cp client/env.example client/.env
```

### Backend (server/.env)
```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
REDIS_URL=redis://localhost:6379
FBI_API_BASE_URL=https://api.fbi.gov
CACHE_TTL=300
```

### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:4000
VITE_DEV_MODE=true
VITE_API_BASE_PATH=/api
VITE_LOGIN_REDIRECT_PATH=/
```

## Docker Configuration

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.yml build

# Run in production mode
docker-compose up -d
```

### Docker Services
- **Backend**: Node.js API server with health checks
- **Frontend**: Nginx serving built React app with API proxy
- **Network**: Bridge network for inter-service communication

## Performance & Monitoring

### Health Checks
- Backend: HTTP health check on `/health` endpoint
- Frontend: Nginx availability check
- Automatic container restart on failure

### Caching Strategy
- **Server-side**: 5-minute Redis cache for FBI API responses (with in-memory fallback)
- **Client-side**: Browser caching for static assets
- **Nginx**: Gzip compression and static asset caching

### Performance Targets
- **Lighthouse Mobile Score**: ≥90
- **API Response Time**: <2 seconds
- **Page Load Time**: <3 seconds

## Security

### Authentication
- **JWT Tokens** - Secure session management
- **Demo Credentials** - Username: `admin`, Password: `admin` (for testing only)
- **Token Expiration** - 24-hour token validity
- **Protected Routes** - All FBI API endpoints require authentication

### Backend Security
- **Helmet.js** - Security headers
- **CORS** - Configured cross-origin requests
- **Rate Limiting** - FBI API request management
- **Input Validation** - Query parameter sanitization

### Frontend Security
- **CSP Headers** - Content Security Policy
- **XSS Protection** - Cross-site scripting prevention
- **HTTPS Ready** - SSL/TLS support
- **Local Storage** - Secure token storage

##  API Integration

### FBI Most Wanted API
- **Base URL**: https://api.fbi.gov/wanted/v1
- **Rate Limiting**: Handled with caching and request optimization
- **Data Format**: JSON responses with person details and images
- **Error Handling**: Graceful fallbacks for API failures

##  CI/CD Ready

### Code Quality
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Jest + Vitest** - Automated testing (hybrid setup)
- **Docker** - Consistent deployment

### Development Workflow
```bash
# Code quality checks
npm run lint
npm run format
npm test

# Docker builds
docker-compose up --build
```

##  Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :4000
   ```

2. **Docker build failures**
   ```bash
   # Clean Docker cache
   docker system prune -a
   docker-compose down -v
   ```

3. **API connection issues**
   - Verify FBI API availability
   - Check network connectivity
   - Review backend logs: `docker-compose logs backend`

4. **Frontend build issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Ensure all tests pass
5. Submit a pull request

##  Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review FBI API documentation: https://api.fbi.gov/docs

---

