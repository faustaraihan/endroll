import { Router } from "express";
import { db } from "../lib/db.js";
import { searchTmdb, getTmdbDetails } from "../lib/tmdb.js";

const router = Router();

// Search TMDB
router.get("/search", async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Query param `q` is required" });
    }

    const results = await searchTmdb(q, type as "movie" | "tv" | undefined);
    if ("error" in results) {
      return res.status(502).json(results);
    }

    const mapped = results
      .filter((r: any) => r.media_type !== "person")
      .slice(0, 20)
      .map((r: any) => ({
        tmdbId: r.id,
        title: r.title || r.name,
        type: r.media_type === "tv" ? "series" : "film",
        posterPath: r.poster_path,
        releaseYear: parseInt(r.release_date?.slice(0, 4) || r.first_air_date?.slice(0, 4) || "0"),
        overview: r.overview,
      }));

    res.json(mapped);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// Get / sync title details from TMDB
router.post("/sync", async (req, res) => {
  try {
    const { tmdbId, type } = req.body;
    if (!tmdbId || !type) {
      return res.status(400).json({ error: "tmdbId and type required" });
    }

    // Check if already cached
    const existing = await db.findTitle(tmdbId);
    if (existing) return res.json(existing);

    // Fetch from TMDB
    const details = await getTmdbDetails(tmdbId, type === "series" ? "tv" : "movie");
    if ("error" in details) {
      return res.status(502).json(details);
    }

    // Cache in DB
    const title = await db.createTitle(details);
    res.json(title);
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

// Get cached title by ID
router.get("/:id", async (req, res) => {
  try {
    const title = await db.getTitleById(req.params.id);
    if (!title) return res.status(404).json({ error: "Title not found" });
    res.json(title);
  } catch (err) {
    console.error("Get title error:", err);
    res.status(500).json({ error: "Failed to get title" });
  }
});

export default router;
