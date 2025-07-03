import axios from "axios";

const API_BASE_URL = "http://localhost:3000"; // Ensure this matches your backend URL

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
};

export const fetchUsers = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error;
    }
};

export const addUser = async (name, email) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/add-user`,
            { name, email },
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error("Failed to add user:", error);
        throw error;
    }
};

export const updateUser = async (id, name, email) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/update-user/${id}`,
            { name, email },
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error("Failed to update user:", error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/delete-user/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error("Failed to delete user:", error);
        throw error;
    }
};