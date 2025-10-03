# Deedle Deployment Guide

## 🚀 GitHub Pages Deployment (Frontend Only)

### Option 1: Frontend Only (Static Demo)

Since GitHub Pages only supports static sites, you can deploy the frontend as a demo:

1. **Push to GitHub Repository**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as source
   - The workflow will automatically deploy to `monica-92592.github.io/deedle/`

3. **Access Your App**
   - Frontend: `https://monica-92592.github.io/deedle/`
   - Note: Backend features won't work without a deployed backend

### Option 2: Full Stack Deployment

For a fully functional app, you need to deploy both frontend and backend:

#### Backend Deployment Options:

**A. Railway (Recommended)**
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the `server` folder
4. Add PostgreSQL database
5. Set environment variables:
   ```
   DB_HOST=your-railway-db-host
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=your-railway-password
   JWT_SECRET=your-secret-key
   CLIENT_URL=https://monica-92592.github.io
   ```

**B. Render**
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `cd server && npm install`
5. Set start command: `cd server && npm start`
6. Add PostgreSQL database
7. Set environment variables

**C. Heroku**
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Add PostgreSQL: `heroku addons:create heroku-postgresql:hobby-dev`
4. Deploy: `git push heroku main`

#### Update Frontend API URL

After deploying your backend, update the API URL in `client/src/config/api.ts`:

```typescript
const getApiUrl = () => {
  if (window.location.hostname === 'monica-92592.github.io') {
    return 'https://your-backend-url.railway.app' // Replace with your actual backend URL
  }
  return 'http://localhost:5000'
}
```

## 🧪 Local Testing

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Set Up Database
```bash
# Install PostgreSQL locally or use Docker
docker run --name deedle-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=deedle -p 5432:5432 -d postgres:15

# Run migrations
cd server && npm run migrate
```

### 3. Configure Environment
```bash
# Copy environment template
cp server/env.example server/.env

# Edit server/.env with your database credentials
```

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run server:dev  # Backend on :5000
npm run client:dev  # Frontend on :5173
```

### 5. Test the Application
1. Open http://localhost:5173
2. Create an account
3. Upload the sample CSV file (`sample-data.csv`)
4. Explore the analytics and property details

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=deedle
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:5173
```

### Production Environment
```env
# Database (use your hosting provider's database)
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT (use a strong secret)
JWT_SECRET=your-production-jwt-secret

# Server
PORT=5000
NODE_ENV=production

# CORS
CLIENT_URL=https://monica-92592.github.io
```

## 📊 Testing Checklist

### Backend API Tests
- [ ] User registration
- [ ] User login
- [ ] CSV upload and parsing
- [ ] Property analysis and scoring
- [ ] Property filtering and search
- [ ] Analytics endpoints
- [ ] Watchlist functionality

### Frontend Tests
- [ ] Authentication flow
- [ ] Dashboard displays correctly
- [ ] CSV upload with progress
- [ ] Property list with filtering
- [ ] Property detail view
- [ ] Analytics charts
- [ ] Watchlist management
- [ ] Responsive design

### Integration Tests
- [ ] End-to-end user flow
- [ ] Data persistence
- [ ] Error handling
- [ ] Performance with large datasets

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify connection credentials
   - Ensure database exists

2. **CSV Upload Fails**
   - Check file format (must be CSV)
   - Verify file size (max 10MB)
   - Check column headers

3. **Frontend Can't Connect to Backend**
   - Verify backend is running on port 5000
   - Check CORS configuration
   - Update API_URL in config

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version (18+)
   - Verify all dependencies are installed

### Debug Commands
```bash
# Check backend logs
cd server && npm run dev

# Check frontend build
cd client && npm run build

# Test API endpoints
curl http://localhost:5000/api/health
```

## 📈 Performance Optimization

### Production Optimizations
- Enable gzip compression
- Set up CDN for static assets
- Configure database connection pooling
- Implement caching for analytics
- Add rate limiting for API endpoints

### Monitoring
- Set up error tracking (Sentry)
- Monitor database performance
- Track API response times
- Monitor user engagement

## 🔒 Security Considerations

### Production Security
- Use HTTPS everywhere
- Implement proper CORS policies
- Set up rate limiting
- Use environment variables for secrets
- Regular security updates
- Database backup strategy

### Data Protection
- Encrypt sensitive data
- Implement data retention policies
- Regular security audits
- User data privacy compliance
