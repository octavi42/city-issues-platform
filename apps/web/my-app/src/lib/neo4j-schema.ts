// AUTO-GENERATED from generated/neo4j-schema.json
// Defines TypeScript interfaces for Neo4j node and relationship properties

/**
 * Represents an ISO date-time string in Neo4j.
 */
export type DateTime = string;

/** Node entity: User */
export interface User {
  name?: string;
  user_id: string;
  contact?: string;
}

/** Node entity: Analyzer */
export interface Analyzer {
  analyzer_id: string;
  website?: string;
  description?: string;
  name?: string;
}

/** Node entity: DetectionEvent */
export interface DetectionEvent {
  reported_at: DateTime;   // existence constraint in DB
  status?: string;
  description?: string;
  name?: string;
  event_id: string;
  severity?: string;
  inspected_at?: DateTime;
}

/** Node entity: Category */
export interface Category {
  description?: string;
  name?: string;
  event_type?: string;
  category_id: string;
}

/** Node entity: Department */
export interface Department {
  website?: string;
  description?: string;
  name?: string;
  department_id: string;
}

/** Node entity: Solution */
export interface Solution {
  description?: string;
  solution_id: string;
  success?: boolean;
  implemented_at?: DateTime;
}

/**
 * Properties on the 'ANALYZED_BY' relationship (Photo ↔ Analyzer)
 */
export interface AnalyzedByRelationshipProps {
  reasoning?: string;
  analyzed_at?: DateTime;
  method?: string;
  confidence?: number;
  notes?: string;
}

/** Node entity: Message */
export interface Message {
  id: string;
  reason: string;
  photo_id: string;
  user_id: string;
  additional_info: string;
  confidence: number;
  created_at: string;
  delta_score: number;
  message_id: string;
  text: string;
  type: string;
}