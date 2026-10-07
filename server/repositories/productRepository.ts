import { dbClient } from '../db/connection.ts';
import { Product } from '../models/types.ts';

export class ProductRepository {
  private static col() {
    return dbClient.getProductsCollection();
  }

  public static async findByRestaurantId(restaurantId: string, availableOnly = false): Promise<Product[]> {
    const filter: any = { restaurant_id: restaurantId };
    if (availableOnly) {
      filter.is_available = true;
    }
    return this.col().find(filter).toArray();
  }

  public static async findById(id: string): Promise<Product | null> {
    const doc = await this.col().findOne({ id });
    return doc || null;
  }
}
