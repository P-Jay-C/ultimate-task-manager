import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(authReq).pipe(
    catchError((error: any) => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            const newToken = response?.data?.token;
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
          }),
          catchError((refreshError) => {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
