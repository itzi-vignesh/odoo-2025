# Talent Bridge - Skill Swap Platform

This project is a skill swap platform developed for the Odoo Hackathon 2025. It allows users to offer their skills and request skill swaps with other users.

## Project Structure

The project consists of two main components:

- **Frontend**: A React + TypeScript application with modern UI components
- **Backend**: A Django REST Framework API with comprehensive admin functionality

## Features

### User Features
- **User Registration & Authentication**: Secure JWT-based authentication
- **Profile Management**: Complete user profiles with skills, ratings, and statistics
- **Skill Management**: Offer and request skills with detailed descriptions
- **Swap Requests**: Send and manage skill swap requests
- **Rating System**: Rate other users after completed swaps
- **Real-time Notifications**: Stay updated with swap requests and ratings
- **Public/Private Profiles**: Control profile visibility

### Admin Features
- **User Management**: View, ban, and unban users
- **Skills Review**: Review and manage user skills
- **Swap Management**: Monitor and manage swap requests
- **Analytics Dashboard**: View platform statistics and user activity

## Backend Setup

### Prerequisites

- Python 3.10+
- Virtual environment (optional but recommended)

### Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment (optional):
   ```
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow
   ```

4. Run migrations:
   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Seed the database with sample data:
   ```
   python manage.py shell < seed_data.py
   ```

6. Start the development server:
   ```
   python manage.py runserver
   ```

   Or use the provided script:
   ```
   run_server.bat
   ```

The backend server will be running at `http://localhost:8000/`.

### API Endpoints

- **Authentication**:
  - `POST /api/auth/register/`: Register a new user
  - `POST /api/auth/login/`: Login and get JWT tokens
  - `POST /api/auth/token/refresh/`: Refresh JWT token

- **Users**:
  - `GET /api/users/`: List public users
  - `GET /api/users/me/`: Get current user profile
  - `PATCH /api/users/me/`: Update current user profile
  - `POST /api/users/me/toggle_public/`: Toggle profile visibility

- **Skills**:
  - `GET /api/skills/`: List all skills
  - `GET /api/skills/popular/`: List popular skills
  - `GET /api/user-skills/offered/`: List current user's offered skills
  - `GET /api/user-skills/wanted/`: List current user's wanted skills
  - `POST /api/user-skills/`: Add a new skill for current user

- **Swap Requests**:
  - `GET /api/swaps/`: List all swaps for current user
  - `GET /api/swaps/sent/`: List sent swap requests
  - `GET /api/swaps/received/`: List received swap requests
  - `POST /api/swaps/`: Create a new swap request
  - `PATCH /api/swaps/{id}/`: Update swap request status

- **Ratings**:
  - `GET /api/ratings/`: List ratings for current user
  - `POST /api/ratings/`: Create a new rating

- **Notifications**:
  - `GET /api/notifications/`: List all notifications
  - `GET /api/notifications/unread/`: List unread notifications
  - `POST /api/notifications/mark_all_read/`: Mark all notifications as read

- **Admin**:
  - `GET /api/admin/users/`: List all users (admin only)
  - `GET /api/admin/users_detailed/`: Get detailed user information (admin only)
  - `GET /api/admin/skills/`: List all user skills (admin only)
  - `GET /api/admin/swaps/`: List all swaps (admin only)
  - `GET /api/admin/ratings/`: List all ratings (admin only)
  - `POST /api/admin/users/{id}/ban/`: Ban a user (admin only)
  - `POST /api/admin/users/{id}/unban/`: Unban a user (admin only)

## Frontend Setup

### Prerequisites

- Node.js (v16+)
- Bun or npm

### Setup

1. Navigate to the frontend directory:
   ```
   cd Frontend
   ```

2. Install dependencies:
   ```
   bun install
   # or
   npm install
   ```

3. Start the development server:
   ```
   bun dev
   # or
   npm run dev
   ```

The frontend will be running at `http://localhost:5173/`.

## Testing the Application

1. Start both the frontend and backend servers as described above.

2. Register a new user or use one of the sample users:
   - Username: `alice`, Password: `password123`
   - Username: `bob`, Password: `password123`
   - Username: `admin`, Password: `admin123` (admin user with full access)

3. **Admin Access**: Login as admin to access the admin panel with user management, skills review, and analytics.

## Key Features & Recent Improvements

### User Experience
- **Homepage**: Shows all users by default with filtering options
- **Profile Pages**: Display real user data with statistics and skill information
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Profile data refreshes automatically

### Admin Panel
- **User Management**: View, ban, and unban users with detailed information
- **Skills Review**: Review and manage user skills with backend integration
- **Analytics**: View platform statistics and user activity
- **Swap Management**: Monitor all swap requests and their status

### Technical Improvements
- **Optimized Data Loading**: Prevents multiple reloads and improves performance
- **Error Handling**: Comprehensive error handling for all API calls
- **JWT Authentication**: Secure token-based authentication system
- **CORS Configuration**: Proper cross-origin resource sharing setup

## Integrating Frontend with Backend

To connect the frontend to the backend API:

1. Use the provided API client in `Frontend/src/lib/api.ts`.

2. Import the API functions in your components:
   ```typescript
   import { userAPI, skillAPI, swapAPI } from '../lib/api';
   ```

3. Call the API functions in your components:
   ```typescript
   const handleLogin = async (credentials) => {
     try {
       const response = await authAPI.login(credentials);
       localStorage.setItem('accessToken', response.data.access);
       localStorage.setItem('refreshToken', response.data.refresh);
       localStorage.setItem('user', JSON.stringify(response.data.user));
       // Redirect to homepage or dashboard
     } catch (error) {
       console.error('Login failed', error);
       // Handle error
     }
   };
   ```

## Development Notes

- The frontend uses React with TypeScript for type safety
- The backend uses Django REST Framework with JWT authentication
- All API endpoints are properly documented and tested
- Admin functionality is restricted to admin users only
- User data is properly validated and sanitized

## License

This project is developed for the Odoo Hackathon 2025 and is not licensed for commercial use.
