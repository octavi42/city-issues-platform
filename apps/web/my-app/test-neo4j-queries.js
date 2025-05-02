#!/usr/bin/env node
/**
 * CommonJS wrapper to run the TS-based Neo4j query tests under plain Node.
 *
 * Usage:
 *   node test-neo4j-queries.cjs
 *
 * This script uses ts-node to transpile imports on the fly.
 */
// Load environment variables from .env, then register ts-node to handle TypeScript imports
require('dotenv').config();
// register ts-node to handle TypeScript imports
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node'
  }
});

// now require the TS modules
const {
  fetchUsers,
  fetchUserById,
  fetchAnalyzers,
  fetchAnalyzerById,
  fetchDetectionEvents,
  fetchDetectionEventById,
  fetchCategories,
  fetchCategoryById,
  fetchDepartments,
  fetchDepartmentById,
  fetchSolutions,
  fetchSolutionById,
} = require('./src/lib/neo4j-queries.ts');
const { closeDriver } = require('./src/lib/neo4j.ts');

async function main() {
  try {
    console.log('Fetching all Users...');
    const users = await fetchUsers();
    console.log('Users:', JSON.stringify(users, null, 2));
    if (users.length > 0) {
      console.log(`Fetching User by ID: ${users[0].user_id}`);
      const u = await fetchUserById(users[0].user_id);
      console.log('User:', u);
    }

    console.log('Fetching all Analyzers...');
    const analyzers = await fetchAnalyzers();
    console.log('Analyzers:', JSON.stringify(analyzers, null, 2));
    if (analyzers.length > 0) {
      console.log(`Fetching Analyzer by ID: ${analyzers[0].analyzer_id}`);
      const a = await fetchAnalyzerById(analyzers[0].analyzer_id);
      console.log('Analyzer:', a);
    }

    console.log('Fetching all DetectionEvents...');
    const events = await fetchDetectionEvents();
    console.log('DetectionEvents:', JSON.stringify(events, null, 2));
    if (events.length > 0) {
      console.log(`Fetching DetectionEvent by ID: ${events[0].event_id}`);
      const e = await fetchDetectionEventById(events[0].event_id);
      console.log('DetectionEvent:', e);
    }

    console.log('Fetching all Categories...');
    const categories = await fetchCategories();
    console.log('Categories:', JSON.stringify(categories, null, 2));
    if (categories.length > 0) {
      console.log(`Fetching Category by ID: ${categories[0].category_id}`);
      const c = await fetchCategoryById(categories[0].category_id);
      console.log('Category:', c);
    }

    console.log('Fetching all Departments...');
    const departments = await fetchDepartments();
    console.log('Departments:', JSON.stringify(departments, null, 2));
    if (departments.length > 0) {
      console.log(`Fetching Department by ID: ${departments[0].department_id}`);
      const d = await fetchDepartmentById(departments[0].department_id);
      console.log('Department:', d);
    }

    console.log('Fetching all Solutions...');
    const solutions = await fetchSolutions();
    console.log('Solutions:', JSON.stringify(solutions, null, 2));
    if (solutions.length > 0) {
      console.log(`Fetching Solution by ID: ${solutions[0].solution_id}`);
      const s = await fetchSolutionById(solutions[0].solution_id);
      console.log('Solution:', s);
    }
  } catch (err) {
    console.error('Error during test execution:', err);
  } finally {
    await closeDriver();
    console.log('Neo4j driver closed.');
  }
}

main();