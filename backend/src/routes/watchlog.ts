import { Router } from "express";
import { db, ensureUser } from "../lib/db.js";
import { requireAuth } from "../middleware.js";
import type { AuthenticatedRequest } from "../middleware.js";

const router = Router();

// List diary entries (paginated)
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await db.getWatchLogs(userId, page, limit);
    res.json(result);
  } catch (err) {
    console.error("List watchlog error:", err);
    res.status(500).json({ error: "Failed to list entries" });
  }
});

// Create diary entry
router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    await ensureUser(userId);

    const { titleId, watchedAt, rating, notes, rewatchCount, moodTags } = req.body;

    if (!titleId || !watchedAt) {
      return res.status(400).json({ error: "titleId and watchedAt required" });
    }

    await ensureUser(userId);

    const log = await db.createWatchLog({
      userId,
      titleId,
      watchedAt,
      rating: rating ?? null,
      notes: notes ?? null,
      rewatchCount: rewatchCount ?? 0,
      moodTags: moodTags ?? [],
    });

    // Auto-remove from watchlist if exists
    await db.removeFromWatchlistAfterLog(userId, titleId);

    res.status(201).json(log);
  } catch (err) {
    console.error("Create watchlog error:", err);
    res.status(500).json({ error: "Failed to create entry" });
  }
});

// Update diary entry
router.patch("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const { rating, notes, rewatchCount, moodTags } = req.body;

    const updated = await db.updateWatchLog(req.params.id, userId, {
      rating,
      notes,
      rewatchCount,
      moodTags,
    });

    if (!updated) return res.status(404).json({ error: "Entry not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update watchlog error:", err);
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// Delete diary entry
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    await db.deleteWatchLog(req.params.id, userId);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete watchlog error:", err);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

export default router;
