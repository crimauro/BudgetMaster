import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="title">BudgetMaster</h1>
          <p class="subtitle">Control de Gastos Personales</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              type="text" 
              id="username" 
              formControlName="username" 
              class="form-control"
              placeholder="Ingrese su usuario"
              [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
            <div *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" class="error-message">
              El usuario es requerido
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              class="form-control"
              placeholder="Ingrese su contraseña"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error-message">
              La contraseña es requerida
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-alert">
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            class="login-btn"
            [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="isLoading">Cargando...</span>
            <span *ngIf="!isLoading">Iniciar Sesión</span>
          </button>
        </form>        <div class="login-footer">
          <p>Usuario por defecto: <strong>admin</strong></p>
          <p>Contraseña por defecto: <strong>admin</strong></p>
          <p class="register-link">¿No tienes cuenta? <a routerLink="/auth/register">Registrarse</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      animation: fadeIn 0.8s ease-out;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .title {
      font-size: 2.5rem;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 5px;
    }

    .subtitle {
      color: #666;
      font-size: 1rem;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e1e5e9;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 5px;
    }

    .error-alert {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }

    .login-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .login-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .login-footer {
      margin-top: 30px;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e1e5e9;
      color: #666;
      font-size: 0.875rem;
    }    .login-footer p {
      margin: 5px 0;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 30px 20px;
        margin: 10px;
      }

      .title {
        font-size: 2rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['admin', [Validators.required]],
      password: ['admin', [Validators.required]]
    });
  }

    ngOnInit() {
      // Si ya está autenticado, redirigir al dashboard
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      }
    }

    onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            console.log('Login exitoso, token recibido:', !!response.data?.token);
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.message || 'Error en el inicio de sesión';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error de conexión. Por favor, intente de nuevo.';
          console.error('Login error:', error);
        }
      });
    }
  }
}
