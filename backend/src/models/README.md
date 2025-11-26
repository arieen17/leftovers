R'ATE Backend Models Architecture Documentation
Data Models Specification
User Model

Purpose: Manages user authentication, authorization, and profile data storage

Schema:

id: SERIAL PRIMARY KEY

email: VARCHAR(255) UNIQUE NOT NULL

password: VARCHAR(255) NOT NULL (bcrypt hashed)

name: VARCHAR(255) NOT NULL

tier: VARCHAR(50) DEFAULT 'Bronze' (user progression system)

birthday: DATE (optional demographic data)

phone_number: VARCHAR(20) (optional contact information)

address: TEXT (optional location data)

total_reviews: INTEGER DEFAULT 0 (activity tracking)

created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Restaurant Model

Purpose: Manages restaurant entities with geolocation and operational data

Schema:

id: SERIAL PRIMARY KEY

name: VARCHAR(255) NOT NULL

address: TEXT NOT NULL

latitude: DECIMAL(10,8) (geospatial coordinate)

longitude: DECIMAL(11,8) (geospatial coordinate)

cuisine_type: VARCHAR(100) (culinary classification)

hours: JSONB (operating schedule by day)

image_url: TEXT (visual representation)

created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

MenuItem Model

Purpose: Manages individual food items with categorization and pricing

Schema:

id: SERIAL PRIMARY KEY

restaurant_id: INTEGER REFERENCES restaurants(id) ON DELETE CASCADE

name: VARCHAR(255) NOT NULL

description: TEXT (item details)

price: DECIMAL(10,2) (monetary value)

category: VARCHAR(100) (menu section classification)

image_url: TEXT (visual representation)

tags: TEXT[] (dietary/characteristic labels)

created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Review Model

Purpose: Manages user-generated content including ratings and feedback

Schema:

id: SERIAL PRIMARY KEY

user_id: INTEGER REFERENCES users(id) ON DELETE CASCADE

menu_item_id: INTEGER REFERENCES menu_items(id) ON DELETE CASCADE

rating: INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5)

comment: TEXT (optional qualitative feedback)

photos: TEXT[] (optional visual evidence)

created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

updated_at: TIM
ESTAMP DEFAULT CURRENT_TIMESTAMP

UNIQUE(user_id, menu_item_id) (integrity constraint)
