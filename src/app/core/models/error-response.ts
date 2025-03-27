// src/app/core/models/error-response.ts
export interface ErrorResponse {
  timestamp: string; // Instant in Java becomes string in JSON
  status: number;
  error: string;
  message: string;
  path: string;
}
