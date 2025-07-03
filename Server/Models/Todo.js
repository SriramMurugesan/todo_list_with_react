const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
    task: {
        type: String,
        required: [true, 'Task is required'],
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Add text index for searching
TodoSchema.index({ task: 'text' });

const TodoModel = mongoose.model("Todo", TodoSchema);
module.exports = TodoModel;