# FertiSmart Backend

A Flask-based backend API for the FertiSmart soil testing application with Supabase integration.

## Features

- RESTful API endpoints for soil testing
- Supabase database integration
- CORS enabled for frontend communication
- Soil test data storage and retrieval
- Fertilizer recommendation engine
- Error handling and logging

## Setup

### Prerequisites

- Python 3.8+
- Supabase account and project

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
   - Copy `env.example` to `.env`
   - Fill in your Supabase credentials:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. Set up Supabase database:
   - Create a table called `soil_tests` with the following schema:
   ```sql
   CREATE TABLE soil_tests (
     id SERIAL PRIMARY KEY,
     ph DECIMAL(3,1) NOT NULL,
     nitrogen DECIMAL(5,2) NOT NULL,
     phosphorus DECIMAL(5,2) NOT NULL,
     potassium DECIMAL(5,2) NOT NULL,
     moisture DECIMAL(5,2) NOT NULL,
     location TEXT,
     crop_type TEXT,
     test_date DATE,
     notes TEXT,
     checked_options JSONB DEFAULT '[]',
     test_results JSONB DEFAULT '{}',
     user_id TEXT DEFAULT 'anonymous',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
   
   - Create a table called `recommendations` with the following schema:
   ```sql
   CREATE TABLE recommendations (
     id SERIAL PRIMARY KEY,
     soil_test_id INTEGER REFERENCES soil_tests(id),
     checked_options JSONB DEFAULT '[]',
     recommendations JSONB NOT NULL,
     soil_analysis JSONB NOT NULL,
     user_id TEXT DEFAULT 'anonymous',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### Running the Application

```bash
python main.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /` - Returns API status

### Soil Testing
- `POST /api/soil-test` - Submit new soil test data (includes checked options and results)
- `GET /api/soil-tests` - Get all soil tests
- `GET /api/soil-test/<id>` - Get specific soil test

### Recommendations
- `POST /api/recommendations` - Generate fertilizer recommendations (stores checked options and results)
- `GET /api/recommendations` - Get all recommendations
- `GET /api/recommendations/<id>` - Get specific recommendation

### Recent Activity & History
- `GET /api/recent-options` - Get recently checked options from soil tests
- `GET /api/user-history/<user_id>` - Get user's complete history (soil tests + recommendations)

## Example Usage

### Submit Soil Test
```bash
curl -X POST http://localhost:5000/api/soil-test \
  -H "Content-Type: application/json" \
  -d '{
    "ph": 6.5,
    "nitrogen": 25.0,
    "phosphorus": 18.0,
    "potassium": 22.0,
    "moisture": 15.0,
    "location": "Field A",
    "crop_type": "Corn",
    "checked_options": ["ph_test", "nutrient_analysis", "moisture_check"],
    "test_results": {
      "ph_status": "optimal",
      "nutrient_balance": "good",
      "moisture_level": "adequate"
    },
    "user_id": "user123"
  }'
```

### Get Recommendations
```bash
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "ph": 5.8,
    "nitrogen": 15.0,
    "phosphorus": 12.0,
    "potassium": 18.0,
    "checked_options": ["ph_test", "nutrient_analysis"],
    "soil_test_id": 1,
    "user_id": "user123"
  }'
```

### Get Recent Checked Options
```bash
curl -X GET http://localhost:5000/api/recent-options
```

### Get User History
```bash
curl -X GET http://localhost:5000/api/user-history/user123
```

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `FLASK_DEBUG`: Enable debug mode (True/False)
- `PORT`: Port to run the application (default: 5000)
