import React, { useState } from "react";
import axios from "axios";

function Create({ onTaskAdded }) {
  const [task, setTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAdd = async () => {
    if (!task.trim()) {
      setError("Task cannot be empty");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post("http://localhost:3001/add", { task });
      console.log("Task added:", response.data);
      setTask("");
      setSuccess("Task added successfully!");
      if (onTaskAdded) onTaskAdded();
    } catch (err) {
      console.error("Error adding task:", err);
      setError(err.response?.data?.error || "Failed to add task. Please try again.");
    } finally {
      setIsLoading(false);
      
      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Enter a new task..."
          value={task}
          onChange={(e) => {
            setTask(e.target.value);
            if (error) setError(null);
          }}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAdd()}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`,
            flex: 1,
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.3s',
          }}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isLoading || !task.trim()}
          style={{
            padding: '0 24px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.3s',
            opacity: (isLoading || !task.trim()) ? 0.6 : 1,
            pointerEvents: (isLoading || !task.trim()) ? 'none' : 'auto',
          }}
        >
          {isLoading ? (
            <span>Adding...</span>
          ) : (
            <span>Add Task</span>
          )}
        </button>
      </div>
      
      {error && (
        <div style={{ color: '#ff4d4f', marginTop: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: '#52c41a', 
          marginTop: '8px', 
          fontSize: '14px',
          padding: '8px 12px',
          backgroundColor: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          {success}
        </div>
      )}
    </div>
  );
}

export default Create;