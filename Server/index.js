const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const TodoModel = require("./Models/Todo")

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

// GET all todos
app.get("/get", async (req, res) => {
    try {
        const todos = await TodoModel.find({}).sort({ createdAt: -1 });
        console.log("Fetched todos:", todos);
        res.json(todos);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});
    
// Delete a todo by ID
app.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid todo ID' });
        }
        
        const deletedTodo = await TodoModel.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a todo by ID (update task text and/or completion status)
app.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { task, completed } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid todo ID' });
        }
        
        const updateData = {};
        
        if (task !== undefined) {
            if (typeof task !== 'string' || !task.trim()) {
                return res.status(400).json({ error: 'Task must be a non-empty string' });
            }
            updateData.task = task.trim();
        }
        
        if (completed !== undefined) {
            updateData.completed = Boolean(completed);
        } else if (Object.keys(updateData).length === 0) {
            // If no valid updates were provided, toggle the completion status
            updateData.completed = { $not: "$completed" };
        }
        
        const todo = await TodoModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.json({ 
            message: 'Todo updated successfully',
            todo: {
                id: todo._id,
                task: todo.task,
                completed: todo.completed
            }
        });
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new todo
app.post("/add", async (req, res) => {
    try {
        const { task } = req.body;
        console.log("Adding new task:", task);
        
        if (!task || typeof task !== 'string' || !task.trim()) {
            return res.status(400).json({ error: 'Task is required and must be a non-empty string' });
        }

        const newTask = new TodoModel({ task });
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