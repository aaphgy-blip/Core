import { RestaurantRepository } from '../repositories/restaurantRepository.ts';
import { CategoryRepository } from '../repositories/categoryRepository.ts';
import { ProductRepository } from '../repositories/productRepository.ts';
import { Category, Product, Restaurant } from '../models/types.ts';

export class RestaurantService {
  public static async listRestaurants(filters?: { category?: string; query?: string }): Promise<Restaurant[]> {
    return RestaurantRepository.findAll({ activeOnly: true, category: filters?.category, query: filters?.query });
  }

  public static async getRestaurantById(id: string): Promise<Restaurant | null> {
    return RestaurantRepository.findById(id);
  }

  public static async getRestaurantByOwnerId(ownerId: string): Promise<Restaurant | null> {
    return RestaurantRepository.findByOwnerId(ownerId);
  }
}

export class CatalogService {
  public static async getCategories(): Promise<Category[]> {
    return CategoryRepository.findAll();
  }

  public static async getProductsByRestaurant(restaurantId: string): Promise<Product[]> {
    const restaurant = await RestaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new Error(`Restaurante '${restaurantId}' no encontrado`);
    }
    return ProductRepository.findByRestaurantId(restaurantId, true);
  }

  public static async getProductById(id: string): Promise<Product | null> {
    return ProductRepository.findById(id);
  }
}
