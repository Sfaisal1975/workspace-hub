import { Router } from "express";
import { Client } from "@notionhq/client";
import { db, publishedPagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const getNotionClient = () => {
  const token = process.env.NOTION_API_KEY;
  if (!token) {
    throw new Error("NOTION_API_KEY is not configured");
  }
  return new Client({ auth: token });
};

function extractTitle(item: any): string {
  const titleProp = item.properties?.Name || item.properties?.Title || item.properties?.title;
  if (titleProp?.title && Array.isArray(titleProp.title) && titleProp.title.length > 0) {
    return titleProp.title.map((t: any) => t.plain_text || t.text?.content || "").join("");
  }
  if (item.title && Array.isArray(item.title) && item.title.length > 0) {
    return item.title.map((t: any) => t.plain_text || t.text?.content || "").join("");
  }
  if (item.title && typeof item.title === "string") {
    return item.title;
  }
  return "Untitled";
}

// GET /api/published — list all published pages
router.get("/", async (req, res) => {
  try {
    const pages = await db
      .select()
      .from(publishedPagesTable)
      .where(eq(publishedPagesTable.isPublished, true))
      .orderBy(publishedPagesTable.publishedAt);

    res.json(pages);
  } catch (err: any) {
    req.log.error({ err: err.message }, "List published pages error");
    res.status(500).json({ error: err.message });
  }
});

// POST /api/published — publish a page
router.post("/", async (req, res) => {
  try {
    const { notionPageId, title, slug, notionUrl, description } = req.body;

    if (!notionPageId || !title || !slug) {
      res.status(400).json({ error: "notionPageId, title, and slug are required" });
      return;
    }

    // Check if already published
    const existing = await db
      .select()
      .from(publishedPagesTable)
      .where(eq(publishedPagesTable.notionPageId, notionPageId))
      .limit(1);

    if (existing.length > 0) {
      // Update to published
      const updated = await db
        .update(publishedPagesTable)
        .set({
          isPublished: true,
          title,
          slug,
          notionUrl: notionUrl || existing[0].notionUrl,
          description: description || existing[0].description,
          updatedAt: new Date(),
        })
        .where(eq(publishedPagesTable.notionPageId, notionPageId))
        .returning();
      res.status(200).json(updated[0]);
      return;
    }

    const inserted = await db
      .insert(publishedPagesTable)
      .values({
        notionPageId,
        title,
        slug,
        notionUrl: notionUrl || "",
        description: description || null,
        isPublished: true,
      })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (err: any) {
    req.log.error({ err: err.message }, "Publish page error");
    res.status(500).json({ error: err.message });
  }
});

// GET /api/published/:slug — get published page with Notion content
router.get("/:slug", async (req, res) => {
  try {
    const [published] = await db
      .select()
      .from(publishedPagesTable)
      .where(eq(publishedPagesTable.slug, req.params.slug))
      .limit(1);

    if (!published || !published.isPublished) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    const notion = getNotionClient();
    const page = await notion.pages.retrieve({ page_id: published.notionPageId });
    const blocks = await notion.blocks.children.list({
      block_id: published.notionPageId,
      page_size: 100,
    });

    const content = blocks.results.map((block: any) => {
      const type = block.type;
      let text = "";
      if (block[type]?.rich_text) {
        text = block[type].rich_text.map((t: any) => t.plain_text).join("");
      } else if (block[type]?.title) {
        text = block[type].title;
      }
      return { type, text };
    });

    res.json({
      notionPageId: published.notionPageId,
      title: published.title,
      slug: published.slug,
      notionUrl: published.notionUrl,
      description: published.description,
      isPublished: published.isPublished,
      publishedAt: published.publishedAt?.toISOString() || "",
      content,
    });
  } catch (err: any) {
    req.log.error({ err: err.message }, "Get published page error");
    res.status(500).json({ error: err.message });
  }
});

// POST /api/published/:notionPageId/unpublish — unpublish
router.post("/:notionPageId/unpublish", async (req, res) => {
  try {
    const updated = await db
      .update(publishedPagesTable)
      .set({
        isPublished: false,
        updatedAt: new Date(),
      })
      .where(eq(publishedPagesTable.notionPageId, req.params.notionPageId))
      .returning();

    if (updated.length === 0) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    res.json(updated[0]);
  } catch (err: any) {
    req.log.error({ err: err.message }, "Unpublish page error");
    res.status(500).json({ error: err.message });
  }
});

export default router;
