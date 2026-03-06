# Job Scanner - React Frontend

Modern React + TypeScript frontend for the Job Scanner application.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## 📁 Project Structure

```
src/
├── api/              # API clients (axios)
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── layout/      # Layout components
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── store/           # Zustand state stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── test/            # Test setup and utilities
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Zustand** - State management
- **TanStack Query** - Data fetching & caching
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vitest** - Testing

## 🔌 API Integration

The frontend automatically detects the API endpoint:

- **Development**: `http://localhost:5000/api`
- **Production** (nginx): `/api` (proxied)

Configure in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🔐 Authentication

JWT-based authentication with automatic token refresh:

1. Login with credentials
2. Access token stored in localStorage
3. Token automatically added to requests
4. Refresh token on 401 errors
5. Logout redirects to login page

Default credentials:
- Username: `admin`
- Password: `Admin@123456`

## 📦 State Management

**Zustand stores:**

- `authStore` - Authentication state
- `jobStore` - Jobs data & filters
- `scanStore` - Scan progress

**TanStack Query:**

- Server state caching
- Automatic refetching
- Optimistic updates
- Request deduplication

## 🎨 Styling

Tailwind CSS with custom utility classes:

```tsx
// Buttons
<button className="btn btn-primary">Click me</button>

// Cards
<div className="card">Content</div>

// Inputs
<input className="input" />
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm test -- --coverage
```

## 🚢 Deployment

### Docker

Build the Docker image:

```bash
docker build -t job-scanner-react .
```

Run the container:

```bash
docker run -p 3000:80 job-scanner-react
```

### Production Build

```bash
npm run build
```

Output in `dist/` directory.

## 📝 Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_ENV=development
```

## 🔄 Migration Status

This React frontend is migrating from vanilla JavaScript.

**Completed:**
- ✅ Project setup
- ✅ Authentication flow
- ✅ API clients
- ✅ State management
- ✅ Basic layout

**In Progress:**
- ⏳ Job components
- ⏳ Scan progress
- ⏳ Filtering & search
- ⏳ Job tracking forms

**Planned:**
- 📋 WebSocket integration
- 📋 Advanced features
- 📋 Testing coverage
- 📋 Performance optimization

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Zustand Docs](https://docs.pmnd.rs/zustand/)
- [TanStack Query](https://tanstack.com/query/latest)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Build: `npm run build`
6. Submit pull request

## 📄 License

Private project for job searching and tracking.
