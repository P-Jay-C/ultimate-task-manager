import { HttpInterceptorFn } from '@angular/common/http';
import { ErrorResponse } from '../models/error-response';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: any) => {
      const errorResponse: ErrorResponse = error.error || {
        timestamp: new Date().toISOString(),
        status: error.status || 0,
        error: error.statusText || 'Unknown Error',
        message: 'An unexpected error occurred',
        path: error.url || window.location.pathname,
      };

      console.error('Error Details:', errorResponse);
      return throwError(() => errorResponse);
    })
  );
};
