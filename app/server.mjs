// a backend server to provide env variables
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config({ path: "keys.env" });
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());

app.get("/keys", (req, res) => {
    res.json({
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_KEY: process.env.SUPABASE_KEY,
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));