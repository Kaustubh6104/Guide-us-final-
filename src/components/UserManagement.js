import React, { useState, useEffect } from "react";
import { fetchUsers, addUser, updateUser, deleteUser } from "../api/api";

const UserManagement = () => {
    console.log("🔥 Debug: UserManagement component loaded"); // Add this log

    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [editingUserId, setEditingUserId] = useState(null);

    // Fetch users on component mount
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users:", error);
        }
    };

    const handleAddUser = async () => {
        try {
            await addUser(name, email);
            setName("");
            setEmail("");
            loadUsers();
        } catch (error) {
            console.error("Failed to add user:", error);
        }
    };

    const handleUpdateUser = async () => {
        try {
            await updateUser(editingUserId, name, email);
            setName("");
            setEmail("");
            setEditingUserId(null);
            loadUsers();
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await deleteUser(id);
            loadUsers();
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    const startEditing = (user) => {
        setEditingUserId(user.id);
        setName(user.name);
        setEmail(user.email);
    };

    return (
        <div>
            <h1>User Management</h1>
            <div>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {editingUserId ? (
                    <button onClick={handleUpdateUser}>Update User</button>
                ) : (
                    <button onClick={handleAddUser}>Add User</button>
                )}
            </div>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.name} ({user.email})
                        <button onClick={() => startEditing(user)}>Edit</button>
                        <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserManagement;
