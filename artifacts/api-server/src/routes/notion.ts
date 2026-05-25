import { Router } from "express";
import { Client } from "@notionhq/client";

const router = Router();

const getNotionClient = () => {
  const token = process.env.NOTION_API_KEY;
  if (!token) {
    throw new Error("NOTION_API_KEY is not configured");
  }
  return new Client({ auth: token });
};

// Helper to extract title from any Notion page/database object
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

// Helper to simplify Notion properties for the frontend
function simplifyProperties(properties: any): any {
  const result: any = {};
  for (const [key, prop] of Object.entries(properties)) {
    const p = prop as any;
    switch (p.type) {
      case "title":
        result[key] = p.title?.map((t: any) => t.plain_text).join("") || "";
        break;
      case "rich_text":
        result[key] = p.rich_text?.map((t: any) => t.plain_text).join("") || "";
        break;
      case "select":
        result[key] = p.select?.name || null;
        break;
      case "multi_select":
        result[key] = p.multi_select?.map((s: any) => s.name) || [];
        break;
      case "status":
        result[key] = p.status?.name || null;
        break;
      case "checkbox":
        result[key] = p.checkbox || false;
        break;
      case "number":
        result[key] = p.number ?? null;
        break;
      case "date":
        result[key] = p.date ? { start: p.date.start, end: p.date.end } : null;
        break;
      case "url":
        result[key] = p.url || null;
        break;
      case "email":
        result[key] = p.email || null;
        break;
      case "phone_number":
        result[key] = p.phone_number || null;
        break;
      case "relation":
        result[key] = p.relation?.map((r: any) => r.id) || [];
        break;
      case "formula":
        result[key] = p.formula?.[p.formula.type] ?? null;
        break;
      case "rollup":
        result[key] = p.rollup?.array ?? p.rollup?.number ?? p.rollup?.date ?? null;
        break;
      case "created_time":
        result[key] = p.created_time || null;
        break;
      case "last_edited_time":
        result[key] = p.last_edited_time || null;
        break;
      case "people":
        result[key] = p.people?.map((person: any) => person.name || person.id) || [];
        break;
      default:
        result[key] = null;
    }
  }
  return result;
}

// GET /api/notion/workspace
router.get("/workspace", async (req, res) => {
  try {
    const notion = getNotionClient();
    const searchResponse = await notion.search({ page_size: 100 });
    const pages = searchResponse.results.filter((r) => r.object === "page");
    const databases = searchResponse.results.filter((r) => r.object === "database");

    const recentItems = searchResponse.results.slice(0, 8).map((item) => {
      const title = extractTitle(item);
      return {
        id: item.id,
        title,
        type: item.object as string,
        url: (item as any).url || "",
        createdAt: (item as any).created_time || "",
      };
    });

    res.json({
      totalPages: pages.length,
      totalDatabases: databases.length,
      recentItems,
    });
  } catch (err: any) {
    req.log.error({ err: err.message }, "Notion workspace error");
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notion/databases
router.get("/databases", async (req, res) => {
  try {
    const notion = getNotionClient();
    const searchResponse = await notion.search({
      filter: { value: "database", property: "object" },
      page_size: 100,
    });

    const databases = searchResponse.results.map((db: any) => ({
      id: db.id,
      title: extractTitle(db),
      url: db.url || "",
      createdAt: db.created_time || "",
      properties: db.properties || {},
    }));

    res.json(databases);
  } catch (err: any) {
    req.log.error({ err: err.message }, "Notion databases error");
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notion/databases/:id
router.get("/databases/:id", async (req, res) => {
  try {
    const notion = getNotionClient();
    const db = await notion.databases.retrieve({ database_id: req.params.id });

    res.json({
      id: db.id,
      title: extractTitle(db),
      url: (db as any).url || "",
      createdAt: (db as any).created_time || "",
      properties: db.properties || {},
    });
  } catch (err: any) {
    req.log.error({ err: err.message }, "Notion database detail error");
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notion/databases/:id/entries
router.get("/databases/:id/entries", async (req, res) => {
  try {
    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: req.params.id,
      page_size: 100,
    });

    const entries = response.results.map((entry: any) => {
      const title = extractTitle(entry);
      return {
        id: entry.id,
        title,
        url: entry.url || "",
        createdAt: entry.created_time || "",
        properties: simplifyProperties(entry.properties),
      };
    });

    res.json(entries);
  } catch (err: any) {
    req.log.error({ err: err.message }, "Notion database entries error");
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notion/entries/:entryId
router.patch("/entries/:entryId", async (req, res) => {
  try {
    const notion = getNotionClient();
    const response = await notion.pages.update({
      page_id: req.params.entryId,
      properties: req.body.properties,
    });

    res.json({
      id: response.id,
      title: extractTitle(response),
      url: (response as any).url || "",
      createdAt: (response as any).created_time || "",
      properties: simplifyProperties((response as any).properties || {}),
    });
  } catch (err: any) {
    req.log.error({ err: err.message }, "Notion update entry error");
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notion/pages/:id
router.get("/pages/:id", async (req, res) => {
  try {
    const notion = getNotionClient();
    const page = await notion.pages.retrieve({ page_id: req.params.id });
    const blocks = await notion.blocks.children.list({
      block_id: req.params.id,
      page_size: 100,
    });

    const title = extractTitle(page);

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
      id: page.id,
      title,
      url: (page as any).url || "",
      createdAt: (page as any).created_time || "",
      content,
    });
  } catch (err: any) {
    req.log.error({ err: err.message }, "Notion page error");
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notion/search
router.get("/search", async (req, res) => {
  try {
    const notion = getNotionClient();
    const q = req.query.q as string;
    const searchResponse = await notion.search({
      query: q || "",
      page_size: 20,
    });

    const results = searchResponse.results.map((item: any) => ({
      id: item.id,
      title: extractTitle(item),
      type: item.object as string,
      url: item.url || "",
      createdAt: item.created_time || "",
    }));

    res.json(results);
  } catch (err: any) {
    req.log.error({ err: err.message }, "Notion search error");
    res.status(500).json({ error: err.message });
  }
});

export default router;
