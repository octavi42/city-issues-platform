import neo4j, { Driver, Session, QueryResult, Integer } from 'neo4j-driver';

// Define types for Neo4j records and values
type Neo4jValue = string | number | boolean | null | Neo4jObject | Neo4jArray;
type Neo4jObject = { [key: string]: Neo4jValue };
type Neo4jArray = Neo4jValue[];
type Neo4jRecord = Record<string, Neo4jValue>;

let driver: Driver | undefined;

function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      throw new Error('Missing Neo4j connection details in environment variables (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)');
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

    // Verify connection during initialization (optional but recommended)
    driver.verifyConnectivity()
      .then(() => console.log('Successfully connected to Neo4j.'))
      .catch((error) => console.error('Failed to connect to Neo4j:', error));
  }
  return driver;
}

export async function runQuery<T = Neo4jRecord>(
  query: string,
  params?: Record<string, Neo4jValue>
): Promise<T[]> {
  const driverInstance = getDriver();
  let session: Session | undefined;

  try {
    session = driverInstance.session();
    const result: QueryResult = await session.run(query, params);

    // Process records: Convert Neo4j specific types (like Integer) to standard JS types if needed
    const data = result.records.map(record => {
      const obj: Record<string, Neo4jValue> = {};
      record.keys.forEach(key => {
        const value = record.get(key);
        const keyString = String(key); // Ensure key is treated as a string
        // Handle Neo4j Integer type
        if (neo4j.isInt(value)) {
          obj[keyString] = (value as Integer).toNumber();
        } else if (typeof value === 'object' && value !== null && 'low' in value && 'high' in value && typeof value.low === 'number' && typeof value.high === 'number') {
          // More robust check for Neo4j numeric types (like Integer, Float)
          // This attempts to handle standard number representations used by the driver
          // Convert potentially large numbers safely if needed, here just taking low part for simplicity
          obj[keyString] = value.low;
        } else {
          obj[keyString] = value as Neo4jValue;
        }
      });
      return obj as unknown as T;
    });

    return data;

  } catch (error) {
    console.error('Error executing Neo4j query:', error);
    throw new Error(`Failed to run Neo4j query: ${(error as Error).message}`);
  } finally {
    if (session) {
      await session.close();
    }
  }
}

// Optional: Add a function to close the driver connection on application shutdown
export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = undefined;
    console.log('Neo4j driver closed.');
  }
} 
// Generic CRUD operations using runQuery
/**
 * Creates a new node with the specified label and properties.
 */
export async function createNode<T = Neo4jRecord>(
  label: string,
  props: Record<string, Neo4jValue>
): Promise<T> {
  const query = `CREATE (n:${label} $props) RETURN properties(n) AS node`;
  const results = await runQuery<{ node: T }>(query, { props });
  return results[0]?.node;
}

/**
 * Retrieves all nodes of a given label.
 */
export async function getNodes<T = Neo4jRecord>(label: string): Promise<T[]> {
  const query = `MATCH (n:${label}) RETURN properties(n) AS node`;
  const results = await runQuery<{ node: T }>(query);
  return results.map(r => r.node);
}

/**
 * Retrieves a single node by label and key property.
 */
export async function getNodeByKey<T = Neo4jRecord>(
  label: string,
  key: string,
  value: Neo4jValue
): Promise<T | null> {
  const query = `MATCH (n:${label} {${key}: $value}) RETURN properties(n) AS node LIMIT 1`;
  const results = await runQuery<{ node: T }>(query, { value });
  return results[0]?.node ?? null;
}

/**
 * Updates properties of a node by label and key.
 */
export async function updateNodeByKey<T = Neo4jRecord>(
  label: string,
  key: string,
  value: Neo4jValue,
  props: Record<string, Neo4jValue>
): Promise<T | null> {
  const query = `
    MATCH (n:${label} { ${key}: $value })
    SET n += $props
    RETURN properties(n) AS node
    LIMIT 1
  `;
  const results = await runQuery<{ node: T }>(query, { value, props });
  return results[0]?.node ?? null;
}

/**
 * Deletes a node by label and key.
 */
export async function deleteNodeByKey(
  label: string,
  key: string,
  value: Neo4jValue
): Promise<void> {
  const query = `MATCH (n:${label} {${key}: $value}) DETACH DELETE n`;
  await runQuery(query, { value });
}