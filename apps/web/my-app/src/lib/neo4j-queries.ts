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

// Define interfaces for types not in schema
interface Photo {
  photo_id: string;
  url?: string;
  taken_at?: string;
  [key: string]: unknown;
}

// Define interface for maintained photos
interface MaintainedPhoto {
  photo_id: string;
  url?: string;
  title?: string;
  description?: string;
  location?: string;
  [key: string]: unknown;
}

// Add this interface near the top of your file where other interfaces are defined
interface MaintenanceNode {
  maintenance_id?: string;
  item_id?: string;
  id?: string;
  [key: string]: unknown;
}

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
/**
 * Fetch all Issue nodes (replaces DetectionEvent nodes)
 */
export async function fetchDetectionEvents(): Promise<DetectionEvent[]> {
  return getNodes<DetectionEvent>('Issue');
}

/** Fetch a single DetectionEvent by its unique event_id */
/**
 * Fetch a single Issue by its unique event_id (replaces DetectionEvent)
 */
export async function fetchDetectionEventById(eventId: string): Promise<DetectionEvent | null> {
  return getNodeByKey<DetectionEvent>('Issue', 'event_id', eventId);
}

/** Fetch photo associated with a detection event by event_id */
export async function fetchPhotoByEventId(eventId: string): Promise<Photo | null> {
  // Cypher query to find the photo that triggers a specific detection event
  // Cypher query to find the photo that triggers a specific Issue (formerly DetectionEvent)
  const cypher = `
    MATCH (p:Photo)-[:TRIGGERS_EVENT]->(e:Issue)
    WHERE e.event_id = $eventId
    RETURN properties(p) AS photo
  `;
  
  const results = await runQuery<{ photo: Photo }>(cypher, { eventId });
  return results.length > 0 ? results[0].photo : null;
}

/** Fetch detection events by category slug (converts slug to name for query) */
/**
 * Fetch Issue nodes by category slug (replaces DetectionEvent nodes)
 */
export async function fetchDetectionEventsByCategory(categorySlug: string): Promise<DetectionEvent[]> {
  const cypher = `
    MATCH (e:Issue)-[:IN_CATEGORY]->(c:Category)
    WHERE toLower(replace(c.name, ' ', '-')) = $categorySlug
    RETURN properties(e) AS node
  `;
  
  const results = await runQuery<{ node: DetectionEvent }>(cypher, { categorySlug });
  return results.map(r => r.node);
}

/** Fetch photos with their related detection events by category slug */
/**
 * Fetch photos with their related Issue nodes by category slug (replaces DetectionEvent)
 */
export async function fetchPhotosWithDetectionEvents(categorySlug: string): Promise<Array<{photo: Photo; event: DetectionEvent}>> {
  const cypher = `
    MATCH (p:Photo)-[:TRIGGERS_EVENT]->(e:Issue)-[:IN_CATEGORY]->(c:Category)
    WHERE toLower(replace(c.name, ' ', '-')) = $categorySlug
    RETURN properties(p) AS photo, properties(e) AS event
  `;
  
  return runQuery<{photo: Photo; event: DetectionEvent}>(cypher, { categorySlug });
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

/** Count issues per category */
export async function countIssuesPerCategory(): Promise<Array<{category_id: string, name: string, count: number}>> {
  const cypher = `
    MATCH (i:Issue)-[:IN_CATEGORY]->(c:Category)
    RETURN c.category_id as category_id, c.name as name, count(i) as count
  `;
  
  return runQuery<{category_id: string, name: string, count: number}>(cypher);
}

/** Fetch maintained photos (well-maintained elements) */
export async function fetchMaintainedPhotos(limit: number = 3): Promise<MaintainedPhoto[]> {
  try {
    // First try with Maintenance relationship
    const cypher = `
      MATCH (m:Maintenance)<-[:CONTAINS]-(p:Photo)
      RETURN properties(p) AS photo
      LIMIT ${Math.floor(limit)}
    `;
    
    const results = await runQuery<{ photo: MaintainedPhoto }>(cypher, {});
    
    // If results found, process them
    if (results.length > 0) {
      return results.map(r => {
        // Process the photo data to ensure URL and title are present
        const photo = r.photo;
        
        // Ensure we have a usable URL
        if (!photo.url && photo.image_url && typeof photo.image_url === 'string') {
          photo.url = photo.image_url;
        }
        
        // Add a default title if missing
        if (!photo.title) {
          photo.title = 'Maintained Element';
        }
        
        return photo;
      });
    }
    
    // If no results, try fetching any photos as fallback
    const fallbackCypher = `
      MATCH (p:Photo)
      RETURN properties(p) AS photo
      LIMIT ${Math.floor(limit)}
    `;
    
    const fallbackResults = await runQuery<{ photo: MaintainedPhoto }>(fallbackCypher, {});
    
    if (fallbackResults.length > 0) {
      // Add a title if missing and ensure URL is present
      return fallbackResults.map(r => {
        const photo = r.photo;
        
        if (!photo.url && photo.image_url && typeof photo.image_url === 'string') {
          photo.url = photo.image_url;
        }
        
        return {
          ...photo,
          title: photo.title || 'Maintained Element'
        };
      });
    }
    
    // If still no results, return mock data
    return [
      { photo_id: "photo1", url: "/images/maintained-1.jpg", title: "Park Maintenance" },
      { photo_id: "photo2", url: "/images/maintained-2.jpg", title: "Street Lighting" },
      { photo_id: "photo3", url: "/images/maintained-3.jpg", title: "Public Garden" }
    ];
  } catch (error) {
    console.error("Error fetching maintained photos:", error);
    // Return mock data on error
    return [
      { photo_id: "photo1", url: "/images/maintained-1.jpg", title: "Park Maintenance" },
      { photo_id: "photo2", url: "/images/maintained-2.jpg", title: "Street Lighting" },
      { photo_id: "photo3", url: "/images/maintained-3.jpg", title: "Public Garden" }
    ];
  }
}

/** 
 * Fetch user's photos and their related Issue or Maintenance nodes
 * Returns photos with status: 
 * - "Open" or "In Progress" if connected to Issue
 * - "Maintained" if connected to Maintenance
 * - "In Progress" if not connected to either
 */
export async function fetchUserPhotos(userId: string): Promise<Array<{
  photo_id: string;
  url?: string;
  title?: string;
  status: string;
  type: 'issue' | 'maintenance' | 'in_progress' | 'irrelevant';
  related_node_id?: string;
  irrelevant_reason?: string;
  irrelevant_confidence?: number;
}>> {
  const cypher = `
    MATCH (u:User)-[:UPLOADED_PHOTO]->(p:Photo)
    WHERE u.user_id = $userId
    OPTIONAL MATCH (p)-[:TRIGGERS_EVENT]->(i:Issue)
    OPTIONAL MATCH (p)-[:CONTAINS]->(m:Maintenance)
    OPTIONAL MATCH (p)-[:MARKED_IRRELEVANT]->(irr:Irrelevant)
    RETURN 
      properties(p) AS photo,
      CASE 
        WHEN i IS NOT NULL THEN properties(i)
        ELSE NULL
      END AS issue,
      CASE 
        WHEN m IS NOT NULL THEN properties(m)
        ELSE NULL
      END AS maintenance,
      CASE
        WHEN irr IS NOT NULL THEN properties(irr)
        ELSE NULL
      END AS irrelevant
  `;
  
  const results = await runQuery<{
    photo: Photo;
    issue: DetectionEvent | null;
    maintenance: MaintenanceNode | null;
    irrelevant: { reason?: string; confidence?: number } | null;
  }>(cypher, { userId });
  
  return results.map(record => {
    const { photo, issue, maintenance, irrelevant } = record;
    
    if (!photo.url && photo.image_url && typeof photo.image_url === 'string') {
      photo.url = photo.image_url;
    }
    
    const title = (photo.title || (issue?.name || 'Reported Item')) as string;
    
    let status = "In Progress";
    let type: 'issue' | 'maintenance' | 'in_progress' | 'irrelevant' = 'in_progress';
    let related_node_id: string | undefined = undefined;
    let irrelevant_reason: string | undefined = undefined;
    let irrelevant_confidence: number | undefined = undefined;
    
    if (irrelevant) {
      status = "Irrelevant";
      type = 'irrelevant';
      irrelevant_reason = irrelevant.reason;
      irrelevant_confidence = irrelevant.confidence;
    } else if (issue) {
      status = issue.status || "Open";
      type = 'issue';
      related_node_id = issue.event_id;
    } else if (maintenance) {
      status = "Maintained";
      type = 'maintenance';
      related_node_id = maintenance.maintenance_id || 
                         maintenance.item_id || 
                         maintenance.id || 
                         (typeof maintenance === 'object' && maintenance !== null ? 
                            Object.keys(maintenance).find(key => key.endsWith('_id')) ? 
                            maintenance[Object.keys(maintenance).find(key => key.endsWith('_id')) as string] as string : 
                            undefined 
                         : undefined);
    }
    
    return {
      photo_id: photo.photo_id,
      url: photo.url,
      title,
      status,
      type,
      related_node_id,
      irrelevant_reason,
      irrelevant_confidence
    };
  });
}

/** Fetch the latest issues (default 3) ordered by reported_at descending */
export async function fetchLatestIssues(limit: number = 3): Promise<DetectionEvent[]> {
  const cypher = `
    MATCH (i:Issue)
    RETURN properties(i) AS node
    ORDER BY i.reported_at DESC
    LIMIT toInteger($limit)
  `;
  const results = await runQuery<{ node: DetectionEvent }>(cypher, { limit });
  return results.map(r => r.node);
}

/** Count all issues */
export async function countIssues(): Promise<number> {
  const cypher = `MATCH (i:Issue) RETURN count(i) AS count`;
  const result = await runQuery<{ count: number }>(cypher);
  return result[0]?.count || 0;
}

/** Count all well maintained elements (photos with Maintenance) */
export async function countMaintainedElements(): Promise<number> {
  const cypher = `MATCH (m:Maintenance)<-[:CONTAINS]-(p:Photo) RETURN count(p) AS count`;
  const result = await runQuery<{ count: number }>(cypher);
  return result[0]?.count || 0;
}

/** Count all critical problems (issues with severity 'high') */
export async function countCriticalProblems(): Promise<number> {
  const cypher = `MATCH (i:Issue) WHERE toLower(i.severity) = 'high' RETURN count(i) AS count`;
  const result = await runQuery<{ count: number }>(cypher);
  return result[0]?.count || 0;
}