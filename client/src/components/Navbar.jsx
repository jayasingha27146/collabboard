function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <span className="logo-icon">?</span>
                <span>CollabBoard</span>
            </div>

            <div className="navbar-links">
                <a href="/">Dashboard</a>
                <a href="/board">My Tasks</a>
                <a href="/profile">Profile</a>
            </div>
        </nav>
    );
}

export default Navbar;