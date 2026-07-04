import { Router } from "express";
import { db } from "../lib/db.js";
import { requireAuth } from "../middleware.js";
import type { AuthenticatedRequest } from "../middleware.js";

const router = Router();

// List user's collections
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const collections = await db.getCollections(req.userId!);
    res.json(collections);
  } catch (err) {
    console.error("List collections error:", err);
    res.status(500).json({ error: "Failed to list collections" });
  }
});

// Create collection
router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    const collection = await db.createCollection({
      userId: req.userId!,
      name,
      description,
      isPrivate,
    });

    res.status(201).json(collection);
  } catch (err) {
    console.error("Create collection error:", err);
    res.status(500).json({ error: "Failed to create collection" });
  }
});

// Get collection with items
router.get("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const collection = await db.getCollectionWithItems(req.params.id, req.userId);
    if (!collection) return res.status(404).json({ error: "Collection not found or private" });
    res.json(collection);
  } catch (err) {
    console.error("Get collection error:", err);
    res.status(500).json({ error: "Failed to get collection" });
  }
});

// Add item to collection
router.post("/:id/items", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { titleId } = req.body;
    if (!titleId) return res.status(400).json({ error: "titleId required" });

    const collection = await db.getCollectionWithItems(req.params.id, req.userId!);
    if (!collection) return res.status(404).json({ error: "Collection not found" });

    const item = await db.addCollectionItem(req.params.id, titleId);
    res.status(201).json(item);
  } catch (err) {
    console.error("Add collection item error:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

// Remove item from collection
router.delete("/:id/items/:itemId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const collection = await db.getCollectionWithItems(req.params.id, req.userId!);
    if (!collection) return res.status(404).json({ error: "Collection not found" });

    await db.removeCollectionItem(req.params.id, req.params.itemId);
    res.json({ success: true });
  } catch (err) {
    console.error("Remove collection item error:", err);
    res.status(500).json({ error: "Failed to remove item" });
  }
});

// Delete collection
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await db.deleteCollection(req.params.id, req.userId!);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete collection error:", err);
    res.status(500).json({ error: "Failed to delete collection" });
  }
});

export default router;
