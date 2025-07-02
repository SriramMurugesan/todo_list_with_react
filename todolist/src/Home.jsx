import React, { useState, useEffect } from "react";
import Create from "./Create";
import axios from "axios";
function Home() {
  const [todos, setTodos] = useState([]);

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

  return (
    <div className="home">
      <h1>Todo List</h1>
      <Create onTaskAdded={fetchTodos} />
      {todos.length === 0 ? (
        <div>
          <h1> No records found</h1>
        </div>
      ) : (
        todos.map((todo, index) => <div key={index}>{todo.task}</div>)
      )}
    </div>
  );
}

export default Home;
