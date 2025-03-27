// src/app/core/models/registration-request.ts
export interface RegistrationRequest {
  username: string;
  email: string;
  password: string;
  role?: string; // Optional, matches backend
}
