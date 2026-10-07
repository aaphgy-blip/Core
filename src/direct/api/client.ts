import { Address, Category, FeesInfo, Order, Product, Restaurant, User } from '../types.ts';

class DirectApiClient {
  private baseUrl = '/api';
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('direct_token') : null;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('direct_token', token);
      } else {
        localStorage.removeItem('direct_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json.error || `Error ${res.status}: ${res.statusText}`);
    }

    return json;
  }

  // --- Auth ---
  public async register(payload: { email: string; password: string; name: string; phone?: string; role?: string }): Promise<{ token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  public async login(payload: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<User> {
    const res = await this.request<{ success: boolean; user: User }>('/auth/me');
    return res.user;
  }

  public async updateProfile(payload: { name?: string; phone?: string; profile_image?: string | null; birthday?: string | null }): Promise<User> {
    const res = await this.request<{ success: boolean; user: User }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.user;
  }

  public logout() {
    this.setToken(null);
  }

  // --- Restaurants & Catalog ---
  public async getRestaurants(params?: { category?: string; query?: string }): Promise<Restaurant[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.query) query.append('query', params.query);
    const qs = query.toString() ? `?${query.toString()}` : '';

    const res = await this.request<{ success: boolean; data: Restaurant[] }>(`/restaurants${qs}`);
    return res.data;
  }

  public async getRestaurantById(id: string): Promise<Restaurant> {
    const res = await this.request<{ success: boolean; data: Restaurant }>(`/restaurants/${id}`);
    return res.data;
  }

  public async getCategories(): Promise<Category[]> {
    const res = await this.request<{ success: boolean; data: Category[] }>('/categories');
    return res.data;
  }

  public async getRestaurantProducts(restaurantId: string): Promise<Product[]> {
    const res = await this.request<{ success: boolean; data: Product[] }>(`/restaurants/${restaurantId}/products`);
    return res.data;
  }

  // --- Customer Addresses ---
  public async getAddresses(): Promise<Address[]> {
    const res = await this.request<{ success: boolean; data: Address[] }>('/customer/addresses');
    return res.data;
  }

  public async createAddress(address: Omit<Address, 'id' | 'user_id'>): Promise<Address> {
    const res = await this.request<{ success: boolean; data: Address }>('/customer/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
    return res.data;
  }

  public async deleteAddress(id: string): Promise<void> {
    await this.request(`/customer/addresses/${id}`, { method: 'DELETE' });
  }

  // --- Orders ---
  public async getFees(): Promise<FeesInfo> {
    const res = await this.request<{ success: boolean; data: FeesInfo }>('/checkout/fees');
    return res.data;
  }

  public async createOrder(orderPayload: any, idempotencyKey?: string): Promise<{ order: Order; isDuplicate: boolean }> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['x-idempotency-key'] = idempotencyKey;
    }

    const res = await this.request<{ success: boolean; data: Order; is_duplicate: boolean }>('/orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(orderPayload),
    });

    return { order: res.data, isDuplicate: res.is_duplicate };
  }

  public async getMyOrders(): Promise<Order[]> {
    const res = await this.request<{ success: boolean; data: Order[] }>('/orders');
    return res.data;
  }

  public async getOrderById(id: string): Promise<Order> {
    const res = await this.request<{ success: boolean; data: Order }>(`/orders/${id}`);
    return res.data;
  }

  // --- Restaurant Portal Operations ---
  public async getRestaurantOrders(restaurantId: string): Promise<Order[]> {
    const res = await this.request<{ success: boolean; data: Order[] }>(`/restaurant/orders?restaurant_id=${restaurantId}`);
    return res.data;
  }

  public async acceptOrder(id: string): Promise<Order> {
    const res = await this.request<{ success: boolean; data: Order }>(`/restaurant/orders/${id}/accept`, {
      method: 'POST',
    });
    return res.data;
  }

  public async rejectOrder(id: string, reason?: string): Promise<Order> {
    const res = await this.request<{ success: boolean; data: Order }>(`/restaurant/orders/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return res.data;
  }

  public async updateOrderStatus(id: string, status: string, notes?: string): Promise<Order> {
    const res = await this.request<{ success: boolean; data: Order }>(`/restaurant/orders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });
    return res.data;
  }
}

export const directApi = new DirectApiClient();
