// ==========================================
// PostgreSQL 数据库连接与操作
// ==========================================

import { sql } from "@vercel/postgres";
import type {
  User,
  Memory,
  BondMoment,
  RelationStats,
  DialogueLine,
  CharacterType,
  InteractionMode,
  SceneType,
} from "@/types";

// ========== 用户操作 ==========

export async function createAnonymousUser(): Promise<User> {
  const result = await sql`
    INSERT INTO users (is_anonymous, nickname)
    VALUES (TRUE, '小唐')
    RETURNING id, email, nickname, is_anonymous, created_at
  `;
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    isAnonymous: row.is_anonymous,
    createdAt: row.created_at,
  };
}

export async function createUser(email: string, passwordHash: string, nickname?: string): Promise<User> {
  const result = await sql`
    INSERT INTO users (email, password_hash, nickname, is_anonymous)
    VALUES (${email}, ${passwordHash}, ${nickname || email.split("@")[0]}, FALSE)
    RETURNING id, email, nickname, is_anonymous, created_at
  `;
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    isAnonymous: row.is_anonymous,
    createdAt: row.created_at,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, nickname, is_anonymous, created_at
    FROM users WHERE id = ${id}
  `;
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    isAnonymous: row.is_anonymous,
    createdAt: row.created_at,
  };
}

export async function getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  const result = await sql`
    SELECT id, email, nickname, is_anonymous, created_at, password_hash
    FROM users WHERE email = ${email}
  `;
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    isAnonymous: row.is_anonymous,
    createdAt: row.created_at,
    passwordHash: row.password_hash,
  };
}

// ========== 记忆操作 ==========

export async function storeMemory(
  characterType: CharacterType | "dual" | "system",
  content: string,
  memoryType: "short_term" | "long_term" | "canon",
  importance = 1,
  vectorId?: string
): Promise<Memory> {
  const result = await sql`
    INSERT INTO memories (character_type, content, memory_type, importance, vector_id)
    VALUES (${characterType}, ${content}, ${memoryType}, ${importance}, ${vectorId || null})
    RETURNING id, character_type, content, summary, importance, memory_type, created_at
  `;
  const row = result.rows[0];
  return {
    id: row.id,
    characterType: row.character_type,
    content: row.content,
    summary: row.summary,
    importance: row.importance,
    memoryType: row.memory_type,
    createdAt: row.created_at,
  };
}

export async function getRecentMemories(
  limit = 10,
  characterType?: CharacterType
): Promise<Memory[]> {
  let query;
  if (characterType) {
    query = sql`
      SELECT id, character_type, content, summary, importance, memory_type, created_at
      FROM memories
      WHERE character_type = ${characterType} OR character_type = 'dual'
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  } else {
    query = sql`
      SELECT id, character_type, content, summary, importance, memory_type, created_at
      FROM memories
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }
  const result = await query;
  return result.rows.map((row) => ({
    id: row.id,
    characterType: row.character_type,
    content: row.content,
    summary: row.summary,
    importance: row.importance,
    memoryType: row.memory_type,
    createdAt: row.created_at,
  }));
}

export async function getImportantMemories(limit = 5): Promise<Memory[]> {
  const result = await sql`
    SELECT id, character_type, content, summary, importance, memory_type, created_at
    FROM memories
    WHERE importance >= 7
    ORDER BY random()
    LIMIT ${limit}
  `;
  return result.rows.map((row) => ({
    id: row.id,
    characterType: row.character_type,
    content: row.content,
    summary: row.summary,
    importance: row.importance,
    memoryType: row.memory_type,
    createdAt: row.created_at,
  }));
}

// ========== 事件操作 ==========

export async function storeEvent(
  scene: SceneType,
  mode: InteractionMode,
  dialogueJson: DialogueLine[],
  innerOsJson: Record<string, string>,
  userId?: string,
  userMessage?: string
): Promise<string> {
  const result = await sql`
    INSERT INTO events (scene, mode, user_id, user_message, dialogue_json, inner_os_json)
    VALUES (${scene}, ${mode}, ${userId || null}, ${userMessage || null}, ${JSON.stringify(dialogueJson)}, ${JSON.stringify(innerOsJson)})
    RETURNING id
  `;
  return result.rows[0].id;
}

export async function getRecentEvents(limit = 20): Promise<any[]> {
  const result = await sql`
    SELECT * FROM events ORDER BY created_at DESC LIMIT ${limit}
  `;
  return result.rows;
}

// ========== 关系数值操作 ==========

export async function updateRelationStats(
  userId: string,
  updates: { sweetness?: number; jealousy?: number; assistCount?: number; totalInteractions?: number }
): Promise<void> {
  const existing = await sql`
    SELECT * FROM relation_stats WHERE user_id = ${userId}
  `;

  if (existing.rows.length === 0) {
    await sql`
      INSERT INTO relation_stats (user_id, sweetness, jealousy, assist_count, total_interactions)
      VALUES (${userId}, ${updates.sweetness || 50}, ${updates.jealousy || 0}, ${updates.assistCount || 0}, ${updates.totalInteractions || 1})
    `;
  } else {
    const current = existing.rows[0];
    await sql`
      UPDATE relation_stats SET
        sweetness = ${Math.max(0, Math.min(100, (current.sweetness || 50) + (updates.sweetness || 0)))},
        jealousy = ${Math.max(0, Math.min(100, (current.jealousy || 0) + (updates.jealousy || 0)))},
        assist_count = ${(current.assist_count || 0) + (updates.assistCount || 0)},
        total_interactions = ${(current.total_interactions || 0) + (updates.totalInteractions || 1)},
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;
  }
}

export async function getRelationStats(userId: string): Promise<RelationStats> {
  const result = await sql`
    SELECT * FROM relation_stats WHERE user_id = ${userId}
  `;
  if (result.rows.length === 0) {
    return { sweetness: 50, jealousy: 0, assistCount: 0, totalInteractions: 0 };
  }
  const row = result.rows[0];
  return {
    sweetness: row.sweetness,
    jealousy: row.jealousy,
    assistCount: row.assist_count,
    totalInteractions: row.total_interactions,
  };
}

// ========== 羁绊之书操作 ==========

export async function storeBondMoment(
  title: string,
  description: string,
  sceneDescription?: string,
  dialogueSnapshot?: DialogueLine[],
  moodTags?: string[],
  userId?: string
): Promise<BondMoment> {
  const tagsLiteral = moodTags && moodTags.length > 0
    ? `ARRAY[${moodTags.map(t => `'${t.replace(/'/g, "''")}'`).join(",")}]`
    : "ARRAY[]::text[]";

  const snapValue = dialogueSnapshot ? `'${JSON.stringify(dialogueSnapshot).replace(/'/g, "''")}'::jsonb` : "NULL";

  const queryStr = `
    INSERT INTO bond_moments (user_id, title, description, scene_description, dialogue_snapshot, mood_tags)
    VALUES (
      ${userId ? `'${userId}'` : "NULL"},
      '${title.replace(/'/g, "''")}',
      '${description.replace(/'/g, "''")}',
      ${sceneDescription ? `'${sceneDescription.replace(/'/g, "''")}'` : "NULL"},
      ${snapValue},
      ${tagsLiteral}
    )
    RETURNING id, title, description, scene_description, dialogue_snapshot, mood_tags, created_at
  `;

  const result = await sql.query(queryStr);
  const row = result.rows[0];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    sceneDescription: row.scene_description,
    dialogueSnapshot: row.dialogue_snapshot,
    moodTags: row.mood_tags,
    createdAt: row.created_at,
  };
}

export async function getBondMoments(userId?: string, limit = 20): Promise<BondMoment[]> {
  const query = userId
    ? sql`SELECT * FROM bond_moments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}`
    : sql`SELECT * FROM bond_moments ORDER BY created_at DESC LIMIT ${limit}`;
  const result = await query;
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    sceneDescription: row.scene_description,
    dialogueSnapshot: row.dialogue_snapshot,
    moodTags: row.mood_tags,
    createdAt: row.created_at,
  }));
}

// ========== 成就操作 ==========

export async function unlockAchievement(
  userId: string,
  type: string,
  title: string,
  description?: string
): Promise<void> {
  const existing = await sql`
    SELECT id FROM achievements WHERE user_id = ${userId} AND type = ${type}
  `;
  if (existing.rows.length > 0) return;

  await sql`
    INSERT INTO achievements (user_id, type, title, description)
    VALUES (${userId}, ${type}, ${title}, ${description || null})
  `;
}

export async function getAchievements(userId: string): Promise<any[]> {
  const result = await sql`
    SELECT * FROM achievements WHERE user_id = ${userId} ORDER BY unlocked_at DESC
  `;
  return result.rows;
}
