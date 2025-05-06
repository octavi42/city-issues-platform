/**
 * Issue Service - Handles API calls for issues
 */

import { get, post, put, del } from '../api';

// Type definitions for issue data
export interface Issue {
  id?: string;
  title: string;
  description: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  category?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  images?: string[];
}

// API endpoints
const ENDPOINTS = {
  ISSUES: '/issues',
  ISSUE_BY_ID: (id: string) => `/issues/${id}`,
  ISSUES_BY_USER: (userId: string) => `/users/${userId}/issues`,
  ISSUES_BY_CATEGORY: (category: string) => `/issues/category/${category}`,
};

/**
 * Get all issues with optional pagination
 */
export async function getIssues(page = 1, limit = 10): Promise<{ data: Issue[], total: number }> {
  return get<{ data: Issue[], total: number }>(`${ENDPOINTS.ISSUES}?page=${page}&limit=${limit}`);
}

/**
 * Get a single issue by ID
 */
export async function getIssueById(issueId: string): Promise<Issue> {
  return get<Issue>(ENDPOINTS.ISSUE_BY_ID(issueId));
}

/**
 * Create a new issue
 */
export async function createIssue(issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Issue> {
  return post<Issue>(ENDPOINTS.ISSUES, issueData);
}

/**
 * Update an existing issue
 */
export async function updateIssue(issueId: string, issueData: Partial<Issue>): Promise<Issue> {
  return put<Issue>(ENDPOINTS.ISSUE_BY_ID(issueId), issueData);
}

/**
 * Delete an issue
 */
export async function deleteIssue(issueId: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(ENDPOINTS.ISSUE_BY_ID(issueId));
}

/**
 * Get issues by user ID
 */
export async function getIssuesByUser(userId: string, page = 1, limit = 10): Promise<{ data: Issue[], total: number }> {
  return get<{ data: Issue[], total: number }>(`${ENDPOINTS.ISSUES_BY_USER(userId)}?page=${page}&limit=${limit}`);
}

/**
 * Get issues by category
 */
export async function getIssuesByCategory(category: string, page = 1, limit = 10): Promise<{ data: Issue[], total: number }> {
  return get<{ data: Issue[], total: number }>(`${ENDPOINTS.ISSUES_BY_CATEGORY(category)}?page=${page}&limit=${limit}`);
} 