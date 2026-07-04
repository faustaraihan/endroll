// Database client using Supabase Management API query endpoint
// Fallback when direct DB connection isn't available

const MANAGEMENT_API = "https://api.supabase.com/v1";

function getPat(): string {
  const pat = process.env.SUPABASE_PAT;
  if (!pat) throw new Error("SUPABASE_PAT env variable required for db client");
  return pat;
}

function getProjectRef(): string {
  const url = process.env.SUPABASE_URL || "";
  const match = url.match(/https:\/\/(.+)\.supabase\.co/);
  if (!match) throw new Error("SUPABASE_URL env variable required for db client");
  return match[1];
}

async function query(sql: string): Promise<any[]> {
  const pat = getPat();
  const ref = getProjectRef();
  const res = await fetch(
    `${MANAGEMENT_API}/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DB query failed: ${res.status} ${err}`);
  }

  return res.json();
}

export const db = {
  // Generic SQL
  query,

  // Users
  async getUser(userId: string) {
    const rows = await query(
      `SELECT * FROM users WHERE id = '${sanitize(userId)}' LIMIT 1`
    );
    return rows[0] || null;
  },

  async createUser(id: string, email?: string, username?: string) {
    const rows = await query(
      `INSERT INTO users (id, email, username) VALUES ('${sanitize(id)}', ${email ? `'${sanitize(email)}'` : "NULL"}, ${username ? `'${sanitize(username)}'` : `'user_${id.slice(0, 8)}'`}) RETURNING *`
    );
    return rows[0];
  },

  async updateUser(userId: string, data: Record<string, any>) {
    const sets = Object.entries(data)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k} = ${typeof v === "string" ? `'${sanitize(v)}'` : v}`)
      .join(", ");
    if (!sets) return null;
    const rows = await query(
      `UPDATE users SET ${sets} WHERE id = '${sanitize(userId)}' RETURNING *`
    );
    return rows[0];
  },

  // Titles
  async findTitle(tmdbId: number) {
    const rows = await query(
      `SELECT * FROM titles WHERE tmdb_id = ${tmdbId} LIMIT 1`
    );
    return rows[0] || null;
  },

  async createTitle(data: any) {
    const rows = await query(`
      INSERT INTO titles (tmdb_id, title, type, poster_path, release_year, runtime_minutes, genres, director, cast_list)
      VALUES (
        ${data.tmdbId},
        '${sanitize(data.title)}',
        '${sanitize(data.type)}',
        ${data.posterPath ? `'${sanitize(data.posterPath)}'` : "NULL"},
        ${data.releaseYear || "NULL"},
        ${data.runtimeMinutes || "NULL"},
        '{${(data.genres || []).map((g: string) => sanitize(g)).join(",")}}',
        ${data.director ? `'${sanitize(data.director)}'` : "NULL"},
        '{${(data.castList || []).map((c: string) => sanitize(c)).join(",")}}'
      )
      RETURNING *
    `);
    return rows[0];
  },

  async getTitleById(id: string) {
    const rows = await query(
      `SELECT * FROM titles WHERE id = '${sanitize(id)}' LIMIT 1`
    );
    return rows[0] || null;
  },

  // Watch Logs
  async getWatchLogs(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const rows = await query(
      `SELECT wl.*, row_to_json(t.*) as title
       FROM watch_logs wl
       JOIN titles t ON t.id = wl.title_id
       WHERE wl.user_id = '${sanitize(userId)}'
       ORDER BY wl.watched_at DESC
       LIMIT ${limit} OFFSET ${offset}`
    );
    const count = await query(
      `SELECT COUNT(*) as total FROM watch_logs WHERE user_id = '${sanitize(userId)}'`
    );
    return { data: rows, total: count[0]?.total || 0, page, totalPages: Math.ceil((count[0]?.total || 0) / limit) };
  },

  async createWatchLog(data: any) {
    const rows = await query(`
      INSERT INTO watch_logs (user_id, title_id, watched_at, rating, notes, rewatch_count, mood_tags)
      VALUES (
        '${sanitize(data.userId)}',
        '${sanitize(data.titleId)}',
        '${data.watchedAt}',
        ${data.rating !== undefined && data.rating !== null ? data.rating : "NULL"},
        ${data.notes ? `'${sanitize(data.notes)}'` : "NULL"},
        ${data.rewatchCount || 0},
        '{}'
      )
      RETURNING *
    `);
    return rows[0];
  },

  async updateWatchLog(id: string, userId: string, data: Record<string, any>) {
    const sets = Object.entries(data)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => {
        if (v === null) return `${k} = NULL`;
        if (typeof v === "string") return `${k} = '${sanitize(v)}'`;
        if (Array.isArray(v)) return `${k} = '{${v.map(String).join(",")}}'`;
        return `${k} = ${v}`;
      })
      .join(", ");
    if (!sets) return null;
    const rows = await query(
      `UPDATE watch_logs SET ${sets} WHERE id = '${sanitize(id)}' AND user_id = '${sanitize(userId)}' RETURNING *`
    );
    return rows[0];
  },

  async deleteWatchLog(id: string, userId: string) {
    await query(
      `DELETE FROM watch_logs WHERE id = '${sanitize(id)}' AND user_id = '${sanitize(userId)}'`
    );
    return true;
  },

  // Watchlist
  async getWatchlist(userId: string) {
    return query(
      `SELECT wl.*, row_to_json(t.*) as title
       FROM watchlist wl
       JOIN titles t ON t.id = wl.title_id
       WHERE wl.user_id = '${sanitize(userId)}'
       ORDER BY wl.added_at DESC`
    );
  },

  async addToWatchlist(userId: string, titleId: string, priority?: number) {
    const existing = await query(
      `SELECT id FROM watchlist WHERE user_id = '${sanitize(userId)}' AND title_id = '${sanitize(titleId)}' LIMIT 1`
    );
    if (existing[0]) {
      await query(
        `UPDATE watchlist SET priority = ${priority || "NULL"} WHERE id = '${existing[0].id}'`
      );
      return existing[0];
    }
    const rows = await query(
      `INSERT INTO watchlist (user_id, title_id, priority) VALUES ('${sanitize(userId)}', '${sanitize(titleId)}', ${priority || "NULL"}) RETURNING *`
    );
    return rows[0];
  },

  async removeFromWatchlist(userId: string, titleId: string) {
    await query(
      `DELETE FROM watchlist WHERE user_id = '${sanitize(userId)}' AND title_id = '${sanitize(titleId)}'`
    );
    return true;
  },

  async removeFromWatchlistAfterLog(userId: string, titleId: string) {
    await query(
      `DELETE FROM watchlist WHERE user_id = '${sanitize(userId)}' AND title_id = '${sanitize(titleId)}'`
    );
  },

  // Collections
  async getCollections(userId: string) {
    return query(
      `SELECT c.*, (SELECT COUNT(*) FROM collection_items WHERE collection_id = c.id) as item_count
       FROM collections c
       WHERE c.user_id = '${sanitize(userId)}'
       ORDER BY c.created_at DESC`
    );
  },

  async createCollection(data: any) {
    const rows = await query(
      `INSERT INTO collections (user_id, name, description, is_private)
       VALUES ('${sanitize(data.userId)}', '${sanitize(data.name)}', ${data.description ? `'${sanitize(data.description)}'` : "NULL"}, ${data.isPrivate !== false ? "true" : "false"})
       RETURNING *`
    );
    return rows[0];
  },

  async getCollectionWithItems(id: string, userId?: string) {
    const rows = await query(
      `SELECT c.*,
        (SELECT json_agg(json_build_object(
          'id', ci.id,
          'sort_order', ci.sort_order,
          'added_at', ci.added_at,
          'title', row_to_json(t.*)
         ) ORDER BY ci.sort_order) as items
         FROM collection_items ci
         JOIN titles t ON t.id = ci.title_id
         WHERE ci.collection_id = c.id)
       FROM collections c
       WHERE c.id = '${sanitize(id)}'`
    );
    const collection = rows[0];
    if (!collection) return null;
    if (collection.is_private && userId && collection.user_id !== userId) return null;
    return collection;
  },

  async addCollectionItem(collectionId: string, titleId: string) {
    const maxSort = await query(
      `SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM collection_items WHERE collection_id = '${sanitize(collectionId)}'`
    );
    const rows = await query(
      `INSERT INTO collection_items (collection_id, title_id, sort_order)
       VALUES ('${sanitize(collectionId)}', '${sanitize(titleId)}', ${maxSort[0]?.next || 1})
       RETURNING *`
    );
    return rows[0];
  },

  async removeCollectionItem(collectionId: string, itemId: string) {
    await query(
      `DELETE FROM collection_items WHERE id = '${sanitize(itemId)}' AND collection_id = '${sanitize(collectionId)}'`
    );
    return true;
  },

  async deleteCollection(id: string, userId: string) {
    await query(
      `DELETE FROM collections WHERE id = '${sanitize(id)}' AND user_id = '${sanitize(userId)}'`
    );
    return true;
  },

  // Stats
  async getDashboardStats(userId: string) {
    const [totalLogs, uniqueTitles, watchlistCount, collectionsCount, streak, avgRating, genreData, recent, monthly] =
      await Promise.all([
        query(`SELECT COUNT(*) as count FROM watch_logs WHERE user_id = '${sanitize(userId)}'`),
        query(`SELECT COUNT(DISTINCT title_id) as count FROM watch_logs WHERE user_id = '${sanitize(userId)}'`),
        query(`SELECT COUNT(*) as count FROM watchlist WHERE user_id = '${sanitize(userId)}'`),
        query(`SELECT COUNT(*) as count FROM collections WHERE user_id = '${sanitize(userId)}'`),
        query(`SELECT * FROM streaks WHERE user_id = '${sanitize(userId)}'`).then(r => r[0] || null),
        query(`SELECT AVG(rating) as avg FROM watch_logs WHERE user_id = '${sanitize(userId)}' AND rating IS NOT NULL`),
        query(`
          SELECT t.genres, COUNT(*) as count
          FROM watch_logs wl
          JOIN titles t ON t.id = wl.title_id
          WHERE wl.user_id = '${sanitize(userId)}'
          GROUP BY t.id
        `),
        query(`
          SELECT wl.*, row_to_json(t.*) as title
          FROM watch_logs wl
          JOIN titles t ON t.id = wl.title_id
          WHERE wl.user_id = '${sanitize(userId)}'
          ORDER BY wl.watched_at DESC LIMIT 5
        `),
        query(`
          SELECT TO_CHAR(watched_at, 'YYYY-MM') as month, COUNT(*) as count
          FROM watch_logs
          WHERE user_id = '${sanitize(userId)}' AND watched_at >= NOW() - INTERVAL '6 months'
          GROUP BY month ORDER BY month
        `),
      ]);

    // Aggregate genre counts
    const genreCount: Record<string, number> = {};
    for (const row of genreData) {
      if (row.genres) {
        for (const genre of row.genres) {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        }
      }
    }

    return {
      totalLogs: totalLogs[0]?.count || 0,
      uniqueTitles: uniqueTitles[0]?.count || 0,
      watchlistCount: watchlistCount[0]?.count || 0,
      collectionsCount: collectionsCount[0]?.count || 0,
      avgRating: avgRating[0]?.avg ? Number(Number(avgRating[0].avg).toFixed(1)) : null,
      streak: streak ? { current: streak.current_streak_weeks, longest: streak.longest_streak_weeks, lastLogWeek: streak.last_log_week } : null,
      topGenres: Object.entries(genreCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count })),
      recentEntries: recent,
      monthlyActivity: monthly,
    };
  },
};

// Basic SQL injection prevention (for text fields only)
function sanitize(str: string): string {
  return str.replace(/'/g, "''").replace(/\\/g, "\\\\");
}

export async function ensureUser(userId: string, email?: string) {
  const user = await db.getUser(userId);
  if (user) return user;
  return db.createUser(userId, email);
}
