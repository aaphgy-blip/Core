import { AuthService } from '../services/authService.ts';
import { RestaurantService, CatalogService } from '../services/restaurantService.ts';
import { OrderService } from '../services/orderService.ts';
import { AuditService } from '../services/auditService.ts';
import { dbClient, initDb } from '../db/connection.ts';
import { validateRegister } from '../schemas/validation.ts';

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  error?: string;
}

export async function runCoreTests(): Promise<{ passed: number; failed: number; results: TestResult[] }> {
  const results: TestResult[] = [];
  await initDb();

  async function test(num: number, name: string, fn: () => Promise<void>) {
    try {
      await fn();
      results.push({ num, name, passed: true });
      console.log(`  ✓ ${num}. ${name}`);
    } catch (err: any) {
      results.push({ num, name, passed: false, error: err.message });
      console.error(`  ✗ ${num}. ${name}: ${err.message}`);
    }
  }

  console.log('\n======================================================');
  console.log('   DIRECTAURANTE CORE V2 — TEST SUITE CONSOLIDADA');
  console.log('======================================================\n');

  // Variables shared across tests
  let customerAToken = '';
  let customerAId = '';
  let customerBToken = '';
  let customerBId = '';
  let restaurantOwnerToken = '';
  let restaurantOwnerId = '';
  let restaurantBId = 'rest_burger_lab';
  let restaurantBOwnerId = '';
  let sampleRestaurantId = 'rest_tacos_guero';
  let sampleProductId = '';
  let sampleOrderId = '';
  const normalIdempotencyKey = `idemp_norm_${Date.now()}`;
  const concurrentIdempotencyKey = `idemp_conc_${Date.now()}`;

  // 1. Registro customer
  await test(1, 'registro customer', async () => {
    const email = `carlos_test_${Date.now()}@directaurante.com`;
    const res = await AuthService.register({
      name: 'Carlos Cliente',
      email,
      password: 'passwordSeguro123',
      phone: '4621112233',
      role: 'customer',
    });
    if (!res.token || !res.user.id) throw new Error('Falta token o id');
    if (res.user.role !== 'customer') throw new Error('El rol asignado no es customer');
    customerAToken = res.token;
    customerAId = res.user.id;

    // Register second customer for isolation/ownership testing
    const emailB = `maria_test_${Date.now()}@directaurante.com`;
    const resB = await AuthService.register({
      name: 'María Cliente B',
      email: emailB,
      password: 'passwordSeguro456',
      phone: '4629998877',
      role: 'customer',
    });
    customerBToken = resB.token;
    customerBId = resB.user.id;
  });

  // 2. Login
  await test(2, 'login', async () => {
    const login = await AuthService.login({
      email: 'carlos@directaurante.com',
      password: 'cliente123',
    });
    if (!login.token || login.user.email !== 'carlos@directaurante.com') {
      throw new Error('Credenciales válidas no retornaron sesión');
    }
    // Also login restaurant owner
    const restLogin = await AuthService.login({
      email: 'donpepe@tacoselguero.com',
      password: 'tacos123',
    });
    restaurantOwnerToken = restLogin.token;
    restaurantOwnerId = restLogin.user.id;

    // Create a restaurant owner for restaurant B to test cross-restaurant protection
    const ownerB = await AuthService.createPrivilegedUser({
      name: 'Dueño Burger Lab',
      email: `owner_lab_${Date.now()}@burgerlab.com`,
      password: 'burgerLab123',
      phone: '4623344556',
      role: 'restaurant',
    });
    restaurantBOwnerId = ownerB.user.id;
    // Link owner B to restaurant B in DB
    await dbClient.getRestaurantsCollection().updateOne({ id: restaurantBId }, { $set: { owner_id: restaurantBOwnerId } });
  });

  // 3. JWT válido
  await test(3, 'JWT válido', async () => {
    const decoded = AuthService.verifyToken(customerAToken);
    if (decoded.id !== customerAId || decoded.role !== 'customer') {
      throw new Error('Payload del JWT no coincide');
    }
  });

  // 4. JWT inválido
  await test(4, 'JWT inválido', async () => {
    let threw = false;
    try {
      AuthService.verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature');
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('El JWT falso debió ser rechazado');
  });

  // 5. MongoDB persistence
  await test(5, 'MongoDB persistence', async () => {
    const userDoc = await dbClient.getUsersCollection().findOne({ id: customerAId });
    if (!userDoc) throw new Error('El usuario no existe físicamente en MongoDB');
    if (!userDoc.passwordHash.startsWith('$2')) throw new Error('El password hash en MongoDB no es bcrypt');
  });

  // 6. Restaurante
  await test(6, 'restaurante', async () => {
    const list = await RestaurantService.listRestaurants();
    if (!list || list.length === 0) throw new Error('No se encontraron restaurantes');
    const detail = await RestaurantService.getRestaurantById(sampleRestaurantId);
    if (!detail || detail.name !== 'Taquería El Güero') throw new Error('Detalle de restaurante erróneo');
  });

  // 7. Catálogo
  await test(7, 'catálogo', async () => {
    const categories = await CatalogService.getCategories();
    if (!categories || categories.length === 0) throw new Error('Categorías no encontradas');
    const products = await CatalogService.getProductsByRestaurant(sampleRestaurantId);
    if (!products || products.length === 0) throw new Error('Productos del restaurante vacíos');
    sampleProductId = products[0].id; // prod_tacos_pastor
  });

  // 8. Variantes
  await test(8, 'variantes', async () => {
    const prod = await CatalogService.getProductById(sampleProductId);
    if (!prod || !prod.variants || prod.variants.length === 0) throw new Error('Producto sin variantes');
    const group = prod.variants[0];
    if (!group.options || group.options.length === 0) throw new Error('Grupo de variantes sin opciones');
  });

  // 9. Toppings
  await test(9, 'toppings', async () => {
    const prod = await CatalogService.getProductById(sampleProductId);
    if (!prod || !prod.toppings || prod.toppings.length === 0) throw new Error('Producto sin toppings');
  });

  // 10. Cálculo soberano
  await test(10, 'cálculo soberano', async () => {
    const prod = await CatalogService.getProductById(sampleProductId);
    if (!prod) throw new Error('Producto no encontrado');

    const res = await OrderService.createOrder(customerAId, {
      restaurant_id: sampleRestaurantId,
      order_type: 'delivery',
      delivery_address: 'Av. Morelos #100, Centro',
      items: [
        {
          product_id: sampleProductId,
          quantity: 2,
          variants: [{ group_id: 'var_tortilla', option_id: 'opt_harina' }], // +1500 c/u
          toppings: ['top_queso'], // +2500 c/u
        },
      ],
      payment_method: 'cash',
      tip_amount: 2000,
    });

    const expectedLineUnitPrice = prod.price + 1500 + 2500;
    const expectedSubtotal = expectedLineUnitPrice * 2;
    const expectedDelivery = 2500;
    const expectedService = 500;
    const expectedTip = 2000;
    const expectedTotal = expectedSubtotal + expectedDelivery + expectedService + expectedTip;

    if (res.order.subtotal !== expectedSubtotal) {
      throw new Error(`Subtotal incorrecto. Esperado ${expectedSubtotal}, obtenido ${res.order.subtotal}`);
    }
    if (res.order.total !== expectedTotal) {
      throw new Error(`Total incorrecto. Esperado ${expectedTotal}, obtenido ${res.order.total}`);
    }
  });

  // 11. Pickup sin delivery fee
  await test(11, 'pickup sin delivery fee', async () => {
    const res = await OrderService.createOrder(customerAId, {
      restaurant_id: sampleRestaurantId,
      order_type: 'pickup',
      items: [
        {
          product_id: sampleProductId,
          quantity: 1,
          variants: [{ group_id: 'var_tortilla', option_id: 'opt_maiz' }],
        },
      ],
      payment_method: 'cash',
    });

    if (res.order.delivery_fee !== 0) {
      throw new Error(`En pickup delivery_fee debe ser 0. Obtenido: ${res.order.delivery_fee}`);
    }
  });

  // 12. Pedido válido
  await test(12, 'pedido válido', async () => {
    const res = await OrderService.createOrder(customerAId, {
      restaurant_id: sampleRestaurantId,
      order_type: 'delivery',
      delivery_address: 'Calle Hidalgo #45, Pénjamo',
      items: [
        {
          product_id: sampleProductId,
          quantity: 1,
          variants: [{ group_id: 'var_tortilla', option_id: 'opt_maiz' }],
        },
      ],
      payment_method: 'cash',
      idempotency_key: normalIdempotencyKey,
    });

    if (!res.order.id || res.order.status !== 'pending') {
      throw new Error('El pedido válido no se creó en estado pending');
    }
    sampleOrderId = res.order.id;
  });

  // 13. Producto inexistente rechazado
  await test(13, 'producto inexistente rechazado', async () => {
    let threw = false;
    try {
      await OrderService.createOrder(customerAId, {
        restaurant_id: sampleRestaurantId,
        order_type: 'pickup',
        items: [{ product_id: 'prod_inexistente_9999', quantity: 1 }],
        payment_method: 'cash',
      });
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('El pedido con producto inexistente debió ser rechazado');
  });

  // 14. Variante inválida rechazada
  await test(14, 'variante inválida rechazada', async () => {
    let threw = false;
    try {
      await OrderService.createOrder(customerAId, {
        restaurant_id: sampleRestaurantId,
        order_type: 'pickup',
        items: [
          {
            product_id: sampleProductId,
            quantity: 1,
            variants: [{ group_id: 'var_tortilla', option_id: 'opt_opcion_falsa_999' }],
          },
        ],
        payment_method: 'cash',
      });
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('La variante inválida debió ser rechazada');
  });

  // 15. Topping inválido rechazado
  await test(15, 'topping inválido rechazado', async () => {
    let threw = false;
    try {
      await OrderService.createOrder(customerAId, {
        restaurant_id: sampleRestaurantId,
        order_type: 'pickup',
        items: [
          {
            product_id: sampleProductId,
            quantity: 1,
            variants: [{ group_id: 'var_tortilla', option_id: 'opt_maiz' }],
            toppings: ['top_inexistente_999'],
          },
        ],
        payment_method: 'cash',
      });
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('El topping inválido debió ser rechazado');
  });

  // 16. Idempotencia normal
  await test(16, 'idempotencia normal', async () => {
    const res = await OrderService.createOrder(customerAId, {
      restaurant_id: sampleRestaurantId,
      order_type: 'delivery',
      delivery_address: 'Calle Hidalgo #45, Pénjamo',
      items: [
        {
          product_id: sampleProductId,
          quantity: 1,
          variants: [{ group_id: 'var_tortilla', option_id: 'opt_maiz' }],
        },
      ],
      payment_method: 'cash',
      idempotency_key: normalIdempotencyKey,
    });

    if (!res.isDuplicate) throw new Error('La clave idempotente debió marcar isDuplicate: true');
    if (res.order.id !== sampleOrderId) throw new Error('No devolvió la misma orden original');
  });

  // 17. Idempotencia concurrente (con Promise.all simulando solicitudes simultáneas)
  await test(17, 'idempotencia concurrente', async () => {
    const payload = {
      restaurant_id: sampleRestaurantId,
      order_type: 'pickup' as const,
      items: [
        {
          product_id: sampleProductId,
          quantity: 1,
          variants: [{ group_id: 'var_tortilla', option_id: 'opt_maiz' }],
        },
      ],
      payment_method: 'cash' as const,
      idempotency_key: concurrentIdempotencyKey,
    };

    // Simulate 2 parallel network requests hitting the Core at the same millisecond
    const [res1, res2] = await Promise.all([
      OrderService.createOrder(customerAId, payload),
      OrderService.createOrder(customerAId, payload),
    ]);

    if (res1.order.id !== res2.order.id) {
      throw new Error(`Colisión en concurrencia: se crearon IDs distintos (${res1.order.id} vs ${res2.order.id})`);
    }

    // Verify exactly ONE document exists in MongoDB with this idempotency key
    const countInMongo = await dbClient
      .getOrdersCollection()
      .countDocuments({ customer_id: customerAId, idempotency_key: concurrentIdempotencyKey });

    if (countInMongo !== 1) {
      throw new Error(`Se duplicó el documento en MongoDB. Documentos encontrados: ${countInMongo}`);
    }
  });

  // 18. Customer no puede ver pedido ajeno
  await test(18, 'customer no puede ver pedido ajeno', async () => {
    let threw = false;
    try {
      await OrderService.getOrderById(sampleOrderId, { id: customerBId, role: 'customer' });
    } catch (err: any) {
      threw = true;
    }
    if (!threw) throw new Error('El cliente B no debió poder consultar el pedido del cliente A');
  });

  // 19. Restaurant no puede operar pedido de otro restaurante
  await test(19, 'restaurant no puede operar pedido de otro restaurante', async () => {
    let threw = false;
    try {
      // Owner of restaurant B attempts to accept order belonging to restaurant A
      await OrderService.updateOrderStatus(sampleOrderId, 'confirmed', {
        id: restaurantBOwnerId,
        role: 'restaurant',
      });
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('El dueño del restaurante B no debió poder operar el pedido del restaurante A');
  });

  // 20. Driver no puede operar pedido no asignado
  await test(20, 'driver no puede operar pedido no asignado', async () => {
    let threw = false;
    try {
      // Arbitrary driver attempts to deliver order
      await OrderService.updateOrderStatus(sampleOrderId, 'delivering', {
        id: 'usr_driver_intruso_99',
        role: 'driver',
      });
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('El conductor no asignado debió ser rechazado');
  });

  // 21. Transición válida
  await test(21, 'transición válida', async () => {
    // Restaurant A confirms
    const conf = await OrderService.updateOrderStatus(sampleOrderId, 'confirmed', {
      id: restaurantOwnerId,
      role: 'restaurant',
    });
    if (conf.status !== 'confirmed') throw new Error('Fallo al pasar a confirmed');

    // Restaurant A prepares
    const prep = await OrderService.updateOrderStatus(sampleOrderId, 'preparing', {
      id: restaurantOwnerId,
      role: 'restaurant',
    });
    if (prep.status !== 'preparing') throw new Error('Fallo al pasar a preparing');

    // Restaurant A readies
    const ready = await OrderService.updateOrderStatus(sampleOrderId, 'ready', {
      id: restaurantOwnerId,
      role: 'restaurant',
    });
    if (ready.status !== 'ready') throw new Error('Fallo al pasar a ready');
  });

  // 22. Transición inválida
  await test(22, 'transición inválida', async () => {
    let threw = false;
    try {
      // Cannot jump from ready to delivered directly without delivery stage
      await OrderService.updateOrderStatus(sampleOrderId, 'delivered', {
        id: restaurantOwnerId,
        role: 'restaurant',
      });
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('El salto de estado inválido debió ser rechazado');
  });

  // 23. Rol privilegiado no puede obtenerse mediante registro
  await test(23, 'rol privilegiado no puede obtenerse mediante registro', async () => {
    // Attempt privilege escalation in payload
    const val = validateRegister({
      name: 'Hacker',
      email: 'hacker@directaurante.com',
      password: 'password123',
      role: 'master', // Attempting master role
    });

    if (val.valid) {
      throw new Error('El schema de registro público debió rechazar el intento de registrar rol master');
    }
  });

  // 24. Auditoría persistida
  await test(24, 'auditoría persistida', async () => {
    const logs = await AuditService.getLogsForEntity(sampleOrderId);
    if (!logs || logs.length === 0) {
      throw new Error('No se encontraron registros de auditoría en MongoDB para la orden');
    }

    const events = logs.map((l) => l.event);
    if (!events.includes('order.created')) {
      throw new Error('Falta evento order.created en auditoría');
    }
    if (!events.includes('order.confirmed')) {
      throw new Error('Falta evento order.confirmed en auditoría');
    }
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n======================================================');
  console.log(`   RESULTADO FINAL: ${passed} PASADAS / ${failed} FALLADAS (${results.length} PRUEBAS)`);
  console.log('======================================================\n');

  return { passed, failed, results };
}

// Standalone execution
if (import.meta.url.endsWith(process.argv[1] || '')) {
  runCoreTests()
    .then(async ({ failed }) => {
      await dbClient.disconnect();
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch(async (err) => {
      console.error(err);
      await dbClient.disconnect();
      process.exit(1);
    });
}
