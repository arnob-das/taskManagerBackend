require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Initialize Firebase Admin SDK
initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'task-manager-arnob',
});

// Middleware to verify Firebase Authentication Token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error.message);
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

const uri = process.env.DATABASE_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = await client.db('taskmaster');
    const tasksCollection = db.collection('tasks');

    console.log('Successfully connected to MongoDB!');

    app.get('/', (req, res) => {
      res.send('Task Master Server is running and secured with Firebase Auth!');
    });

    // GET /tasks - Protected
    app.get('/tasks', verifyToken, async (req, res) => {
      try {
        const tasks = await tasksCollection.find({}).toArray();
        res.json(tasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // POST /tasks - Protected
    app.post('/tasks', verifyToken, async (req, res) => {
      const newTask = {
        ...req.body,
        createdByEmail: req.user.email || '',
        createdAt: new Date().toISOString(),
      };

      try {
        const result = await tasksCollection.insertOne(newTask);
        res.status(201).json(result);
      } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // DELETE /tasks/:id - Protected
    app.delete('/tasks/:id', verifyToken, async (req, res) => {
      const taskId = req.params.id;

      if (!ObjectId.isValid(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID format' });
      }

      try {
        const result = await tasksCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        if (result.deletedCount === 0) {
          res.status(404).json({ error: 'Task not found' });
        } else {
          res.json({ message: 'Task deleted successfully' });
        }
      } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // PATCH /tasks/:id - Protected
    app.patch('/tasks/:id', verifyToken, async (req, res) => {
      const taskId = req.params.id;

      if (!ObjectId.isValid(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID format' });
      }

      const updatedTaskData = req.body;

      try {
        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: updatedTaskData }
        );

        if (result.matchedCount === 0) {
          res.status(404).json({ error: 'Task not found' });
        } else {
          res.json({ message: 'Task updated successfully' });
        }
      } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Task Master server listening on port ${port}`);
});
