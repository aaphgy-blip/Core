import React, { createContext, useContext, useEffect, useState } from 'react';
import { directApi } from '../api/client.ts';
import { Address, CartItem, FeesInfo, Order, Product, Restaurant, User } from '../types.ts';

export type AppView = 'explore' | 'restaurant' | 'orders' | 'profile' | 'restaurant_portal';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string; role?: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;

  // Navigation
  activeView: AppView;
  setActiveView: (view: AppView) => void;

  // Restaurants & Catalog
  restaurants: Restaurant[];
  isLoadingRestaurants: boolean;
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (r: Restaurant | null) => void;
  openRestaurant: (id: string) => Promise<void>;
  restaurantProducts: Product[];
  isLoadingProducts: boolean;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;

  // Cart
  cart: CartItem[];
  cartRestaurant: Restaurant | null;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotalCents: number;

  // Addresses
  addresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (addr: Address | null) => void;
  loadAddresses: () => Promise<void>;
  createAddress: (addr: Omit<Address, 'id' | 'user_id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  isLoadingOrders: boolean;
  loadOrders: () => Promise<void>;
  fees: FeesInfo | null;

  // Modals & Drawers
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  // Notifications
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [activeView, setActiveView] = useState<AppView>('explore');

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantProducts, setRestaurantProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartRestaurant, setCartRestaurant] = useState<Restaurant | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [fees, setFees] = useState<FeesInfo | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial User Session Rehydration
  useEffect(() => {
    const token = directApi.getToken();
    if (token) {
      directApi
        .getMe()
        .then((u) => {
          setUser(u);
        })
        .catch(() => {
          directApi.logout();
          setUser(null);
        })
        .finally(() => {
          setIsLoadingUser(false);
        });
    } else {
      setIsLoadingUser(false);
    }
  }, []);

  // 2. Load Core Restaurants & Fees
  useEffect(() => {
    loadRestaurants();
    directApi.getFees().then(setFees).catch(() => {});
  }, []);

  // 3. Load Addresses & Orders on user change
  useEffect(() => {
    if (user) {
      loadAddresses();
      loadOrders();
    } else {
      setAddresses([]);
      setSelectedAddress(null);
      setOrders([]);
    }
  }, [user]);

  const loadRestaurants = async (params?: { category?: string; query?: string }) => {
    setIsLoadingRestaurants(true);
    try {
      const list = await directApi.getRestaurants(params);
      setRestaurants(list);
    } catch (err: any) {
      addToast('error', err.message || 'Error cargando restaurantes');
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  const openRestaurant = async (id: string) => {
    setIsLoadingProducts(true);
    try {
      const rest = await directApi.getRestaurantById(id);
      setSelectedRestaurant(rest);
      const prods = await directApi.getRestaurantProducts(id);
      setRestaurantProducts(prods);
      setActiveView('restaurant');
    } catch (err: any) {
      addToast('error', err.message || 'Error cargando menú');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const list = await directApi.getAddresses();
      setAddresses(list);
      const defaultAddr = list.find((a) => a.is_default) || list[0] || null;
      setSelectedAddress(defaultAddr);
    } catch {
      // non-fatal
    }
  };

  const createAddress = async (addr: Omit<Address, 'id' | 'user_id'>) => {
    try {
      const created = await directApi.createAddress(addr);
      setAddresses((prev) => [...prev, created]);
      if (created.is_default || !selectedAddress) {
        setSelectedAddress(created);
      }
      addToast('success', 'Dirección agregada');
    } catch (err: any) {
      addToast('error', err.message || 'Error al guardar dirección');
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await directApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAddress?.id === id) {
        setSelectedAddress(addresses.find((a) => a.id !== id) || null);
      }
      addToast('info', 'Dirección eliminada');
    } catch (err: any) {
      addToast('error', err.message || 'Error al eliminar dirección');
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const list = await directApi.getMyOrders();
      setOrders(list);
    } catch {
      // non-fatal
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await directApi.login({ email, password: pass });
      setUser(res.user);
      setIsAuthOpen(false);
      addToast('success', `¡Bienvenido, ${res.user.name}!`);
    } catch (err: any) {
      addToast('error', err.message || 'Credenciales inválidas');
      throw err;
    }
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string; role?: string }) => {
    try {
      const res = await directApi.register(payload);
      setUser(res.user);
      setIsAuthOpen(false);
      addToast('success', `¡Cuenta creada exitosamente, ${res.user.name}!`);
    } catch (err: any) {
      addToast('error', err.message || 'Error al registrarse');
      throw err;
    }
  };

  const logout = () => {
    directApi.logout();
    setUser(null);
    setActiveView('explore');
    addToast('info', 'Sesión cerrada');
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const u = await directApi.getMe();
      setUser(u);
    } catch {
      // non-fatal
    }
  };

  // Cart Operations
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    if (cartRestaurant && cartRestaurant.id !== item.product.restaurant_id) {
      // Prompt user to clear previous cart if switching restaurant
      const confirmed = window.confirm(
        `Tu carrito tiene productos de "${cartRestaurant.name}". ¿Deseas vaciarlo para agregar de "${selectedRestaurant?.name || 'este restaurante'}"?`
      );
      if (!confirmed) return;
      setCart([]);
    }

    if (selectedRestaurant) {
      setCartRestaurant(selectedRestaurant);
    }

    // Generate unique signature for item based on product id, variant options, and topping ids
    const variantSig = item.selectedVariants.map((v) => `${v.group_id}:${v.option_id}`).sort().join('|');
    const toppingSig = item.selectedToppings.map((t) => t.id).sort().join('|');
    const itemSig = `${item.product.id}_${variantSig}_${toppingSig}_${item.notes || ''}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === itemSig);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + item.quantity,
        };
        return next;
      }
      return [...prev, { ...item, id: itemSig }];
    });

    addToast('success', `Agregado: ${item.product.name} (x${item.quantity})`);
    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setCartRestaurant(null);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotalCents = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoadingUser,
        login,
        register,
        logout,
        refreshProfile,
        activeView,
        setActiveView,
        restaurants,
        isLoadingRestaurants,
        selectedRestaurant,
        setSelectedRestaurant,
        openRestaurant,
        restaurantProducts,
        isLoadingProducts,
        selectedProduct,
        setSelectedProduct,
        cart,
        cartRestaurant,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotalCents,
        addresses,
        selectedAddress,
        setSelectedAddress,
        loadAddresses,
        createAddress,
        deleteAddress,
        orders,
        isLoadingOrders,
        loadOrders,
        fees,
        isCartOpen,
        setIsCartOpen,
        isAuthOpen,
        setIsAuthOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe ser utilizado dentro de AppContextProvider');
  return context;
};
