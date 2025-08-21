# ContentFlow Backend API

A comprehensive social media management and monetization platform backend built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

- **RESTful API Architecture**: Clean, scalable API design following REST principles
- **JWT Authentication**: Secure authentication with access and refresh tokens
- **Role-based Authorization**: User roles and permissions system
- **Input Validation**: Comprehensive request validation using express-validator
- **Error Handling**: Centralized error handling with detailed logging
- **Database Integration**: PostgreSQL with connection pooling and migrations
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Helmet.js, CORS, rate limiting, and password hashing
- **Logging**: Structured logging with Winston
- **TypeScript**: Full type safety and modern JavaScript features

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: Helmet, bcryptjs, CORS
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Development**: Nodemon, ts-node

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd contentflow-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3001
   API_VERSION=v1

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=contentflow_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_SSL=false

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-token-secret
   JWT_REFRESH_EXPIRES_IN=30d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Logging
   LOG_LEVEL=info
   LOG_FILE=logs/app.log
   ```

4. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE contentflow_db;
   CREATE USER your_db_user WITH PASSWORD 'your_db_password';
   GRANT ALL PRIVILEGES ON DATABASE contentflow_db TO your_db_user;
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001` (or your configured PORT).

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3001/api-docs`

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/logout-all` - Logout from all devices
- `GET /api/v1/auth/me` - Get current user profile

### Users
- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users/:id` - Get user by ID (admin only)
- `PUT /api/v1/users/:id` - Update user by ID
- `DELETE /api/v1/users/:id` - Deactivate user account

### Health
- `GET /api/v1/health` - Health check
- `GET /api/v1/health/ready` - Readiness check
- `GET /api/v1/health/live` - Liveness check

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure access and refresh token implementation
- **Rate Limiting**: Configurable request rate limiting
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers middleware
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Database connection and setup
│   └── environment.ts # Environment variables configuration
├── controllers/      # Request handlers
│   ├── authController.ts
│   └── userController.ts
├── middleware/       # Express middleware
│   ├── auth.ts       # Authentication middleware
│   ├── errorHandler.ts
│   ├── notFoundHandler.ts
│   └── validation.ts
├── routes/          # API routes
│   ├── auth.ts
│   ├── health.ts
│   └── users.ts
├── services/        # Business logic
│   ├── authService.ts
│   └── userService.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Utility functions
│   ├── helpers.ts
│   ├── jwt.ts
│   ├── logger.ts
│   ├── password.ts
│   └── validation.ts
└── server.ts        # Application entry point
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3001` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | Required |
| `DB_USER` | Database user | Required |
| `DB_PASSWORD` | Database password | Required |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRES_IN` | Access token expiration | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

## 🧪 Testing

The project is set up for testing with Jest (to be implemented):
```bash
npm test
```

## 📊 Monitoring and Logging

- **Winston Logger**: Structured logging with multiple transports
- **Health Checks**: Built-in health, readiness, and liveness endpoints
- **Error Tracking**: Comprehensive error logging and handling
- **Performance Monitoring**: Request timing and database query logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@contentflow.com or create an issue in the repository.

## 🔄 Changelog

### v1.0.0
- Initial release
- User authentication and authorization
- RESTful API endpoints
- PostgreSQL integration
- Comprehensive documentation
- Security middleware
- Logging and monitoring

---

**Built with ❤️ for the ContentFlow platform**