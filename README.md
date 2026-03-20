# QuickBite - Modern Food Delivery Platform

A full-stack food delivery application built with React (frontend) and Django (backend), featuring a modern glassmorphism UI design.

## 🚀 Features

### Frontend (React)
- **Modern Glassmorphism UI**: Beautiful, futuristic design with animated gradients and glass effects
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Authentication**: User registration, login, and profile management
- **Menu Management**: Browse menu items with filtering and search
- **Order System**: Place orders with cart functionality
- **Order Tracking**: View order history and track order status
- **Admin Dashboard**: Manage orders and menu items
- **Real-time Updates**: Live order status updates

### Backend (Django)
- **RESTful API**: Complete API with Django REST Framework
- **JWT Authentication**: Secure token-based authentication
- **Database Models**: Users, menu items, orders, reviews
- **Admin Panel**: Django admin for backend management
- **CORS Support**: Configured for frontend integration
- **MySQL Database**: Production-ready database setup

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Framer Motion (animations)
- Axios (HTTP client)
- React Query (data fetching)
- React Hot Toast (notifications)
- Heroicons (icons)

### Backend
- Django 4.2
- Django REST Framework
- JWT Authentication
- MySQL Database
- Python Decouple (environment variables)
- CORS Headers

## 📦 Installation

### Prerequisites
- Node.js 16+
- Python 3.8+
- MySQL/MariaDB
- XAMPP (for local development)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up database**
   - Create MySQL database named `quickbite_db`
   - Update database credentials in `.env`

6. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

8. **Start development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Start development server**
   ```bash
   npm start
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PATCH /api/auth/profile/update/` - Update user profile

### Menu
- `GET /api/menu/categories/` - Get all categories
- `GET /api/menu/items/` - Get all menu items
- `GET /api/menu/items/featured/` - Get featured items
- `GET /api/menu/items/{id}/` - Get specific menu item
- `POST /api/menu/items/{id}/add_review/` - Add review to menu item

### Orders
- `POST /api/orders/` - Create new order
- `GET /api/orders/` - Get all orders (admin)
- `GET /api/orders/my_orders/` - Get user orders
- `GET /api/orders/{id}/` - Get specific order
- `PATCH /api/orders/{id}/update_status/` - Update order status (admin)
- `GET /api/orders/{id}/tracking/` - Get order tracking

## 🎨 UI Features

### Glassmorphism Design
- Animated gradient backgrounds
- Glass-morphism cards with backdrop blur
- Soft neon color scheme
- Smooth hover animations
- Floating elements

### Interactive Elements
- Responsive navigation with mobile menu
- Animated hero section
- Interactive menu cards
- Shopping cart functionality
- Order status tracking
- User profile management

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔧 Development

### Running in Development

1. Start the backend server:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm start
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin Panel: http://localhost:8000/admin

### Building for Production

1. **Frontend build**
   ```bash
   cd frontend
   npm run build
   ```

2. **Backend deployment**
   - Set `DEBUG=False` in production
   - Configure production database
   - Set up static files serving
   - Configure domain and SSL

## 🗄️ Database Schema

### Users
- Custom user model with roles (customer, admin, delivery)
- Profile with avatar and bio

### Menu
- Categories for organizing menu items
- Menu items with pricing, images, and metadata
- Reviews and ratings system

### Orders
- Order management with status tracking
- Order items with quantities and prices
- Order tracking history

## 🔐 Security

- JWT token authentication
- Password hashing
- CORS configuration
- Input validation
- SQL injection prevention

## 📞 SMS Integration

The application integrates with Africa's Talking for SMS notifications:
- Order confirmation SMS
- Status update notifications
- Delivery alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**QuickBite** - Delivering delicious meals with modern technology! 🍔✨