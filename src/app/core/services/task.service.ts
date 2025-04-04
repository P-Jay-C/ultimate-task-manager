import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Task, PagedTaskResponse, TaskStatus } from '../models/task';
import { SuccessResponse } from '../models/success-response';
import { ErrorResponse } from '../models/error-response';
import { MessageService } from 'primeng/api';
import { BASE_URL } from '../../../config';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = BASE_URL + '/tasks';

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  getTaskById(id: number): Observable<SuccessResponse<Task>> {
    return this.http.get<SuccessResponse<Task>>(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Task Retrieved',
          detail: response.message,
        });
      }),
      catchError(this.handleError)
    );
  }

  createTask(task: Task): Observable<SuccessResponse<Task>> {
    this.validateTask(task);
    return this.http.post<SuccessResponse<Task>>(this.apiUrl, task).pipe(
      tap((response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Task Created',
          detail: response.message,
        });
      }),
      catchError(this.handleError)
    );
  }

  updateTask(id: number, task: Task): Observable<SuccessResponse<Task>> {
    this.validateTask(task);
    return this.http.put<SuccessResponse<Task>>(`${this.apiUrl}/${id}`, task).pipe(
      tap((response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Task Updated',
          detail: response.message,
        });
      }),
      catchError(this.handleError)
    );
  }

  getTasksByStatus(
    status: TaskStatus,
    page: number = 0,
    size: number = 10
  ): Observable<SuccessResponse<PagedTaskResponse>> {
    let params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<SuccessResponse<PagedTaskResponse>>(`${this.apiUrl}/status`, { params }).pipe(  // Changed from "/by-status" to "/status"
      tap((response) => {
        // this.messageService.add({
        //   severity: 'success',
        //   summary: 'Tasks Retrieved by Status',
        //   detail: response.message,
        // });
      }),
      catchError(this.handleError)
    );
  }

  getTasks(
    page: number = 0,
    size: number = 10,
    category?: string,
    completed?: boolean,
    search?: string,
    sortBy: string = 'dueDate',
    sortDir: 'asc' | 'desc' = 'asc'
  ): Observable<SuccessResponse<PagedTaskResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (category) params = params.set('category', category);
    if (completed !== undefined) params = params.set('completed', completed.toString());
    if (search) params = params.set('search', search);

    return this.http.get<SuccessResponse<PagedTaskResponse>>(this.apiUrl, { params }).pipe(
      tap((response) => {
        // this.messageService.add({
        //   severity: 'success',
        //   summary: 'Tasks Retrieved',
        //   detail: response.message,
        // });
      }),
      catchError(this.handleError)
    );
  }

  deleteTask(id: number): Observable<SuccessResponse<null>> {
    return this.http.delete<SuccessResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Task Deleted',
          detail: response.message,
        });
      }),
      catchError(this.handleError)
    );
  }

  private validateTask(task: Task): void {
    if (task.progress < 0 || task.progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorResponse: ErrorResponse = error.error instanceof Object ? error.error : {
      timestamp: new Date().toISOString(),
      status: error.status || 0,
      error: error.error || 'Unknown Error',
      message: error.message || 'An unexpected error occurred',
      path: error.url || window.location.pathname,
    };
    // this.messageService.add({
    //   severity: 'error',
    //   summary: `${errorResponse.status} - ${errorResponse.error}`,
    //   detail: errorResponse.message,
    // });
    return throwError(() => errorResponse);
  }
}
