export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  apiPort: parseInt(process.env.CORE_PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'directaurante-core-v2-super-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mongodbUri: process.env.MONGODB_URI,
  isTestMode: process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true',
  defaultCurrency: 'MXN',
  serviceFeeCents: 500, // $5.00 MXN
  defaultDeliveryFeeCents: 2500, // $25.00 MXN
};
