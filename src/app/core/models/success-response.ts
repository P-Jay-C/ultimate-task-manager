// src/app/core/models/success-response.ts
export interface SuccessResponse<T = any> {
  timestamp: string; // Instant in Java becomes string in JSON
  status: number;
  message: string;
  data?: T; // Generic type for flexibility
}
