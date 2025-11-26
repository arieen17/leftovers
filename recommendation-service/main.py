from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Optional
import psycopg2
import os

app = FastAPI(title="R'ATE Recommendation Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host="rateapp.c98oqscikd1q.us-east-2.rds.amazonaws.com",
        port=5432,
        database="postgres", 
        user="postgres",
        password="RateApp2024!"
    )

class RecommendationRequest(BaseModel):
    user_id: int
    limit: int = 10

class RecommendationResponse(BaseModel):
    user_id: int
    recommendations: List[Dict]

def get_ratings_data():
    """Fetch all ratings from database"""
    conn = get_db_connection()
    query = """
    SELECT user_id, menu_item_id, rating 
    FROM reviews
    ORDER BY user_id, menu_item_id
    """
    df = pd.read_sql_query(query, conn)
    conn.close()
    return df

def get_popular_items(limit: int):
    """Fallback: get most highly rated items"""
    conn = get_db_connection()
    query = """
    SELECT menu_item_id, AVG(rating) as avg_rating
    FROM reviews 
    GROUP BY menu_item_id 
    HAVING COUNT(*) >= 2
    ORDER BY avg_rating DESC 
    LIMIT %s
    """
    df = pd.read_sql_query(query, conn, params=(limit,))
    conn.close()
    return [{"menu_item_id": row['menu_item_id'], "score": row['avg_rating']} for _, row in df.iterrows()]

def collaborative_filtering(user_id: int, limit: int = 10):
    """Fixed user-based collaborative filtering"""
    ratings_df = get_ratings_data()
    
    # Create user-item matrix
    user_item_matrix = ratings_df.pivot_table(
        index='user_id', 
        columns='menu_item_id', 
        values='rating'
    ).fillna(0)
    
    # Calculate user similarity (using centered cosine similarity)
    user_means = user_item_matrix.mean(axis=1)
    user_item_centered = user_item_matrix.sub(user_means, axis=0)
    user_similarity = cosine_similarity(user_item_centered.fillna(0))
    user_similarity_df = pd.DataFrame(
        user_similarity, 
        index=user_item_matrix.index, 
        columns=user_item_matrix.index
    )
    
    # Get target user's ratings
    if user_id not in user_item_matrix.index:
        return []  # New user fallback
    
    target_user_ratings = user_item_matrix.loc[user_id]
    
    # Find similar users (excluding self) with higher threshold
    similar_users = user_similarity_df[user_id].drop(user_id)
    similar_users = similar_users[similar_users > 0.3]  # Increased threshold
    
    if len(similar_users) == 0:
        return []  #Return empty
    
    # Get items rated by similar users but not by target user
    recommendations = {}
    for similar_user_id, similarity_score in similar_users.items():
        similar_user_ratings = user_item_matrix.loc[similar_user_id]
        
        # Only consider items that similar user rated highly (4-5 stars)
        # and that target user hasn't rated
        for item_id, rating in similar_user_ratings.items():
            if target_user_ratings[item_id] == 0 and rating >= 4:
                if item_id not in recommendations:
                    recommendations[item_id] = 0
                recommendations[item_id] += similarity_score * (rating - 2.5)  # Center around neutral
    
    # Sort by recommendation score and return top N
    sorted_recommendations = sorted(
        recommendations.items(), 
        key=lambda x: x[1], 
        reverse=True
    )[:limit]
    
    return [{"menu_item_id": item_id, "score": score} for item_id, score in sorted_recommendations]

@app.get("/health")
async def health():
    return {"status": "✅ Recommendation service is running!"}

@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    try:
        recommendations = collaborative_filtering(request.user_id, request.limit)
        return RecommendationResponse(
            user_id=request.user_id,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)