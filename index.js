import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;
const API_KEY = "BU_YERGA_RAWG_API_KEY";

app.use(cors());

// __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Frontend fayllar
app.use(express.static(__dirname));

// Asosiy sahifa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Qidiruv API
app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);

    const r = await fetch(
      `https://api.rawg.io/api/games?search=${encodeURIComponent(q)}&key=${API_KEY}`
    );
    const data = await r.json();

    const results = (data.results || []).map(g => ({
      name: g.name,
      image: g.background_image,
      steam: `https://store.steampowered.com/search/?term=${encodeURIComponent(g.name)}`,
      epic: `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(g.name)}`,
      itch: `https://itch.io/search?q=${encodeURIComponent(g.name)}`
    }));

    res.json(results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
