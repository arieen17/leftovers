Run npm run dev from backend directory to start server

Backend Endpoints:

Base URL: http://localhost:5000

Authentication:

POST /api/auth/signup

Create new user account

Request: {"email": "user@ucr.edu", "password": "password123", "name": "John Doe", "birthday": "2000-01-15", "phone_number": "555-1234", "address": "123 Street"} (birthday, phone_number, address optional)

Response: {"message": "User created successfully", "token": "jwt_token_here", "user": {"id": 1, "email": "user@ucr.edu", "name": "John Doe", "tier": "Bronze", "birthday": "2000-01-15T00:00:00.000Z", "phone_number": "555-1234", "address": "123 Street"}}


POST /api/auth/login

User login

Request: {"email": "user@ucr.edu", "password": "password123"}

Response: {"message": "Login successful", "token": "jwt_token_here", "user": {"id": 1, "email": "user@ucr.edu", "name": "John Doe", "tier": "Bronze", "birthday": "2000-01-15T00:00:00.000Z", "phone_number": "555-1234", "address": "123 Street"}}


GET /api/auth/test

Test endpoint

Response: {"message": "Auth routes are working!"}


POST /api/auth/verify-ucr-email

TODO - Placeholder

Response: {"message": "UCR email verification - TODO"}


Restaurant:


GET /api/restaurants

List all restaurants

Response: [{"id": 1, "name": "Example Restaurant 1", "address": "123 University Drive...", "latitude": "33.97500000", "longitude": "-117.32900000", "cuisine_type": "American", "hours": {"monday": "8:00 AM - 9:00 PM", ...}, "image_url": "", "created_at": "2025-11-02T20:49:46.988Z"}]

GET /api/restaurants/:id

Get restaurant details

Response: {"id": 1, "name": "Example Restaurant 1", "address": "123 University Drive...", "latitude": "33.97500000", "longitude": "-117.32900000", "cuisine_type": "American", "hours": {...}, "image_url": "", "created_at": "2025-11-02T20:49:46.988Z"}


GET /api/restaurants/:id/menu

Get restaurant menu items with ratings

Response: [{"id": 1, "restaurant_id": 1, "name": "Classic Burger", "description": "Juicy beef patty...", "price": "12.99", "category": "Main Course", "image_url": null, "tags": ["beef", "popular"], "created_at": "2025-11-02T21:01:05.834Z", "average_rating": "5.0000000000000000", "review_count": "1"}]


POST /api/restaurants

Create restaurant (Admin)

Request: {"name": "New Restaurant", "address": "123 Street...", "latitude": 33.9750, "longitude": -117.3290, "cuisine_type": "Italian", "hours": {"monday": "9AM-5PM", ...}, "image_url": ""}

Response: {"id": 5, "name": "New Restaurant", ...}


PUT /api/restaurants/:id

Update restaurant (Admin)

Request: {"name": "Updated Name", "cuisine_type": "Updated Cuisine"}

Response: {"id": 1, "name": "Updated Name", ...}


DELETE /api/restaurants/:id

Delete restaurant (Admin)

Response: {"message": "Restaurant deleted successfully", "restaurant": {"id": 1, "name": "Example Restaurant 1", ...}}


Menu Items:


GET /api/menu-items/:id

Get menu item with ratings

Response: {"id": 1, "restaurant_id": 1, "name": "Classic Burger", "description": "Juicy beef patty...", "price": "12.99", "category": "Main Course", "image_url": null, "tags": ["beef", "popular"], "created_at": "2025-11-02T21:01:05.834Z", "average_rating": "5.0000000000000000", "review_count": "1"}


GET /api/menu-items/:id/rating

Get rating stats only

Response: {"average_rating": "5.0000000000000000", "review_count": "1"}


POST /api/menu-items

Create menu item (Admin)

Request: {"restaurant_id": 1, "name": "New Item", "description": "Item description", "price": 9.99, "category": "Appetizers", "image_url": "", "tags": ["vegetarian"]}

Response: {"id": 10, "restaurant_id": 1, "name": "New Item", ...}


PUT /api/menu-items/:id

Update menu item (Admin)

Request: {"name": "Updated Item Name", "price": 10.99}

Response: {"id": 1, "name": "Updated Item Name", ...}


DELETE /api/menu-items/:id

Delete menu item (Admin)

Response: {"message": "Menu item deleted successfully", "menuItem": {"id": 1, "name": "Classic Burger", ...}}


Review:


POST /api/reviews

Create review (REQUIRES AUTH HEADER: Authorization: Bearer token)

Request: {"user_id": 1, "menu_item_id": 1, "rating": 5, "comment": "Amazing food!", "photos": ["url1", "url2"]}

Response: {"id": 1, "user_id": 1, "menu_item_id": 1, "rating": 5, "comment": "Amazing food!", "photos": ["url1", "url2"], "created_at": "2025-11-02T23:09:03.048Z", "updated_at": "2025-11-02T23:09:03.048Z"}


GET /api/reviews/menu-item/:menuItemId

Get reviews for a menu item

Response: [{"id": 1, "user_id": 1, "menu_item_id": 1, "rating": 5, "comment": "Amazing food!", "photos": [], "created_at": "2025-11-02T23:09:03.048Z", "updated_at": "2025-11-02T23:09:03.048Z", "user_name": "Review Tester", "user_tier": "Bronze"}]


GET /api/reviews/user/:userId

Get reviews by a user

Response: [{"id": 1, "user_id": 1, "menu_item_id": 1, "rating": 5, "comment": "Amazing food!", "photos": [], "created_at": "2025-11-02T23:09:03.048Z", "updated_at": "2025-11-02T23:09:03.048Z", "menu_item_name": "Classic Burger", "restaurant_name": "Example Restaurant 1"}]


Health:


GET /api/health
Backend status
Response: {"status": "✅ Backend is running!", "timestamp": "2025-10-28T23:54:12.127Z"}