/**
 * Simple Neo4j connectivity test script.
 *
 * Usage:
 *   NEO4J_URI=bolt://localhost:7687 NEO4J_USERNAME=user NEO4J_PASSWORD=pass node test-neo4j.js
 */
// Load environment variables from .env (requires installing 'dotenv')
require('dotenv').config({ path: '.env' });
const neo4j = require('neo4j-driver');

async function main() {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    console.error('Missing Neo4j environment variables. Please set NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD.');
    process.exit(1);
  }

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();

  console.log('Running test query: RETURN 1 AS testValue');

  try {
    const result = await session.run('RETURN 1 AS testValue');
    result.records.forEach(record => {
      const value = record.get('testValue');
      console.log('testValue =', value.toNumber ? value.toNumber() : value);
    });
  } catch (err) {
    console.error('Error executing test query:', err);
  } finally {
    await session.close();
    await driver.close();
    console.log('Neo4j driver closed.');
  }
}

main();