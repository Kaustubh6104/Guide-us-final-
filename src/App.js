import React, { useState } from "react";
import Login from "./components/Login"; // Ensure the path is correct
import UserManagement from "./components/UserManagement";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

    return (
        <div className="App">
            {isLoggedIn ? (
                <div>
                    <button onClick={handleLogout}>Logout</button>
                    <UserManagement />
                </div>
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App;
