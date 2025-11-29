R'ATE Backend

Setup Instructions:

1. Install Dependencies
   npm install

2. Environment Setup
   Create .env file in backend directory with:
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   NODE_ENV=development

3. Database Connection
   Database is hosted on AWS RDS
   Connection string: postgresql://postgres:RateApp2024!@rateapp.c98oqscikd1q.us-east-2.rds.amazonaws.com:5432/postgres

4. Recommendation Service Setup (REQUIRED)
   Navigate to recommendation-service directory:
   cd recommendation-service

   Create Python virtual environment:
   python3 -m venv venv

   Activate virtual environment:
   source venv/bin/activate

   Install Python dependencies:
   pip install -r requirements.txt

   The recommendation service will be automatically started with the backend.

5. Run Backend (starts both services)
   Development: npm run dev
   Production: npm start

6. Services run on:
   Backend: http://localhost:5000
   Recommendation Service: http://localhost:8000

API Endpoints:

Authentication:
  POST /api/auth/signup - Create user account
  POST /api/auth/login - User login
  GET  /api/auth/test - Test endpoint

Restaurants:
  GET    /api/restaurants - List all restaurants
  GET    /api/restaurants/:id - Get restaurant details
  GET    /api/restaurants/:id/menu - Get restaurant menu
  POST   /api/restaurants - Create restaurant (Admin)
  PUT    /api/restaurants/:id - Update restaurant (Admin)
  DELETE /api/restaurants/:id - Delete restaurant (Admin)

Menu Items:
  GET    /api/menu-items/:id - Get menu item with ratings
  GET    /api/menu-items/:id/rating - Get rating stats
  GET    /api/menu-items/popular - Get popular menu items
  POST   /api/menu-items - Create menu item (Admin)
  PUT    /api/menu-items/:id - Update menu item (Admin)
  DELETE /api/menu-items/:id - Delete menu item (Admin)

Reviews:
  POST   /api/reviews - Create review (Auth required)
  GET    /api/reviews/menu-item/:menuItemId - Get reviews for menu item
  GET    /api/reviews/user/:userId - Get reviews by user

Review Interactions:
  POST   /api/reviews/:id/like - Like a review (Auth required)
  DELETE /api/reviews/:id/like - Unlike a review (Auth required)
  POST   /api/reviews/:id/comments - Add comment to review (Auth required)
  GET    /api/reviews/:id/comments - Get comments for review
  POST   /api/reviews/comments/:id/like - Like a comment (Auth required)
  DELETE /api/reviews/comments/:id/like - Unlike a comment (Auth required)

Users:
  PUT    /api/users/:id - Update user profile (Auth required)

Recommendations:
  GET    /api/recommendations/user/:userId - Get personalized recommendations
    (Requires Python recommendation service running on port 8000)

Health:
  GET    /api/health - Backend status

Dependencies:
  express - Web framework
  pg - PostgreSQL client
  bcryptjs - Password hashing
  jsonwebtoken - JWT authentication
  cors - Cross-origin resource sharing
  axios - HTTP client for recommendation service
  dotenv - Environment variables

Python Recommendation Service Dependencies:
  fastapi, uvicorn, pandas, numpy, scikit-learn, psycopg2-binary