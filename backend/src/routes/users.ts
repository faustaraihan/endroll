import { Router } from "express";
import { db, ensureUser } from "../lib/db.js";
import { requireAuth } from "../middleware.js";
import type { AuthenticatedRequest } from "../middleware.js";

const router = Router();

// User profile: get or create
router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    let user = await db.getUser(userId);
    if (!user) {
      user = await db.createUser(userId);
    }
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Update profile
router.patch("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { username, avatarUrl, preferences } = req.body;
    const user = await db.updateUser(req.userId!, { username, avatar_url: avatarUrl, preferences });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
