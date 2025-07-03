import React, { useState, useEffect } from "react";
import Create from "./Create";
import axios from "axios";
import { BsCircleFill, BsFillTrashFill } from "react-icons/bs";
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

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:3001/delete/${id}`)
      .then(() => {
        fetchTodos();
      })
      .catch((err) => {
        console.error("Error deleting todo:", err);
      });
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
          <div className="task" key={index}>
            <div className="checkbox">
              <BsCircleFill className="icon" />
              <p>{todo.task}</p>
            </div>
            <div>
              <BsFillTrashFill className="icon" />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Home;
