import { createHash, randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import type { BenefitRecord, ChangeLogEntry } from "@mcp-gen-ui-gateway/schema";

export class SnapshotStore {
  private readonly db: Database.Database;

  constructor(path = "mcp-gen-ui-gateway.db") {
    this.db = new Database(path);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      create table if not exists snapshots (
        entity_id text primary key,
        entity_type text not null,
        content_hash text not null,
        payload text not null,
        updated_at text not null
      );

      create table if not exists change_log (
        id text primary key,
        entity_id text not null,
        entity_type text not null,
        change_type text not null,
        summary text not null,
        created_at text not null
      );
    `);
  }

  recordBenefitSnapshot(benefit: BenefitRecord): ChangeLogEntry {
    const payload = JSON.stringify(benefit);
    const contentHash = hash(payload);
    const now = new Date().toISOString();
    const existing = this.db
      .prepare("select content_hash from snapshots where entity_id = ?")
      .get(benefit.id) as { content_hash: string } | undefined;
    const changeType = existing ? (existing.content_hash === contentHash ? "unchanged" : "updated") : "created";

    this.db
      .prepare(`
        insert into snapshots (entity_id, entity_type, content_hash, payload, updated_at)
        values (?, 'benefit', ?, ?, ?)
        on conflict(entity_id) do update set
          content_hash = excluded.content_hash,
          payload = excluded.payload,
          updated_at = excluded.updated_at
      `)
      .run(benefit.id, contentHash, payload, now);

    const entry: ChangeLogEntry = {
      id: randomUUID(),
      entityId: benefit.id,
      entityType: "benefit",
      changeType,
      summary: `${benefit.title} ${changeType}.`,
      createdAt: now
    };

    this.db
      .prepare(`
        insert into change_log (id, entity_id, entity_type, change_type, summary, created_at)
        values (?, ?, 'benefit', ?, ?, ?)
      `)
      .run(entry.id, entry.entityId, entry.changeType, entry.summary, entry.createdAt);

    return entry;
  }

  getChangeLog(entityId?: string): ChangeLogEntry[] {
    const rows = entityId
      ? this.db.prepare("select * from change_log where entity_id = ? order by created_at desc").all(entityId)
      : this.db.prepare("select * from change_log order by created_at desc").all();

    return rows.map((row) => {
      const record = row as Record<string, string>;
      return {
        id: record.id,
        entityId: record.entity_id,
        entityType: "benefit",
        changeType: record.change_type as ChangeLogEntry["changeType"],
        summary: record.summary,
        createdAt: record.created_at
      };
    });
  }

  close(): void {
    this.db.close();
  }
}

function hash(payload: string): string {
  return createHash("sha256").update(payload).digest("hex");
}
