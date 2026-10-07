import { Category, Product, Restaurant, User } from '../models/types.ts';
import bcrypt from 'bcryptjs';

export async function getSeedData(): Promise<{
  users: User[];
  categories: Category[];
  restaurants: Restaurant[];
  products: Product[];
}> {
  const customerPassword = await bcrypt.hash('cliente123', 10);
  const restaurantPassword = await bcrypt.hash('tacos123', 10);

  const users: User[] = [
    {
      id: 'usr_carlos_01',
      email: 'carlos@directaurante.com',
      passwordHash: customerPassword,
      name: 'Carlos Pérez',
      role: 'customer',
      phone: '4621234567',
      profile_image: null,
      birthday: null,
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_rest_owner_01',
      email: 'donpepe@tacoselguero.com',
      passwordHash: restaurantPassword,
      name: 'Pepe Morales (Tacos El Güero)',
      role: 'restaurant',
      phone: '4629876543',
      profile_image: null,
      birthday: null,
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const categories: Category[] = [
    { id: 'cat_tacos', name: 'Tacos & Antojitos', slug: 'tacos', sort_order: 1 },
    { id: 'cat_burgers', name: 'Hamburguesas', slug: 'burgers', sort_order: 2 },
    { id: 'cat_pizza', name: 'Pizzas & Pastas', slug: 'pizzas', sort_order: 3 },
    { id: 'cat_sushi', name: 'Sushi & Oriental', slug: 'sushi', sort_order: 4 },
    { id: 'cat_bebidas', name: 'Bebidas & Postres', slug: 'bebidas', sort_order: 5 },
  ];

  const restaurants: Restaurant[] = [
    {
      id: 'rest_tacos_guero',
      owner_id: 'usr_rest_owner_01',
      name: 'Taquería El Güero',
      description: 'Auténticos tacos al pastor, suadero, bistec y gringas con salsas artesanales.',
      address: 'Av. Morelos #142, Col. Centro, Pénjamo, GTO',
      phone: '4621122334',
      logo_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200&h=200&fit=crop&q=80',
      banner_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1000&h=400&fit=crop&q=80',
      rating: 4.8,
      is_active: true,
      delivery_fee: 2500, // $25.00 MXN en centavos
      delivery_time_min: 25,
      delivery_time_max: 40,
      distance_km: 1.8,
      min_order: 8000, // $80.00 MXN en centavos
      category_tags: ['Tacos', 'Mexicana', 'Antojitos'],
      schedule: {
        monday: '17:00 - 00:00',
        tuesday: '17:00 - 00:00',
        wednesday: '17:00 - 00:00',
        thursday: '17:00 - 00:00',
        friday: '17:00 - 01:00',
        saturday: '17:00 - 01:00',
        sunday: '16:00 - 23:30',
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rest_burger_lab',
      name: 'The Burger Lab',
      description: 'Hamburguesas smash artesanales de carne 100% Angus y papas sazonadas.',
      address: 'Calle Hidalgo #58, Col. San Juan, Pénjamo, GTO',
      phone: '4623344556',
      logo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&q=80',
      banner_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000&h=400&fit=crop&q=80',
      rating: 4.9,
      is_active: true,
      delivery_fee: 3000, // $30.00 MXN
      delivery_time_min: 30,
      delivery_time_max: 45,
      distance_km: 2.4,
      min_order: 10000, // $100.00 MXN
      category_tags: ['Hamburguesas', 'Snacks', 'Americana'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rest_pizza_napoli',
      name: 'Pizzeria Di Napoli',
      description: 'Pizzas al horno de leña al estilo tradicional italiano.',
      address: 'Blvd. Degollado #210, Pénjamo, GTO',
      phone: '4627788990',
      logo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&q=80',
      banner_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000&h=400&fit=crop&q=80',
      rating: 4.7,
      is_active: true,
      delivery_fee: 2000, // $20.00 MXN
      delivery_time_min: 35,
      delivery_time_max: 50,
      distance_km: 3.1,
      min_order: 12000, // $120.00 MXN
      category_tags: ['Pizzas', 'Italiana'],
      createdAt: new Date().toISOString(),
    },
  ];

  const products: Product[] = [
    // Taquería El Güero
    {
      id: 'prod_tacos_pastor',
      restaurant_id: 'rest_tacos_guero',
      name: 'Orden de Tacos al Pastor (5 pzas)',
      description: 'Carne de cerdo marinada con receta secreta de la casa, piña asada, cebolla y cilantro.',
      price: 8500, // $85.00 MXN en centavos
      category: 'Tacos',
      image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop&q=80',
      is_available: true,
      variants: [
        {
          id: 'var_tortilla',
          name: 'Tipo de Tortilla',
          required: true,
          min_selections: 1,
          max_selections: 1,
          options: [
            { id: 'opt_maiz', name: 'Tortilla de Maíz', price_delta: 0 },
            { id: 'opt_harina', name: 'Tortilla de Harina', price_delta: 1500 }, // +$15.00
          ],
        },
      ],
      toppings: [
        { id: 'top_queso', name: 'Gratinado con Queso Asadero', price: 2500, is_available: true },
        { id: 'top_aguacate', name: 'Aguacate Fresco', price: 2000, is_available: true },
        { id: 'top_cebollitas', name: 'Cebollitas Cambray Asadas', price: 1500, is_available: true },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prod_gringa_pastor',
      restaurant_id: 'rest_tacos_guero',
      name: 'Gringa de Pastor con Queso',
      description: 'Doble tortilla de harina grande con queso fundido y abundante pastor con piña.',
      price: 6500, // $65.00 MXN
      category: 'Tacos',
      image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop&q=80',
      is_available: true,
      variants: [],
      toppings: [
        { id: 'top_extra_queso', name: 'Extra Queso Fundido', price: 2000, is_available: true },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prod_agua_horchata',
      restaurant_id: 'rest_tacos_guero',
      name: 'Agua de Horchata 1 Litro',
      description: 'Preparada al día con arroz, leche condensada y un toque de canela.',
      price: 3500, // $35.00 MXN
      category: 'Bebidas',
      image_url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&h=400&fit=crop&q=80',
      is_available: true,
      variants: [],
      toppings: [],
      createdAt: new Date().toISOString(),
    },

    // The Burger Lab
    {
      id: 'prod_classic_smash',
      restaurant_id: 'rest_burger_lab',
      name: 'Classic Smash Double Bacon',
      description: 'Doble carne angus smash (180g), queso cheddar americano, tocino crujiente y salsa lab.',
      price: 13500, // $135.00 MXN
      category: 'Hamburguesas',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop&q=80',
      is_available: true,
      variants: [
        {
          id: 'var_termino',
          name: 'Término de la Carne',
          required: false,
          min_selections: 0,
          max_selections: 1,
          options: [
            { id: 'opt_bien_cocido', name: 'Bien Cocida (Smash Crispy)', price_delta: 0 },
            { id: 'opt_jugoso', name: 'Término Medio Jugoso', price_delta: 0 },
          ],
        },
      ],
      toppings: [
        { id: 'top_papas_fritas', name: 'Agregar Papas a la Francesa', price: 3500, is_available: true },
        { id: 'top_extra_bacon', name: 'Doble Ración de Tocino', price: 3000, is_available: true },
        { id: 'top_jalapenos', name: 'Jalapeños Toreados', price: 1500, is_available: true },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prod_papas_truffle',
      restaurant_id: 'rest_burger_lab',
      name: 'Papas Trufadas con Parmesano',
      description: 'Papas corte delgado con aceite de trufa blanca, queso parmesano recién rallado y perejil.',
      price: 6500, // $65.00 MXN
      category: 'Snacks',
      image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop&q=80',
      is_available: true,
      variants: [],
      toppings: [],
      createdAt: new Date().toISOString(),
    },

    // Pizzeria Di Napoli
    {
      id: 'prod_pizza_margarita',
      restaurant_id: 'rest_pizza_napoli',
      name: 'Pizza Margherita DOC (Mediana)',
      description: 'Salsa de tomate San Marzano, mozzarella fior di latte, albahaca fresca y aceite de oliva extra virgen.',
      price: 16000, // $160.00 MXN
      category: 'Pizzas',
      image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop&q=80',
      is_available: true,
      variants: [
        {
          id: 'var_tamano',
          name: 'Tamaño de Pizza',
          required: true,
          min_selections: 1,
          max_selections: 1,
          options: [
            { id: 'opt_mediana', name: 'Mediana (8 rebanadas)', price_delta: 0 },
            { id: 'opt_grande', name: 'Grande (12 rebanadas)', price_delta: 7000 }, // +$70.00 MXN
          ],
        },
      ],
      toppings: [
        { id: 'top_prosciutto', name: 'Prosciutto di Parma', price: 4500, is_available: true },
        { id: 'top_champinones', name: 'Champiñones Salteados', price: 2500, is_available: true },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  return { users, categories, restaurants, products };
}
