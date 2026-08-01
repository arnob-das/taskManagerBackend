const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { MongoClient } = require('mongodb');

const uri = process.env.DATABASE_URI;
if (!uri) {
  console.error("DATABASE_URI is missing from .env");
  process.exit(1);
}

const client = new MongoClient(uri);

const sampleTasks = [
  {
    title: "Design System Refactoring",
    description: "Upgrade Tailwind tokens, update CSS variables, and unify color palette for light/dark modes.",
    date: "2026-08-05",
    assignedTo: "Arnob Das",
    priority: "high",
    status: "pending",
  },
  {
    title: "Implement OAuth Refresh Token Logic",
    description: "Add automatic Firebase token refresh interceptor in RTK Query baseApi.",
    date: "2026-08-08",
    assignedTo: "Arnob Das",
    priority: "high",
    status: "running",
  },
  {
    title: "Setup CI/CD Pipeline with GitHub Actions",
    description: "Automate build verification and automated deployment to Vercel.",
    date: "2026-08-10",
    assignedTo: "Muntasir",
    priority: "medium",
    status: "pending",
  },
  {
    title: "Optimize Task Search Performance",
    description: "Implement useMemo and debounce hooks to optimize task filtering across columns.",
    date: "2026-08-02",
    assignedTo: "Muhit",
    priority: "medium",
    status: "done",
  },
  {
    title: "Database Indexing & Query Optimization",
    description: "Create MongoDB compound indexes on assignedTo and status fields for fast pagination.",
    date: "2026-08-12",
    assignedTo: "Mir",
    priority: "low",
    status: "pending",
  },
  {
    title: "Write End-to-End Cypress Tests",
    description: "Cover user registration, login flow, task creation, and drag-and-drop status changes.",
    date: "2026-08-15",
    assignedTo: "Muntasir",
    priority: "low",
    status: "pending",
  },
  {
    title: "Legacy Code Migration Cleanup",
    description: "Remove deprecated Redux slices and clean up legacy local storage initializers.",
    date: "2026-07-30",
    assignedTo: "Arnob Das",
    priority: "medium",
    status: "archive",
  },
  {
    title: "User Profile Picture Custom URL Support",
    description: "Support direct image links from Google Drive, Unsplash, ImgBB, and GitHub.",
    date: "2026-07-31",
    assignedTo: "Arnob Das",
    priority: "high",
    status: "archive",
  },
];

async function seed() {
  try {
    await client.connect();
    const db = client.db('taskmaster');
    const tasksCollection = db.collection('tasks');

    const result = await tasksCollection.insertMany(sampleTasks);
    console.log(`Successfully seeded ${result.insertedCount} new tasks into MongoDB!`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seed();
