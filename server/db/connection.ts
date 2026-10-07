import { MongoClient, Db, Collection } from 'mongodb';
import { config } from '../config/index.ts';
import { Address, AuditLog, Category, Order, Product, Restaurant, User } from '../models/types.ts';
import { getSeedData } from './seed.ts';

class DatabaseClient {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private memoryServer: any = null;
  private isConnecting = false;
  private connected = false;

  public async connect(): Promise<Db> {
    if (this.connected && this.db) {
      return this.db;
    }

    if (this.isConnecting) {
      // Wait for ongoing connection
      while (this.isConnecting) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (this.db) return this.db;
    }

    this.isConnecting = true;

    try {
      let uri = config.mongodbUri;

      if (!uri) {
        if (config.nodeEnv === 'production') {
          throw new Error(
            'Error fatal: MONGODB_URI no está configurado. Directaurante Core V2 requiere una conexión MongoDB activa en producción.'
          );
        }

        // Development / Test mode fallback using embedded real MongoDB engine
        console.log('[MongoDB] MONGODB_URI no detectado en variables. Inicializando servidor MongoDB local embebido...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        this.memoryServer = await MongoMemoryServer.create();
        uri = this.memoryServer.getUri();
        console.log(`[MongoDB] Servidor MongoDB local activo en: ${uri}`);
      }

      if (!uri) {
        throw new Error('Error al determinar la URI de conexión a MongoDB');
      }

      console.log(`[MongoDB] Conectando a MongoDB: ${uri.replace(/\/\/[^@]+@/, '//***:***@')}...`);
      this.client = new MongoClient(uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });

      await this.client.connect();
      this.db = this.client.db();
      this.connected = true;

      console.log(`[MongoDB] Conexión establecida con éxito a base de datos: "${this.db.databaseName}"`);

      // Ensure indexes
      await this.ensureIndexes();

      // Seed if empty in development
      await this.seedIfEmpty();

      return this.db;
    } catch (err: any) {
      console.error('[MongoDB] Error conectando a base de datos:', err.message);
      throw err;
    } finally {
      this.isConnecting = false;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    if (this.memoryServer) {
      await this.memoryServer.stop();
      this.memoryServer = null;
    }
    this.db = null;
    this.connected = false;
    console.log('[MongoDB] Conexión cerrada.');
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Base de datos no inicializada. Llama a connect() primero.');
    }
    return this.db;
  }

  private async ensureIndexes(): Promise<void> {
    if (!this.db) return;

    try {
      // 1. users: email UNIQUE
      await this.getUsersCollection().createIndex({ email: 1 }, { unique: true, name: 'idx_users_email_unique' });

      // 2. orders: idempotency_key UNIQUE per customer
      await this.getOrdersCollection().createIndex(
        { customer_id: 1, idempotency_key: 1 },
        { unique: true, name: 'idx_orders_customer_idempotency_unique' }
      );

      // 3. orders: query indexes
      await this.getOrdersCollection().createIndex({ customer_id: 1 }, { name: 'idx_orders_customer_id' });
      await this.getOrdersCollection().createIndex({ restaurant_id: 1 }, { name: 'idx_orders_restaurant_id' });
      await this.getOrdersCollection().createIndex({ status: 1 }, { name: 'idx_orders_status' });
      await this.getOrdersCollection().createIndex({ createdAt: 1 }, { name: 'idx_orders_created_at' });

      // 4. addresses: user_id index
      await this.getAddressesCollection().createIndex({ user_id: 1 }, { name: 'idx_addresses_user_id' });

      // 5. audit_logs: entity_id and timestamp indexes
      await this.getAuditLogsCollection().createIndex({ entity_id: 1 }, { name: 'idx_audit_logs_entity_id' });
      await this.getAuditLogsCollection().createIndex({ timestamp: 1 }, { name: 'idx_audit_logs_timestamp' });

      console.log('[MongoDB] Índices obligatorios verificados y creados exitosamente.');
    } catch (err: any) {
      console.warn('[MongoDB] Aviso al crear índices:', err.message);
    }
  }

  private async seedIfEmpty(): Promise<void> {
    if (!this.db) return;

    // Seed must NEVER run automatically in production unless explicitly enabled via ENABLE_SEED=true
    if (config.nodeEnv === 'production' && process.env.ENABLE_SEED !== 'true') {
      console.log('[MongoDB] Modo producción: siembra automática de semillas deshabilitada.');
      return;
    }

    if (!config.enableSeed) {
      console.log('[MongoDB] Siembra de semillas deshabilitada por configuración.');
      return;
    }

    try {
      const restCount = await this.getRestaurantsCollection().countDocuments();
      if (restCount === 0) {
        console.log('[MongoDB] Base de datos vacía detectada. Insertando catálogo inicial de semillas...');
        const seed = await getSeedData();

        if (seed.users.length > 0) {
          // Use id as string id or custom _id
          await this.getUsersCollection().insertMany(seed.users as any);
        }
        if (seed.categories.length > 0) {
          await this.getCategoriesCollection().insertMany(seed.categories as any);
        }
        if (seed.restaurants.length > 0) {
          await this.getRestaurantsCollection().insertMany(seed.restaurants as any);
        }
        if (seed.products.length > 0) {
          await this.getProductsCollection().insertMany(seed.products as any);
        }

        // Seed initial default address for Carlos
        const defaultAddress: Address = {
          id: 'addr_carlos_home',
          user_id: 'usr_carlos_01',
          label: 'Casa',
          street: 'Av. Morelos',
          number: '64',
          colony: 'Centro',
          city: 'Pénjamo',
          state: 'Guanajuato',
          postal_code: '36900',
          references: 'Frente al parque principal, portón negro',
          is_default: true,
          coordinates: {
            latitude: 20.4305,
            longitude: -101.7228,
          },
          createdAt: new Date().toISOString(),
        };
        await this.getAddressesCollection().insertOne(defaultAddress as any);

        console.log('[MongoDB] Catálogo inicial sembrado exitosamente.');
      }
    } catch (err: any) {
      console.error('[MongoDB] Error al sembrar datos iniciales:', err.message);
    }
  }

  // --- Collection Accessors ---
  public getUsersCollection(): Collection<User> {
    return this.getDb().collection<User>('users');
  }

  public getRestaurantsCollection(): Collection<Restaurant> {
    return this.getDb().collection<Restaurant>('restaurants');
  }

  public getCategoriesCollection(): Collection<Category> {
    return this.getDb().collection<Category>('categories');
  }

  public getProductsCollection(): Collection<Product> {
    return this.getDb().collection<Product>('products');
  }

  public getAddressesCollection(): Collection<Address> {
    return this.getDb().collection<Address>('addresses');
  }

  public getOrdersCollection(): Collection<Order> {
    return this.getDb().collection<Order>('orders');
  }

  public getAuditLogsCollection(): Collection<AuditLog> {
    return this.getDb().collection<AuditLog>('audit_logs');
  }
}

export const dbClient = new DatabaseClient();

// Auto-connect helper
export async function initDb(): Promise<Db> {
  return dbClient.connect();
}
