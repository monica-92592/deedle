# Deedle - Tax Property Investment Analysis Platform

A comprehensive web application for analyzing tax-delinquent properties to identify profitable investment opportunities. Built for "armchair investors" who want to systematically evaluate tax lien and deed investment prospects.

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + PostgreSQL
- **Authentication**: JWT-based with bcrypt password hashing
- **File Processing**: Intelligent CSV parsing with auto-detection
- **Data Visualization**: Recharts for analytics dashboard
- **Deployment**: Docker containerization

## 🚀 Features

### Core Functionality
- **Intelligent CSV Parsing**: Auto-detects column types from various county data formats
- **Property Analysis Engine**: Calculates investment scores based on equity ratios, delinquency age, property type, and location
- **Advanced Filtering**: Filter properties by score, equity ratio, amount, type, and location
- **Portfolio Analytics**: Comprehensive dashboards with charts and statistics
- **Watchlist Management**: Save and annotate interesting properties
- **Export Capabilities**: Download filtered results as CSV

### Investment Analysis
- **Equity Ratio Calculation**: (Land Value + Improvement Value) / Delinquent Amount
- **Investment Scoring**: 0-100 weighted algorithm considering multiple factors
- **Risk Assessment**: Automatic risk level classification
- **Redemption Estimation**: Projected costs including interest and fees
- **Property Classification**: Automatic categorization by type and location quality

### User Experience
- **Responsive Design**: Mobile-friendly interface
- **Real-time Processing**: Live updates during data upload and analysis
- **Intuitive Navigation**: Clean, professional UI suitable for financial analysis
- **Educational Content**: Built-in guidance for tax lien investing

## 📊 Investment Scoring Algorithm

The platform uses a sophisticated scoring system (0-100 points):

- **Equity Ratio** (30 points): High ratio (>5:1) = +30 points
- **Delinquency Age** (20 points): Medium age (1-3 years) = +20 points
- **Property Type** (15 points): Improved properties score higher
- **Location Quality** (15 points): City locations preferred
- **Acreage Potential** (10 points): Large properties get bonus
- **Competition Level** (10 points): Lower amounts = less competition

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- Docker (optional, for containerized deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd deedle
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up the database**
   ```bash
   # Start PostgreSQL (adjust connection details as needed)
   createdb deedle
   
   # Run database migrations
   cd server && npm run migrate
   ```

4. **Configure environment variables**
   ```bash
   # Copy server environment template
   cp server/env.example server/.env
   
   # Edit server/.env with your database credentials
   ```

5. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run server:dev  # Backend on :5000
   npm run client:dev  # Frontend on :5173
   ```

### Docker Deployment

1. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec backend npm run migrate
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

## 📁 Project Structure

```
deedle/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context providers
│   │   ├── pages/        # Page components
│   │   └── main.tsx       # App entry point
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API route handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── config/          # Database configuration
│   └── scripts/         # Database migrations
├── docker-compose.yml    # Docker services
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Data Upload
- `POST /api/upload/csv` - Upload and process CSV files
- `GET /api/upload/datasets` - Get user's datasets
- `DELETE /api/upload/datasets/:id` - Delete dataset

### Properties
- `GET /api/properties` - List properties with filtering
- `GET /api/properties/:id` - Get property details
- `POST /api/properties/:id/watchlist` - Add to watchlist
- `DELETE /api/properties/:id/watchlist` - Remove from watchlist
- `GET /api/properties/export/csv` - Export properties as CSV

### Analytics
- `GET /api/analysis/portfolio/:datasetId` - Portfolio statistics
- `GET /api/analysis/trends/:datasetId` - Trend analysis
- `GET /api/analysis/location/:datasetId` - Location analytics
- `GET /api/analysis/risk/:datasetId` - Risk analysis

## 📈 Usage Guide

### 1. Getting Started
1. Create an account or log in
2. Upload your first CSV file from a county tax office
3. Review the automatic analysis results
4. Explore the analytics dashboard

### 2. Data Upload
- Download CSV files from county tax collector websites
- Supported formats: Any CSV with tax delinquency data
- Required columns: Parcel ID, Delinquent Amount, Property Description
- Optional columns: Land Value, Improvement Value, Address, etc.

### 3. Property Analysis
- Review investment scores and risk levels
- Filter by criteria that matter to you
- Add interesting properties to your watchlist
- Export results for further analysis

### 4. Portfolio Management
- Track multiple datasets over time
- Monitor high-scoring opportunities
- Use analytics to understand market trends
- Export data for external analysis

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin requests

## 📊 Sample Data Format

The platform intelligently parses various CSV formats. Here's an example:

```csv
Parcel ID,Power to Sale Date,Tax Area,Location,Delinquent Amount,Land Value,Improvement Value,Property Description,Address
123-456-789,2024-03-15,District A,Downtown,$15,000,$45,000,$120,000,"Single family residence, 3BR/2BA",123 Main St
```

## 🚨 Important Disclaimers

**This tool provides analysis based on public records. Always:**
- Verify all data with county offices
- Conduct thorough due diligence
- Consult with real estate attorney
- Inspect properties before investing
- Understand local tax sale laws
- Never invest more than you can afford to lose

**This is not financial or legal advice.**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@deedle.com or create an issue in the repository.

## 🔮 Roadmap

### Phase 2 Features
- Automated county website scraping
- Email alerts for new properties
- Zillow/Redfin API integration for comparable sales
- Mobile app version
- Collaboration features
- Historical trend analysis
- ROI calculator with scenarios
- Title company API integration

---

**Built with ❤️ for real estate investors**