# 🏆 Talent Bridge - Complete Django Backend

## 📋 Project Summary

**Talent Bridge** is a comprehensive skill swap platform backend built for the Odoo Hackathon 2025. It provides a robust REST API for connecting people who want to exchange skills and knowledge.

## 🎯 Key Features

### ✅ Completed Features

1. **🔐 Authentication System**
   - JWT-based authentication with access/refresh tokens
   - User registration and login
   - Role-based permissions (user/admin)
   - Secure logout functionality

2. **👥 User Management**
   - Custom user model with profiles
   - Public/private profile visibility
   - User discovery and search
   - Avatar upload support
   - User statistics and badges system

3. **🎯 Skills Management**
   - Comprehensive skill catalog with categories
   - User skills (offered/wanted) with proficiency levels
   - Skill search and filtering
   - Personal skill descriptions

4. **🔄 Swap System**
   - Swap request creation and management
   - Accept/reject/complete swap workflow
   - Detailed swap tracking
   - Rating and feedback system

5. **🔔 Notifications**
   - Real-time notification system
   - Multiple notification types
   - Read/unread status tracking
   - Notification preferences

6. **🏆 Achievement System**
   - Badge system for user achievements
   - Progress tracking
   - Community recognition

7. **🛡️ Admin Features**
   - Admin dashboard access
   - User management
   - Platform moderation tools

## 🏗️ Technical Architecture

### Backend Stack
- **Django 4.2.7** - Web framework
- **Django REST Framework** - API framework
- **JWT Authentication** - Secure token-based auth
- **SQLite** - Database (development)
- **CORS Headers** - Frontend integration
- **Pillow** - Image processing

### Database Schema

```
Users App:
- User (Custom user model)
- Badge (Achievement badges)
- UserBadge (User-badge relationships)

Skills App:
- Skill (Master skill catalog)
- UserSkill (User's skills with proficiency)

Swaps App:
- SwapRequest (Skill exchange requests)
- Rating (Post-swap ratings and feedback)

Notifications App:
- Notification (User notification system)
```

## 🚀 API Endpoints

### Authentication (`/api/auth/`)
```
POST /register/          - User registration
POST /login/             - User login
POST /logout/            - User logout
POST /token/refresh/     - Refresh JWT token
```

### User Management (`/api/auth/`)
```
GET  /profile/           - Get user profile
PUT  /profile/update/    - Update user profile
GET  /discover/          - Discover users
GET  /user/{id}/         - Get user details
GET  /badges/            - Get user badges
GET  /stats/             - Get user statistics
```

### Skills (`/api/skills/`)
```
GET  /                   - List all skills
GET  /categories/        - Get skill categories
GET  /my-skills/         - Get user's skills
POST /add/               - Add skill to user
DEL  /remove/{id}/       - Remove skill from user
```

### Swaps (`/api/swaps/`)
```
GET  /                   - List swap requests
POST /                   - Create swap request
GET  /{id}/              - Get swap details
GET  /my-requests/       - Get user's requests
POST /{id}/accept/       - Accept swap
POST /{id}/reject/       - Reject swap
POST /{id}/complete/     - Complete swap
POST /{id}/rate/         - Rate swap
GET  /stats/             - Get swap statistics
```

### Notifications (`/api/notifications/`)
```
GET  /                   - List notifications
POST /{id}/mark-read/    - Mark as read
POST /mark-all-read/     - Mark all as read
GET  /unread-count/      - Get unread count
```

### Admin (`/api/auth/admin/`)
```
GET  /users/             - List all users (admin)
GET  /users/{id}/        - Get user details (admin)
POST /users/{id}/toggle-status/ - Toggle user status (admin)
```

## 📁 Project Structure

```
backend/
├── skillswap_backend/          # Main project settings
│   ├── settings.py            # Django configuration
│   ├── urls.py               # Main URL routing
│   ├── wsgi.py               # WSGI configuration
│   └── asgi.py               # ASGI configuration
├── users/                     # User management app
│   ├── models.py             # User, Badge, UserBadge models
│   ├── serializers.py        # User serializers
│   ├── views.py              # Authentication & user views
│   ├── admin.py              # Admin interface
│   └── urls.py               # User URL routing
├── skills/                    # Skills management app
│   ├── models.py             # Skill, UserSkill models
│   ├── serializers.py        # Skill serializers
│   ├── views.py              # Skill management views
│   ├── admin.py              # Skills admin interface
│   └── urls.py               # Skills URL routing
├── swaps/                     # Swap system app
│   ├── models.py             # SwapRequest, Rating models
│   ├── serializers.py        # Swap serializers
│   ├── views.py              # Swap management views
│   ├── admin.py              # Swaps admin interface
│   └── urls.py               # Swaps URL routing
├── notifications/             # Notification system app
│   ├── models.py             # Notification model
│   ├── serializers.py        # Notification serializers
│   ├── views.py              # Notification views
│   ├── admin.py              # Notifications admin
│   └── urls.py               # Notifications URL routing
├── manage.py                  # Django management script
├── requirements.txt           # Python dependencies
├── setup_backend.py           # Setup automation script
├── create_sample_data.py      # Sample data creation
├── test_api.py               # API testing script
├── check_setup.py            # Setup verification
└── README.md                  # Documentation
```

## 🔧 Setup Instructions

### 1. Environment Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Create sample data (optional)
python create_sample_data.py
```

### 3. Run Development Server
```bash
python manage.py runserver
```

### 4. Test API
```bash
# Run API tests
python test_api.py
```

## 🌐 Frontend Integration

### API Base URL
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### Authentication Flow
```javascript
// Register user
const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Login user
const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

// Authenticated requests
const getProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### Sample Integration Code
```javascript
// Skills management
const getUserSkills = async (token) => {
  const response = await fetch(`${API_BASE_URL}/skills/my-skills/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Swap requests
const createSwapRequest = async (token, swapData) => {
  const response = await fetch(`${API_BASE_URL}/swaps/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(swapData)
  });
  return response.json();
};

// Notifications
const getNotifications = async (token) => {
  const response = await fetch(`${API_BASE_URL}/notifications/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## 🧪 Testing

### Sample Test Users
```
Email: alice@example.com       | Password: password123 | Role: Developer
Email: bob@example.com         | Password: password123 | Role: Designer  
Email: charlie@example.com     | Password: password123 | Role: Chef
Email: diana@example.com       | Password: password123 | Role: Language Teacher
Email: admin@talentbridge.com  | Password: password123 | Role: Admin
```

### Manual Testing Workflow
1. Register new user or login with sample user
2. Update user profile and add skills
3. Browse other users and their skills
4. Create swap requests
5. Accept/reject swap requests
6. Complete swaps and leave ratings
7. Check notifications
8. Test admin functions (with admin user)

## 🚀 Deployment Ready

### Production Checklist
- [x] Environment variables support
- [x] CORS configuration
- [x] Secure JWT settings
- [x] Admin interface
- [x] Error handling
- [x] Input validation
- [x] Role-based permissions
- [x] API documentation
- [x] Database migrations
- [x] Media file handling

### Environment Variables (.env)
```env
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=your-database-url
CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

## 📊 Performance Features

- **Efficient Queries**: Optimized database queries with select_related and prefetch_related
- **Pagination**: Built-in pagination for all list endpoints
- **Caching Ready**: Structure supports Redis caching implementation
- **Indexing**: Database indexes on frequently queried fields
- **File Upload**: Optimized image handling with Pillow

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Validation**: Strong password requirements
- **CORS Protection**: Configured for specific origins
- **Input Sanitization**: All inputs validated and sanitized
- **Role-based Access**: Admin/user role separation
- **Rate Limiting Ready**: Structure supports rate limiting

## 📈 Scalability

- **Modular Architecture**: Separated apps for different features
- **RESTful Design**: Standard REST API patterns
- **Database Optimization**: Efficient schema design
- **Async Ready**: Compatible with Django async views
- **Microservices Ready**: Apps can be separated into microservices

## 🎉 Hackathon Ready

This backend is **100% ready** for the Odoo Hackathon 2025 demo:

1. ✅ **Complete Feature Set**: All core and advanced features implemented
2. ✅ **Production Quality**: Clean, documented, tested code
3. ✅ **API First**: Designed for frontend integration
4. ✅ **Demo Ready**: Sample data and test accounts available
5. ✅ **Scalable**: Built for growth and expansion
6. ✅ **Secure**: Industry-standard security practices
7. ✅ **Well Documented**: Comprehensive documentation and examples

## 🏆 Next Steps

1. **Connect Frontend**: Integrate with the React TypeScript frontend
2. **Live Demo**: Deploy to cloud platform for live demonstration
3. **Enhanced Features**: Add real-time messaging, video calls, etc.
4. **Mobile App**: Extend API for mobile applications
5. **Analytics**: Add detailed analytics and reporting

---

**Built with ❤️ for Odoo Hackathon 2025**
**Ready to demonstrate the future of skill sharing! 🚀**
