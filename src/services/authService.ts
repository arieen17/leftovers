import { apiRequest } from "./api";

export interface User {
  id: number;
  email: string;
  name: string;
  tier: string;
  birthday?: string;
  address?: string;
  phone_number?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  birthday?: string;
  phone_number?: string;
  address?: string;
}

// Simple in-memory storage for auth state
let authToken: string | null = null;
let currentUser: User | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export const setCurrentUser = (user: User) => {
  currentUser = user;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const clearAuth = () => {
  authToken = null;
  currentUser = null;
};

/**
 * User login
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await apiRequest<AuthResponse>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );
    
    if (response.token && response.user) {
      setAuthToken(response.token);
      setCurrentUser(response.user);
    }
    
    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * User signup
 */
export async function signup(credentials: SignupCredentials): Promise<AuthResponse> {
  try {
    const response = await apiRequest<AuthResponse>(
      "/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );
    
    if (response.token && response.user) {
      setAuthToken(response.token);
      setCurrentUser(response.user);
    }
    
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}
