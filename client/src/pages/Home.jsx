import Navbar from "../components/Navbar";

function Home() {
    return (
        <div className="app">
            <Navbar />

            <main className="home-content">
                <div className="hero-section">
                    <p className="page-label">WELCOME TO COLLABBOARD</p>

                    <h1>
                        Work together.
                        <br />
                        <span>Get things done.</span>
                    </h1>

                    <p className="hero-description">
                        A collaborative task management workspace designed to help your
                        team organize work, track progress, and achieve goals together.
                    </p>

                    <a href="/board" className="hero-button">
                        Open Development Board →
                    </a>
                </div>

                <div className="home-features">
                    <div className="feature-card">
                        <span>01</span>
                        <h3>Organize</h3>
                        <p>Keep all your team tasks organized in one workspace.</p>
                    </div>

                    <div className="feature-card">
                        <span>02</span>
                        <h3>Collaborate</h3>
                        <p>Work together and keep everyone aligned with the project.</p>
                    </div>

                    <div className="feature-card">
                        <span>03</span>
                        <h3>Track Progress</h3>
                        <p>Move tasks through To Do, Doing, and Done.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;