import React, { useState, useEffect } from "react";
import Create from "./Create";
import axios from "axios";
import { BsCircleFill, BsFillTrashFill, BsPencilFill } from "react-icons/bs";

function Home() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/get");
      setTodos(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching todos:", err);
      setError("Failed to load todos. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!id) return;
    
    try {
      await axios.delete(`http://localhost:3001/delete/${id}`);
      // Optimistic update: remove the todo from the local state immediately
      setTodos(prev => prev.filter(todo => todo._id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
      // Re-fetch to ensure UI is in sync with the server
      fetchTodos();
      alert("Failed to delete todo. Please try again.");
    }
  };

  const toggleTodoComplete = async (id) => {
    if (!id || editingId === id) return; // Don't toggle if editing
    
    try {
      // Optimistic update: update the UI immediately
      setTodos(prev => 
        prev.map(todo => 
          todo._id === id 
            ? { ...todo, completed: !todo.completed } 
            : todo
        )
      );
      
      // Then update the server
      await axios.put(`http://localhost:3001/update/${id}`, { 
        completed: !todos.find(t => t._id === id)?.completed 
      });
    } catch (err) {
      console.error("Error updating todo:", err);
      // Revert the UI if the server update fails
      fetchTodos();
      alert("Failed to update todo status. Please try again.");
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo._id);
    setEditText(todo.task);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) {
      alert('Task cannot be empty');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3001/update/${id}`, { 
        task: editText.trim() 
      });
      
      // Update the local state with the updated todo
      setTodos(prev => 
        prev.map(todo => 
          todo._id === id 
            ? { ...todo, task: editText.trim() } 
            : todo
        )
      );
      
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error("Error updating todo:", err);
      alert("Failed to update task. Please try again.");
    }
  };

  return (
    <div className="home">
      <h1>Todo List</h1>
      <Create onTaskAdded={fetchTodos} />
      
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && todos.length === 0 ? (
        <div className="no-todos">
          <p>No tasks found. Add one above to get started!</p>
        </div>
      ) : (
        <div className="todo-list">
          {todos.map((todo) => (
            <div 
              className={`task ${todo.completed ? 'completed' : ''}`} 
              key={todo._id}
              onClick={() => toggleTodoComplete(todo._id)}
            >
              <div className="task-content">
                <div className="task-checkbox">
                  <div className="checkbox-circle">
                    {todo.task[0].toUpperCase()}
                  </div>
                </div>
                
                {editingId === todo._id ? (
                  <input
                    type="text"
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' ? saveEdit(todo._id) : null}
                    autoFocus
                  />
                ) : (
                  <p className="task-text" onClick={() => toggleTodoComplete(todo._id)}>
                    {todo.task}
                  </p>
                )}
                
                <div className="task-actions">
                  {editingId === todo._id ? (
                    <>
                      <button 
                        className="action-btn save-btn"
                        onClick={() => saveEdit(todo._id)}
                        title="Save changes"
                      >
                        Save
                      </button>
                      <button 
                        className="action-btn cancel-btn"
                        onClick={cancelEditing}
                        title="Cancel editing"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <BsPencilFill 
                        className="icon edit-icon" 
                        title="Edit task" 
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(todo);
                        }} 
                      />
                      <BsFillTrashFill 
                        className="icon delete-icon" 
                        title="Delete task" 
                        onClick={(e) => handleDelete(todo._id, e)} 
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
