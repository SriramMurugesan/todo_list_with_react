import React,{ useState, useEffect } from "react";
import Create from "./Create";
import axios from "axios";
function Home() {
  const [todos, setTodos] = useState([])
  useEffect(() => {
    axios.get("http://localhost:3001/get")
    .then((res) => {
      setTodos(res.data)
    })
    .catch((err) => {
      console.log(err)
    })
  }, [])


  return (
    <div className="home">
      <h1>Todo List</h1>
      <Create />
      {todos.length === 0 ? 
        <div>
          <h2> No records found</h2>
        </div>
       : todos.map((todo, index) => <div key={index}>{todo.task}</div>)
      }
    </div>
  );
}

export default Home;
