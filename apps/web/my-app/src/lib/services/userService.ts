/**
 * User Service - Handles API calls for user management
 */

import { get, post, put, del } from '../api';

// Type definitions for user data
export interface User {
  id?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Login request and response types
export interface LoginRequest extends Record<string, unknown> {
  email: string;
  password: string;
}

export interface RegisterRequest extends Record<string, unknown> {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

// API endpoints
const ENDPOINTS = {
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
};

/**
 * Register a new user
 */
export async function registerUser(userData: RegisterRequest): Promise<AuthResponse> {
  return post<AuthResponse>(ENDPOINTS.REGISTER, userData);
}

/**
 * Login a user
 */
export async function loginUser(credentials: LoginRequest): Promise<AuthResponse> {
  return post<AuthResponse>(ENDPOINTS.LOGIN, credentials);
}

/**
 * Logout the current user
 */
export async function logoutUser(): Promise<{ success: boolean, message: string }> {
  return post<{ success: boolean, message: string }>(ENDPOINTS.LOGOUT, {});
}

/**
 * Get the current logged-in user
 */
export async function getCurrentUser(): Promise<User> {
  return get<User>(ENDPOINTS.ME);
}

/**
 * Get a user by ID
 */
export async function getUserById(userId: string): Promise<User> {
  return get<User>(ENDPOINTS.USER_BY_ID(userId));
}

/**
 * Update a user's profile
 */
export async function updateUser(userId: string, userData: Partial<User>): Promise<User> {
  return put<User>(ENDPOINTS.USER_BY_ID(userId), userData);
}

/**
 * Delete a user account
 */
export async function deleteUser(userId: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(ENDPOINTS.USER_BY_ID(userId));
} 