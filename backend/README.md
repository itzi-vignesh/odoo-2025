# Talent Bridge - Backend API

A Django REST Framework backend for the Talent Bridge skill swap platform, built for the Odoo Hackathon 2025.

## 🏗️ Architecture

### Tech Stack
- **Django 4.2.7** - Web framework
- **Django REST Framework** - API framework
- **JWT Authentication** - Secure token-based auth
- **SQLite** - Database (development)
- **Django CORS Headers** - Frontend integration

### Apps Structure
```
backend/
├── users/          # User management, authentication, badges
├── skills/         # Skills and user skills management  
├── swaps/          # Swap requests and ratings
├── notifications/  # User notifications
└── skillswap_backend/ # Main project settings
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup Database
```bash
# Run the setup script
python setup_backend.py

# Or manually:
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Optional
```

### 3. Start Development Server
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### 4. Test API Endpoints
```bash
# Run API tests
python test_api.py
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `POST /api/auth/logout/` - User logout

### User Management
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/update/` - Update user profile
- `GET /api/users/discover/` - Discover users (public profiles)
- `GET /api/users/<id>/` - Get specific user details
- `GET /api/users/badges/` - Get user badges
- `GET /api/users/stats/` - Get user statistics

### Skills Management
- `GET /api/skills/` - List all skills
- `GET /api/skills/categories/` - Get skill categories
- `GET /api/skills/my-skills/` - Get current user's skills
- `POST /api/skills/add/` - Add skill to user
- `DELETE /api/skills/remove/<id>/` - Remove skill from user

### Swap Requests
- `GET /api/swaps/` - List swap requests
- `POST /api/swaps/` - Create swap request
- `GET /api/swaps/<id>/` - Get swap request details
- `GET /api/swaps/my-requests/` - Get user's swap requests
- `POST /api/swaps/<id>/accept/` - Accept swap request
- `POST /api/swaps/<id>/reject/` - Reject swap request
- `POST /api/swaps/<id>/complete/` - Mark swap as completed
- `POST /api/swaps/<id>/rate/` - Rate completed swap
- `GET /api/swaps/stats/` - Get swap statistics

### Notifications
- `GET /api/notifications/` - List user notifications
- `POST /api/notifications/<id>/mark-read/` - Mark notification as read
- `POST /api/notifications/mark-all-read/` - Mark all notifications as read
- `GET /api/notifications/unread-count/` - Get unread count

### Admin Endpoints (Admin only)
- `GET /api/users/admin/users/` - List all users
- `GET /api/users/admin/users/<id>/` - Get user details
- `POST /api/users/admin/users/<id>/toggle-status/` - Toggle user active status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

### Token Lifecycle
- Access tokens expire in 60 minutes
- Refresh tokens expire in 7 days
- Refresh tokens are rotated on use

## 📊 Database Models

### User Model
- Custom user model extending Django's AbstractUser
- Fields: email, first_name, last_name, bio, location, avatar, role, rating, total_swaps
- Roles: 'user', 'admin'

### Skills Models
- **Skill**: Master list of available skills with categories
- **UserSkill**: User's offered/wanted skills with proficiency levels

### Swap Models
- **SwapRequest**: Swap requests between users
- **Rating**: Ratings and feedback for completed swaps

### Additional Models
- **Notification**: User notifications system
- **Badge**: Achievement badges
- **UserBadge**: User-badge relationships

## 🛡️ Security Features

- JWT-based authentication
- Role-based permissions (user/admin)
- CORS configured for frontend integration
- Password validation
- Input sanitization and validation

## 🔧 Configuration

### Environment Variables
Create a `.env` file for production:
```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=your-database-url
```

### CORS Settings
Configured for common frontend development servers:
- `http://localhost:3000` (React)
- `http://localhost:5173` (Vite)

## 🧪 Testing

### Manual Testing
```bash
# Test all API endpoints
python test_api.py

# Run Django tests
python manage.py test
```

### Test User Account
The API test script creates a test user:
- Email: `test@talentbridge.com`
- Password: `testpassword123`

## 🚀 Deployment

### Production Checklist
- [ ] Set `DEBUG=False`
- [ ] Configure proper database (PostgreSQL recommended)
- [ ] Set secure `SECRET_KEY`
- [ ] Configure proper CORS origins
- [ ] Set up proper media file serving
- [ ] Configure logging
- [ ] Set up monitoring

### Docker Support (Optional)
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

## 📱 Frontend Integration

This backend is designed to work with the React + TypeScript frontend. Key integration points:

### API Base URL
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### Authentication Headers
```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};
```

### Sample API Calls
```javascript
// User registration
const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Get user profile
const getProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users/profile/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## 📝 License

This project is built for the Odoo Hackathon 2025.

## 🤝 Contributing

This is a hackathon project, but feel free to fork and improve!

## 📞 Support

For questions or issues during the hackathon, please reach out to the development team.

---

**Built with ❤️ for Odoo Hackathon 2025**
