# Talent Bridge - Frontend

A React + TypeScript frontend for the Talent Bridge skill swap platform, built for the Odoo Hackathon 2025.

## 🚀 Quick Start

### Prerequisites

- Node.js & npm installed
- Backend API running on `http://localhost:8000`

### Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🛠️ Tech Stack

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React** - UI framework
- **shadcn-ui** - UI components
- **Tailwind CSS** - Styling

## 🔗 Backend Integration

This frontend is designed to work with the Django REST API backend. Make sure the backend is running before starting the frontend.

### API Configuration

The frontend expects the backend API to be available at:
- Development: `http://localhost:8000/api`
- Production: Configure in environment variables

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Footer components
│   ├── modals/          # Modal components
│   ├── pages/           # Page components
│   ├── profile/         # Profile-related components
│   └── ui/              # shadcn-ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── pages/               # Route pages
```

## 🧪 Development

```sh
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🚀 Deployment

```sh
# Build for production
npm run build

# The dist/ folder contains the production build
```

## 🔧 Environment Variables

Create a `.env` file for configuration:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=Talent Bridge
```

---

**Built for Odoo Hackathon 2025**
