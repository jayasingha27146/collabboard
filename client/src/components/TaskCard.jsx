function TaskCard({ task }) {
    return (
        <div className="task-card">
            <div className="task-card-header">
                <h3>{task.title}</h3>
                <span className={`priority priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                </span>
            </div>

            <p className="task-description">{task.description}</p>

            <div className="task-card-footer">
                <span className="assignee">{task.assignee}</span>
            </div>
        </div>
    );
}

export default TaskCard;