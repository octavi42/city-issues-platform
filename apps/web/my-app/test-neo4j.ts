/**
 * Simple Neo4j connection test script.
 *
 * Usage:
 *   NEO4J_URI=bolt://localhost:7687 NEO4J_USERNAME=user NEO4J_PASSWORD=pass \
 *     ts-node test-neo4j.ts
 */
import { runQuery, closeDriver } from './src/lib/neo4j';

async function main() {
  console.log('Running Neo4j test query...');
  try {
    const result = await runQuery('RETURN 1 AS testValue');
    console.log('Query result:', result);
  } catch (error) {
    console.error('Error executing test query:', error);
  } finally {
    await closeDriver();
    console.log('Neo4j driver closed.');
  }
}

main();