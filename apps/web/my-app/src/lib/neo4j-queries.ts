// Service functions to fetch Neo4j data using the generic Neo4j client utilities

import { getNodes, getNodeByKey, runQuery } from './neo4j';
import {
  User,
  Analyzer,
  DetectionEvent,
  Category,
  Department,
  Solution,
} from './neo4j-schema';

/** Fetch all User nodes */
export async function fetchUsers(): Promise<User[]> {
  return getNodes<User>('User');
}

/** Fetch a single User by its unique user_id */
export async function fetchUserById(userId: string): Promise<User | null> {
  return getNodeByKey<User>('User', 'user_id', userId);
}

/** Fetch all Analyzer nodes */
export async function fetchAnalyzers(): Promise<Analyzer[]> {
  return getNodes<Analyzer>('Analyzer');
}

/** Fetch a single Analyzer by its unique analyzer_id */
export async function fetchAnalyzerById(analyzerId: string): Promise<Analyzer | null> {
  return getNodeByKey<Analyzer>('Analyzer', 'analyzer_id', analyzerId);
}

/** Fetch all DetectionEvent nodes */
export async function fetchDetectionEvents(): Promise<DetectionEvent[]> {
  return getNodes<DetectionEvent>('DetectionEvent');
}

/** Fetch a single DetectionEvent by its unique event_id */
export async function fetchDetectionEventById(eventId: string): Promise<DetectionEvent | null> {
  return getNodeByKey<DetectionEvent>('DetectionEvent', 'event_id', eventId);
}

/** Fetch detection events by category slug (converts slug to name for query) */
export async function fetchDetectionEventsByCategory(categorySlug: string): Promise<DetectionEvent[]> {
  // Cypher query to find detection events related to a category by slug
  const cypher = `
    MATCH (e:DetectionEvent)-[:IN_CATEGORY]->(c:Category)
    WHERE toLower(replace(c.name, ' ', '-')) = $categorySlug
    RETURN properties(e) AS node
  `;
  
  const results = await runQuery<{ node: DetectionEvent }>(cypher, { categorySlug });
  return results.map(r => r.node);
}

/** Fetch all Category nodes */
export async function fetchCategories(): Promise<Category[]> {
  return getNodes<Category>('Category');
}

/** Fetch a single Category by its unique category_id */
export async function fetchCategoryById(categoryId: string): Promise<Category | null> {
  return getNodeByKey<Category>('Category', 'category_id', categoryId);
}

/** Fetch all Department nodes */
export async function fetchDepartments(): Promise<Department[]> {
  return getNodes<Department>('Department');
}

/** Fetch a single Department by its unique department_id */
export async function fetchDepartmentById(departmentId: string): Promise<Department | null> {
  return getNodeByKey<Department>('Department', 'department_id', departmentId);
}

/** Fetch all Solution nodes */
export async function fetchSolutions(): Promise<Solution[]> {
  return getNodes<Solution>('Solution');
}

/** Fetch a single Solution by its unique solution_id */
export async function fetchSolutionById(solutionId: string): Promise<Solution | null> {
  return getNodeByKey<Solution>('Solution', 'solution_id', solutionId);
}