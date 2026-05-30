// ==========================================
// 数据库迁移脚本
// 运行: npx ts-node scripts/migrate.ts
// ==========================================

import { createClient } from "@vercel/postgres";

async function migrate() {
  console.log("Starting database migration...");

  const client = createClient({
    connectionString: process.env.POSTGRES_URL,
  });

  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE,
          nickname VARCHAR(100) NOT NULL DEFAULT '推理社第六人',
          password_hash VARCHAR(255),
          is_anonymous BOOLEAN DEFAULT FALSE,
          role VARCHAR(50) DEFAULT 'visitor',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("  ✓ users");

    await client.query(`
      CREATE TABLE IF NOT EXISTS memories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          character_type VARCHAR(20) NOT NULL CHECK (character_type IN ('tianxiwei', 'liyitong', 'dual', 'system')),
          content TEXT NOT NULL,
          summary TEXT,
          importance INTEGER DEFAULT 1 CHECK (importance BETWEEN 1 AND 10),
          memory_type VARCHAR(20) DEFAULT 'short_term' CHECK (memory_type IN ('short_term', 'long_term', 'canon', 'user_shared')),
          vector_id VARCHAR(255),
          meta_data JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("  ✓ memories");

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          scene VARCHAR(100) DEFAULT 'home',
          mode VARCHAR(30) DEFAULT 'observe',
          user_id UUID REFERENCES users(id),
          user_message TEXT,
          dialogue_json JSONB NOT NULL DEFAULT '[]',
          inner_os_json JSONB DEFAULT '{}',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("  ✓ events");

    await client.query(`
      CREATE TABLE IF NOT EXISTS achievements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id),
          type VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          card_image_prompt TEXT,
          unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("  ✓ achievements");

    await client.query(`
      CREATE TABLE IF NOT EXISTS bond_moments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          event_id UUID REFERENCES events(id),
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          scene_description TEXT,
          dialogue_snapshot JSONB,
          mood_tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("  ✓ bond_moments");

    await client.query(`
      CREATE TABLE IF NOT EXISTS relation_stats (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          sweetness INTEGER DEFAULT 50 CHECK (sweetness BETWEEN 0 AND 100),
          jealousy INTEGER DEFAULT 0 CHECK (jealousy BETWEEN 0 AND 100),
          assist_count INTEGER DEFAULT 0,
          total_interactions INTEGER DEFAULT 0,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("  ✓ relation_stats");

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id),
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("  ✓ sessions");

    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
