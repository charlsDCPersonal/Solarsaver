require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");



const app = express();
app.use(cors());
app.use(express.json()); // For parsing JSON data

const DATABASE_URL2 = process.env.DATABASE_URL2 || "postgresql://postgres:92813@100.20.92.101:5432/solar_quotes";

console.log("Connecting to:", DATABASE_URL2); // Debugging

const pool = new Pool({
    connectionString: DATABASE_URL2,
    ssl: false, // Keep SSL disabled for local PostgreSQL
});

pool.connect()
    .then(() => console.log("✅ Connected to PostgreSQL!"))
    .catch(err => console.error("❌ Connection error:", err));

module.exports = pool;



// API Route to Store Solar Quotes
app.post("/submit-quote", async (req, res) => {
    const { name, email, monthlyBill, systemType, estimatedCost } = req.body;

    // Validate input data
    if (!name || !email || !monthlyBill || !systemType || !estimatedCost) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO quotes (name, email, monthly_bill, system_type, estimated_cost) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, email, monthlyBill, systemType, estimatedCost]
        );
        res.status(201).json({ message: "Quote saved successfully!", data: result.rows[0] });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});



// API Route to Get All Quotes
app.get("/quotes", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM quotes ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/", (req, res) => {
    res.send("Solar Quote API is running! 🚀 Available routes: /submit-quote (POST), /quotes (GET)");
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
