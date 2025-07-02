const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
    task: String
})

const TodoModel = mongoose.model("Todo", TodoSchema)
module.exports = TodoModel