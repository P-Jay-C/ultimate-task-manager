import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RegistrationRequest } from '../models/registration-request';
import { LoginRequest } from '../models/login-request';
import { SuccessResponse } from '../models/success-response';
import { AuthResponse } from '../models/auth-response';
import { ErrorResponse } from '../models/error-response';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

// Define token payload structure with email
interface TodoJwtPayload {
  sub: string; // Username
  jti: string; // Token ID
  iss: string; // Issuer (UltimateToDo)
  roles: string[]; // Roles array
  email: string; // Email
  iat: number; // Issued at
  exp: number; // Expiration
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private authTokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem(this.authTokenKey);
    if (token) {
      this.loadUserFromToken(token);
    }
  }

  register(request: RegistrationRequest): Observable<SuccessResponse<AuthResponse>> {
    return this.http.post<SuccessResponse<AuthResponse>>(`${this.apiUrl}/register`, request).pipe(
      tap((response) => {
        if (response.data?.token) {
          this.handleAuthentication(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  login(request: LoginRequest): Observable<SuccessResponse<AuthResponse>> {
    return this.http.post<SuccessResponse<AuthResponse>>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        if (response.data?.token) {
          this.handleAuthentication(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleAuthentication(authResponse: AuthResponse) {
    localStorage.setItem(this.authTokenKey, authResponse.token);
    this.currentUserSubject.next(authResponse);
    this.router.navigate(['/tasks']);
  }

  private loadUserFromToken(token: string) {
    try {
      const decoded: TodoJwtPayload = jwtDecode<TodoJwtPayload>(token);
      const user: AuthResponse = {
        id: Number(decoded.jti) || 0, // Use jti as ID
        username: decoded.sub,
        email: decoded.email || '', // Extract email from token
        token,
        roles: decoded.roles || ['USER'],
      };
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Invalid token', error);
      this.logout();
    }
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.authTokenKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorResponse: ErrorResponse = error.error || {
      timestamp: new Date().toISOString(),
      status: error.status,
      error: error.statusText || 'Unknown Error',
      message: 'An unexpected error occurred',
      path: error.url || window.location.pathname,
    };

    console.error('Error Details:', errorResponse);
    return throwError(() => errorResponse);
  }
}
