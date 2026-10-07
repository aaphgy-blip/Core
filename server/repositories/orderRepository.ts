import { dbClient } from '../db/connection.ts';
import { Order } from '../models/types.ts';

export class OrderRepository {
  private static col() {
    return dbClient.getOrdersCollection();
  }

  public static async findById(id: string): Promise<Order | null> {
    const doc = await this.col().findOne({ id });
    return doc || null;
  }

  public static async findByIdempotencyKey(customerId: string, idempotencyKey: string): Promise<Order | null> {
    const doc = await this.col().findOne({ customer_id: customerId, idempotency_key: idempotencyKey });
    return doc || null;
  }

  /**
   * Inserts an order with atomic uniqueness constraint.
   * If a concurrent duplicate idempotency_key arrives at the same instant,
   * MongoDB throws error code 11000 (duplicate key), which is caught and handled.
   */
  public static async insertOrderAtomic(order: Order): Promise<{ order: Order; isDuplicate: boolean }> {
    try {
      await this.col().insertOne(order as any);
      return { order, isDuplicate: false };
    } catch (err: any) {
      // MongoDB duplicate key error code 11000
      if (err.code === 11000 || err.message?.includes('E11000') || err.message?.includes('duplicate key')) {
        const existing = await this.findByIdempotencyKey(order.customer_id, order.idempotency_key);
        if (existing) {
          return { order: existing, isDuplicate: true };
        }
      }
      throw err;
    }
  }

  public static async update(id: string, updates: Partial<Order>): Promise<Order | null> {
    const updated = await this.col().findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return updated || null;
  }

  public static async findByCustomerId(customerId: string): Promise<Order[]> {
    return this.col().find({ customer_id: customerId }).sort({ createdAt: -1 }).toArray();
  }

  public static async findByRestaurantId(restaurantId: string): Promise<Order[]> {
    return this.col().find({ restaurant_id: restaurantId }).sort({ createdAt: -1 }).toArray();
  }

  public static async findByDriverId(driverId: string): Promise<Order[]> {
    return this.col().find({ driver_id: driverId }).sort({ createdAt: -1 }).toArray();
  }
}
