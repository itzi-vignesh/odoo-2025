# SkillSwap Frontend

A modern React-based frontend for the SkillSwap platform - a peer-to-peer skill exchange application.

## Features

- **User Authentication**: Secure login and registration system
- **Profile Management**: Complete user profile with skills, bio, and preferences
- **Skill Exchange**: Request and manage skill swaps with other users
- **Admin Panel**: Comprehensive admin interface for platform management
- **Real-time Notifications**: Stay updated with platform activities
- **Responsive Design**: Works seamlessly across all devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **Axios** for API communication
- **React Query** for data fetching and caching

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Base UI components (shadcn/ui)
│   ├── layout/        # Layout components
│   ├── pages/         # Page components
│   └── modals/        # Modal components
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── pages/             # Main page components
└── styles/            # Global styles
```

## Development

### Adding New Components

1. Create your component in the appropriate directory
2. Use the existing UI components from `@/components/ui`
3. Follow the established patterns for styling and structure

### API Integration

- API calls are handled through `@/lib/api`
- Error handling is centralized in `@/lib/errorHandler`
- Authentication tokens are managed automatically

### Styling

- Use Tailwind CSS classes for styling
- Follow the established design system
- Use CSS variables for theming

## Contributing

1. Follow the existing code style
2. Add appropriate TypeScript types
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is part of the SkillSwap platform.
