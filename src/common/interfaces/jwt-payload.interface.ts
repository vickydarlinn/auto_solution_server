export interface JwtPayload {
  sub: string; // User ID
  iat?: number; // Issued At
  exp?: number; // Expiry (timestamp)
  [key: string]: any; // Optional catch-all if you need flexibility
}
