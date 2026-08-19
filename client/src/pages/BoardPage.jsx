import Navbar from "../components/Navbar";
import Board from "../components/Board";

function BoardPage() {
    return (
        <div className="app">
            <Navbar />

            <main className="page-content">
                <div className="page-header">
                    <div>
                        <p className="page-label">WORKSPACE</p>
                        <h1>Development Board</h1>
                        <p className="page-subtitle">
                            Manage your team's tasks and track project progress.
                        </p>
                    </div>

                    <button className="add-task-button">
                        + Add Task
                    </button>
                </div>

                <Board />
            </main>
        </div>
    );
}

export default BoardPage;