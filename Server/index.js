 const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())    

const PORT = process.env.PORT || 3001

// MongoDB connection with modern syntax and better error handling
const MONGODB_URI = "mongodb+srv://sri:Sriram123@cluster0.gx1w8ma.mongodb.net/todo?retryWrites=true&w=majority";

async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Successfully connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        console.log('\nTroubleshooting steps:');
        console.log('1. Check your internet connection');
        console.log('2. Make sure your IP is whitelisted in MongoDB Atlas');
        console.log('3. Verify your MongoDB connection string');
        console.log('4. Check if your MongoDB cluster is running\n');
        
        // Don't exit the process, let the server run without DB connection
        // This allows the server to start and show proper error messages
    }
}

// MongoDB connection events
const db = mongoose.connection;

db.on('connected', () => {
    console.log('🔗 MongoDB connected successfully');    
    console.log(`   - Host: ${db.host}`);
    console.log(`   - Port: ${db.port}`);
    console.log(`   - Database: ${db.name}`);
});

db.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
});

db.on('disconnected', () => {
    console.log('ℹ️  MongoDB disconnected');
});

// Close the MongoDB connection when the Node process ends
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

// Initialize MongoDB connection
connectToMongoDB();

// Define Task model
const taskSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model('Task', taskSchema);

// Routes
app.post("/add", async (req, res) => {
    try {
        const { task } = req.body;
        console.log("inside  add")
        if (!task || typeof task !== 'string' || !task.trim()) {
            return res.status(400).json({ error: 'Task is required and must be a non-empty string' });
        }

        const newTask = new Task({ task });
        await newTask.save();
        
        console.log('New task created:', { id: newTask._id, task: newTask.task });
        res.status(201).json({ 
            message: 'Task created successfully',
            task: {
                id: newTask._id,
                task: newTask.task,
                completed: newTask.completed,
                createdAt: newTask.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);    
    console.log(`🌐 Access the server at: http://localhost:${PORT}`);
});