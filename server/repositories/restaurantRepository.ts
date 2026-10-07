import { dbClient } from '../db/connection.ts';
import { Restaurant } from '../models/types.ts';

export class RestaurantRepository {
  private static col() {
    return dbClient.getRestaurantsCollection();
  }

  public static async findAll(filters?: { activeOnly?: boolean; category?: string; query?: string }): Promise<Restaurant[]> {
    const queryObj: any = {};

    if (filters?.activeOnly !== false) {
      queryObj.is_active = true;
    }

    if (filters?.category) {
      queryObj.category_tags = { $regex: new RegExp(`^${filters.category}$`, 'i') };
    }

    if (filters?.query) {
      const regex = new RegExp(filters.query, 'i');
      queryObj.$or = [{ name: regex }, { description: regex }];
    }

    const list = await this.col().find(queryObj).toArray();
    return list;
  }

  public static async findById(id: string): Promise<Restaurant | null> {
    const doc = await this.col().findOne({ id });
    return doc || null;
  }

  public static async findByOwnerId(ownerId: string): Promise<Restaurant | null> {
    const doc = await this.col().findOne({ owner_id: ownerId });
    return doc || null;
  }
}
