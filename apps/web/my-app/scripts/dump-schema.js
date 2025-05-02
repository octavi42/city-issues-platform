#!/usr/bin/env node
// Load environment variables from .env in project root
const dotenv = require('dotenv');
const envResult = dotenv.config();
if (envResult.error) {
  console.warn('Warning: Could not load .env file:', envResult.error.message);
}
const neo4j = require('neo4j-driver');
const fs = require('fs').promises;

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

if (!uri || !user || !password) {
  console.error('Missing NEO4J_URI, NEO4J_USER, or NEO4J_PASSWORD');
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session({ defaultAccessMode: neo4j.session.READ });

async function dumpSchema() {
  try {
    const { records } = await session.run('CALL apoc.meta.schema()');
    const meta = records[0].get('value');
    await fs.mkdir('generated', { recursive: true });
    await fs.writeFile('generated/neo4j-schema.json', JSON.stringify(meta, null, 2));
    console.log('Schema dumped to generated/neo4j-schema.json');
  } catch (err) {
    console.error('Error dumping schema:', err);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

dumpSchema();