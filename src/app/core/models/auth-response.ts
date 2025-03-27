// src/app/core/models/auth-response.ts
export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  token: string;
  roles: string[];
}
