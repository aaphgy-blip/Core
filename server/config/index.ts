export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Error de seguridad crítico: JWT_SECRET es obligatorio en producción. Directaurante Core V2 no puede iniciar sin una clave JWT explícita.'
      );
    }
    return 'directaurante-core-v2-dev-secret-key';
  }
  return secret.trim();
}

export const config = {
  // Use port 3000 in AI Studio / container or standard PORT when outside NGINX
  port: parseInt(
    process.env.APP_PORT ||
    process.env.DEFAULT_APP_PORT ||
    (process.env.PORT && !process.env.NGINX_PORT ? process.env.PORT : '3000'),
    10
  ),
  apiPort: parseInt(process.env.CORE_PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  get jwtSecret() {
    return getJwtSecret();
  },
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mongodbUri: process.env.MONGODB_URI,
  isTestMode: process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true',
  corsOrigin: process.env.CORS_ORIGIN || '',
  enableSeed: process.env.ENABLE_SEED === 'true' || (process.env.NODE_ENV !== 'production' && process.env.ENABLE_SEED !== 'false'),
  defaultCurrency: 'MXN',
  serviceFeeCents: 500, // $5.00 MXN
  defaultDeliveryFeeCents: 2500, // $25.00 MXN
};
