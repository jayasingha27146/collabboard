import { useState, useEffect } from "react";
import Column from "./Column";
import * as taskService from "../services/taskService";

function Board() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        const response = await taskService.getTasks();
        setTasks(response?.data || response || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  const todoTasks = tasks.filter((task) => task.status === "todo");
  const doingTasks = tasks.filter((task) => task.status === "doing");
  const doneTasks = tasks.filter((task) => task.status === "done");

  if (loading)
    return (
      <main className="board">
        <p>Loading tasks...</p>
      </main>
    );
  if (error)
    return (
      <main className="board">
        <p>Error: {error}</p>
      </main>
    );

  return (
    <main className="board">
      <Column title="To Do" tasks={todoTasks} />
      <Column title="Doing" tasks={doingTasks} />
      <Column title="Done" tasks={doneTasks} />
    </main>
  );
}

export default Board;
