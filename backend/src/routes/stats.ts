import { Router } from "express";
import { db } from "../lib/db.js";
import { requireAuth } from "../middleware.js";
import type { AuthenticatedRequest } from "../middleware.js";

const router = Router();

// Dashboard stats
router.get("/dashboard", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const stats = await db.getDashboardStats(req.userId!);
    res.json(stats);
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
