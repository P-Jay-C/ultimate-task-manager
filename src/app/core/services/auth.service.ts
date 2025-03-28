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
import { MessageService } from 'primeng/api';

interface TodoJwtPayload {
  sub: string; // Email
  jti: string; // Token ID
  iss: string; // Issuer
  username: string; // Added username
  roles: string[]; // Roles array (access token only)
  type?: string; // "refresh" for refresh token
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private authTokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService
  ) {
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
          this.messageService.add({ severity: 'success', summary: 'Registered', detail: 'Welcome aboard!' });
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
          this.messageService.add({ severity: 'success', summary: 'Logged In', detail: 'Welcome back!' });
        }
      }),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<SuccessResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http.post<SuccessResponse<AuthResponse>>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        if (response.data?.token) {
          this.handleAuthentication(response.data);
        }
      }),
      catchError((err) => {
        this.logout();
        return this.handleError(err);
      })
    );
  }

  private handleAuthentication(authResponse: AuthResponse) {
    localStorage.setItem(this.authTokenKey, authResponse.token);
    localStorage.setItem(this.refreshTokenKey, authResponse.refreshToken);
    this.currentUserSubject.next(authResponse);
    this.router.navigate(['/tasks']);
  }

  private loadUserFromToken(token: string) {
    try {
      const decoded: TodoJwtPayload = jwtDecode<TodoJwtPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        this.messageService.add({ severity: 'warn', summary: 'Session Expired', detail: 'Please log in again.' });
        this.logout();
        return;
      }
      const refreshToken = localStorage.getItem(this.refreshTokenKey) || '';
      const user: AuthResponse = {
        id: Number(decoded.jti) || 0,
        username: decoded.username || '',
        email: decoded.sub || '',
        token,
        refreshToken,
        roles: decoded.roles || ['USER'],
      };
      this.currentUserSubject.next(user);
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Invalid Token', detail: 'Logging out due to invalid token.' });
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
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded: TodoJwtPayload = jwtDecode<TodoJwtPayload>(token);
      return decoded.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
      return false;
    }
  }

  logout() {
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.currentUserSubject.next(null);
    this.messageService.add({ severity: 'info', summary: 'Logged Out', detail: 'Your session has ended.' });
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
    this.messageService.add({
      severity: 'error',
      summary: `${errorResponse.status} - ${errorResponse.error}`,
      detail: errorResponse.message,
    });
    console.error('Error Details:', errorResponse);
    return throwError(() => errorResponse);
  }
}
