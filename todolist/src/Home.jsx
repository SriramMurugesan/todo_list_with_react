import React, { useState, useEffect } from "react";
import Create from "./Create";
import axios from "axios";
import { BsCircleFill, BsFillTrashFill } from "react-icons/bs";
function Home() {
  const [todos, setTodos] = useState([])
  const [completedTodos, setCompletedTodos] = useState({});

  const fetchTodos = () => {
    axios
      .get("http://localhost:3001/get")
      .then((res) => {
        setTodos(res.data);
      })
      .catch((err) => {
        console.error("Error fetching todos:", err);
      });
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation(); // Prevent triggering the todo click when deleting
    axios
      .delete(`http://localhost:3001/delete/${id}`)
      .then(() => {
        fetchTodos();
      })
      .catch((err) => {
        console.error("Error deleting todo:", err);
      });
  };

  const toggleTodoComplete = (id) => {
    setCompletedTodos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="home">
      <h1>Todo List</h1>
      <Create onTaskAdded={fetchTodos} />
      {todos.length === 0 ? (
        <div>
          <h1> No records found</h1>
        </div>
      ) : (
        todos.map((todo, index) => (
          <div 
            className={`task ${completedTodos[todo._id] ? 'completed' : ''}`} 
            key={index}
            onClick={() => toggleTodoComplete(todo._id)}
          >
            <div className="task-content">
              <div className="task-checkbox">
                <div className="checkbox-circle">
                  {todo.task[0].toUpperCase()}
                </div>
              </div>
              <p className="task-text">{todo.task}</p>
              <div 
                className="task-delete"
                onClick={(e) => handleDelete(todo._id, e)}
              >
                <BsFillTrashFill className="icon" title="Delete task" />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Home;
