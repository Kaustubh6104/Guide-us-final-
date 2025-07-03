require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// Debug Logs
console.log("🔥 Debug: Server is starting...");
console.log("🔥 Debug: JWT_SECRET is", JWT_SECRET);

// Middleware
app.use(express.json());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.static(path.join(__dirname, "../frontend/public")));

// MySQL Connection
const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "guide_us_db",
    port: 3306,
});
const connectDB = () => {
    db.connect((err) => {
        if (err) {
            console.error("❌ MySQL Connection Error:", err.message);
            setTimeout(connectDB, 5000);
        } else {
            console.log("🔥 MySQL Connected Successfully!");
        }
    });
};
connectDB();

// ✅ JWT Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Access denied, token missing" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

// ✅ View Scheduled Tours for Guide
app.get("/guide/scheduled-tours", authenticateToken, (req, res) => {
    const guideId = req.user.id;

    const query = `
        SELECT destination, date, is_international, rate, description
        FROM guide_tours
        WHERE guide_id = ?
        ORDER BY date ASC
    `;

    db.query(query, [guideId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching scheduled tours:", err.message);
            return res.status(500).json({ error: "Failed to fetch tours" });
        }
        res.json(results);
    });
});

// ✅ Add New Tour for Guide
app.post("/guide/add-tour", authenticateToken, (req, res) => {
    const guideId = req.user.id;
    const { destination, date, isInternational, rate, description } = req.body;

    if (!destination || !date || !rate) {
        return res.status(400).json({ success: false, error: "Required fields missing" });
    }

    const sql = `
        INSERT INTO guide_tours (guide_id, destination, date, is_international, rate, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [guideId, destination, date, isInternational ? 1 : 0, rate, description || ""], (err, result) => {
        if (err) {
            console.error("❌ Error inserting tour:", err.message);
            return res.status(500).json({ success: false, error: "Database error" });
        }

        res.json({ success: true, message: "Tour added successfully!" });
    });
});

app.get("/guide/bookings", authenticateToken, (req, res) => {
    const guideId = req.user.id;

    const query = `
        SELECT 
            b.destination,
            b.tour_date,
            u.name AS traveler_name
        FROM tour_bookings b
        JOIN users u ON u.id = b.traveler_id
        WHERE b.guide_id = ?
        ORDER BY b.tour_date ASC
    `;

    db.query(query, [guideId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching bookings:", err.message);
            return res.status(500).json({ error: "Failed to fetch bookings" });
        }
        res.json(results);
    });
});


app.post("/book-tour", authenticateToken, (req, res) => {
    const { guideId, travelerId, destination, date } = req.body;

    console.log("📝 Booking Request Received:", { guideId, travelerId, destination, date });

    if (!guideId || !travelerId || !destination || !date) {
        return res.status(400).json({ success: false, message: "Missing fields." });
    }

    const sql = `
        INSERT INTO tour_bookings (guide_id, traveler_id, destination, tour_date)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [guideId, travelerId, destination, date], (err) => {
        if (err) {
            console.error("❌ Booking Error:", err.message);
            return res.status(500).json({ success: false, message: "Booking failed." });
        }

        return res.json({ success: true, message: "Tour booked successfully!" });
    });
});






app.get("/guide/:id/tours", (req, res) => {
    const guideId = req.params.id;

    const query = `
        SELECT destination, date, is_international, rate, description
        FROM guide_tours
        WHERE guide_id = ?
        ORDER BY date ASC
    `;

    db.query(query, [guideId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching tours:", err.message);
            return res.status(500).json({ error: "Failed to fetch tours" });
        }
        res.json(results);
    });
});



// ✅ Serve login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public", "login.html"));
});

// ✅ Register
app.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role],
            (err) => {
                if (err) {
                    console.error("❌ MySQL Error:", err.message);
                    return res.status(500).json({ error: "Database error" });
                }
                res.json({ success: true, redirect: "/homepg.html" });
            }
        );
    } catch (error) {
        console.error("🔥 Server Error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Login
app.post("/login", (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return next(err);
        if (!results.length) return res.status(401).json({ error: "Invalid email or password" });

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: "Invalid email or password" });

        const token = jwt.sign({ id: user.id, username: user.name }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ 
            success: true, 
            token, 
            role: user.role 
        });
    });
});

app.post("/save-message", (req, res) => {
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
        return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const query = "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)";
    db.query(query, [senderId, receiverId, message], (err) => {
        if (err) {
            console.error("❌ Error saving message:", err.message);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

// 🔥 Get recent chats for guide (grouped by traveler- second change)
app.get("/guide/recent-chats", authenticateToken, (req, res) => {
    const guideId = req.user.id;

    const query = `
        SELECT 
            m.sender_id AS traveler_id,
            u.name AS traveler_name,
            m.message,
            m.timestamp
        FROM messages m
        INNER JOIN (
            SELECT sender_id, MAX(timestamp) AS latest
            FROM messages
            WHERE receiver_id = ?
            GROUP BY sender_id
        ) AS latest_msgs ON m.sender_id = latest_msgs.sender_id AND m.timestamp = latest_msgs.latest
        JOIN users u ON u.id = m.sender_id
        WHERE u.role = 'Traveller'
        ORDER BY m.timestamp DESC
    `;

    db.query(query, [guideId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching recent chats:", err.message);
            return res.status(500).json({ error: "Failed to fetch recent chats" });
        }
        res.json(results);
    });
});

// 🔁 Fetch recent chats for a traveler
app.get("/traveller/recent-chats", authenticateToken, (req, res) => {
    const travelerId = req.user.id;

    const query = `
        SELECT 
            m.receiver_id AS guide_id,
            u.name AS guide_name,
            m.message,
            m.timestamp,
            m.sender_id
        FROM messages m
        INNER JOIN (
            SELECT 
                CASE 
                    WHEN sender_id = ? THEN receiver_id 
                    ELSE sender_id 
                END AS user_id,
                MAX(timestamp) AS latest
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY user_id
        ) AS latest_msgs
        ON (
            (m.sender_id = ? AND m.receiver_id = latest_msgs.user_id) OR
            (m.receiver_id = ? AND m.sender_id = latest_msgs.user_id)
        )
        AND m.timestamp = latest_msgs.latest
        JOIN users u ON u.id = latest_msgs.user_id
        WHERE u.role = 'Guide'
        ORDER BY m.timestamp DESC
    `;

    db.query(query, [travelerId, travelerId, travelerId, travelerId, travelerId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching traveler chats:", err.message);
            return res.status(500).json({ error: "Failed to fetch chats" });
        }
        res.json(results);
    });
});




// Get messages between two users(change first)
app.get("/get-messages", (req, res) => {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
        return res.status(400).json({ error: "User IDs are required" });
    }

    const query = `
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
        OR (sender_id = ? AND receiver_id = ?) 
        ORDER BY timestamp ASC
    `;

    db.query(query, [user1, user2, user2, user1], (err, results) => {
        if (err) {
            console.error("❌ Error fetching messages:", err.message);
            return res.status(500).json({ error: "Failed to retrieve messages" });
        }
        res.json(results);
    });
});



// ✅ Update Guide Profile (secure using token)
app.post("/update-guide-profile", authenticateToken, (req, res) => {
    const { locations, languages, experience } = req.body;
    const guideId = req.user.id;

    if (!locations || !languages || !experience) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = `
        UPDATE users 
        SET locations = ?, languages = ?, experience = ? 
        WHERE id = ? AND role = 'Guide'
    `;

    db.query(sql, [locations, languages, experience, guideId], (err) => {
        if (err) {
            console.error("❌ Error updating guide profile:", err.message);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        return res.json({ success: true, message: "Guide profile updated successfully" });
    });
});

// ✅ Search for Guides
app.get("/search-guides", (req, res) => {
    const location = req.query.location;

    if (!location) {
        return res.status(400).json({ error: "Location is required" });
    }

    const sql = `
        SELECT id, name, locations, experience, rating 
        FROM users 
        WHERE role = 'Guide' AND locations LIKE ?
    `;

    db.query(sql, [`%${location}%`], (err, results) => {
        if (err) {
            console.error("❌ Error searching guides:", err.message);
            return res.status(500).json({ error: "Internal server error" });
        }
        return res.json(results);
    });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
});

// ✅ Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🔥 Server running on http://localhost:${PORT}`);
});
