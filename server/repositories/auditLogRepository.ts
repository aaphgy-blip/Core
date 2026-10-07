import { dbClient } from '../db/connection.ts';
import { AuditLog } from '../models/types.ts';

export class AuditLogRepository {
  private static col() {
    return dbClient.getAuditLogsCollection();
  }

  public static async create(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const entry: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    await this.col().insertOne(entry as any);
    return entry;
  }

  public static async findByEntityId(entityId: string): Promise<AuditLog[]> {
    return this.col().find({ entity_id: entityId }).sort({ timestamp: -1 }).toArray();
  }

  public static async findRecent(limit = 100): Promise<AuditLog[]> {
    return this.col().find({}).sort({ timestamp: -1 }).limit(limit).toArray();
  }
}
