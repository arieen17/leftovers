-- R'ATE Database Schema
-- This file contains the initial database structure

-- Users table (UCR students)
CREATE TABLE IF NOT EXISTS Users (
    user_id VARCHAR(50) PRIMARY KEY,
    ucr_email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    profile_picture_url VARCHAR(255),
    tier VARCHAR(20) DEFAULT 'Beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS Restaurants (
    restaurant_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    cuisine_type VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    overall_rating DECIMAL(3, 2),
    phone_number VARCHAR(20),
    hours TEXT
);
