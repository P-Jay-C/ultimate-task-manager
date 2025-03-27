import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/login-request';
import { ErrorResponse } from '../../core/models/error-response';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, ToastModule,RouterLink],
  providers: [MessageService],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginRequest: LoginRequest = { username: '', password: '' };

  constructor(private authService: AuthService, private messageService: MessageService) {}

  onSubmit() {
    this.authService.login(this.loginRequest).subscribe({
      next: () => {},
      error: (errorResponse: ErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: `${errorResponse.status} - ${errorResponse.error}`,
          detail: errorResponse.message,
        });
      },
    });
  }
}
