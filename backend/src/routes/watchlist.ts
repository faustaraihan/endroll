import { Router } from "express";
import { db } from "../lib/db.js";
import { requireAuth } from "../middleware.js";
import type { AuthenticatedRequest } from "../middleware.js";

const router = Router();

// List watchlist
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const items = await db.getWatchlist(req.userId!);
    res.json(items);
  } catch (err) {
    console.error("List watchlist error:", err);
    res.status(500).json({ error: "Failed to list watchlist" });
  }
});

// Add to watchlist
router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { titleId, priority } = req.body;
    if (!titleId) return res.status(400).json({ error: "titleId required" });

    const item = await db.addToWatchlist(req.userId!, titleId, priority);
    res.status(201).json(item);
  } catch (err) {
    console.error("Add to watchlist error:", err);
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
});

// Remove from watchlist
router.delete("/:titleId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await db.removeFromWatchlist(req.userId!, req.params.titleId);
    res.json({ success: true });
  } catch (err) {
    console.error("Remove from watchlist error:", err);
    res.status(500).json({ error: "Failed to remove from watchlist" });
  }
});

export default router;
