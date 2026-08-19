import TaskCard from "./TaskCard";

function Column({ title, tasks }) {
    return (
        <section className="board-column">
            <div className="column-header">
                <h2>{title}</h2>
                <span className="task-count">{tasks.length}</span>
            </div>

            <div className="column-tasks">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </section>
    );
}

export default Column;