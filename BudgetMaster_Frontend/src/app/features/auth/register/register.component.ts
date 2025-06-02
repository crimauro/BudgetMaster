import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1 class="title">Crear Cuenta</h1>
          <p class="subtitle">Únete a BudgetMaster</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              type="text" 
              id="username" 
              formControlName="username" 
              class="form-control"
              placeholder="Ingrese su usuario"
              [class.error]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
            <div *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched" class="error-message">
              <span *ngIf="registerForm.get('username')?.errors?.['required']">El usuario es requerido</span>
              <span *ngIf="registerForm.get('username')?.errors?.['minlength']">El usuario debe tener al menos 3 caracteres</span>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control"
              placeholder="Ingrese su correo electrónico"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
            <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="error-message">
              <span *ngIf="registerForm.get('email')?.errors?.['required']">El correo es requerido</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Ingrese un correo válido</span>
            </div>
          </div>

          <div class="form-group">
            <label for="firstName">Nombre</label>
            <input 
              type="text" 
              id="firstName" 
              formControlName="firstName" 
              class="form-control"
              placeholder="Ingrese su nombre"
              [class.error]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
            <div *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched" class="error-message">
              El nombre es requerido
            </div>
          </div>

          <div class="form-group">
            <label for="lastName">Apellido</label>
            <input 
              type="text" 
              id="lastName" 
              formControlName="lastName" 
              class="form-control"
              placeholder="Ingrese su apellido"
              [class.error]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
            <div *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched" class="error-message">
              El apellido es requerido
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
              [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
            <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="error-message">
              <span *ngIf="registerForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">La contraseña debe tener al menos 6 caracteres</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword" 
              class="form-control"
              placeholder="Confirme su contraseña"
              [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
            <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" class="error-message">
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Confirme su contraseña</span>
              <span *ngIf="registerForm.errors?.['passwordMismatch']">Las contraseñas no coinciden</span>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-alert">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-alert">
            {{ successMessage }}
          </div>

          <button 
            type="submit" 
            class="register-btn"
            [disabled]="registerForm.invalid || isLoading">
            <span *ngIf="isLoading">Registrando...</span>
            <span *ngIf="!isLoading">Crear Cuenta</span>
          </button>
        </form>

        <div class="register-footer">
          <p>¿Ya tienes una cuenta? <a routerLink="/auth/login" class="login-link">Iniciar Sesión</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 500px;
      animation: fadeIn 0.8s ease-out;
      max-height: 90vh;
      overflow-y: auto;
    }

    .register-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .title {
      font-size: 2.2rem;
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

    .success-alert {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }

    .register-btn {
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

    .register-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .register-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .register-footer {
      margin-top: 30px;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e1e5e9;
      color: #666;
      font-size: 0.875rem;
    }

    .login-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .login-link:hover {
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
      .register-card {
        padding: 30px 20px;
        margin: 10px;
      }

      .title {
        font-size: 1.8rem;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const registerData = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        password: this.registerForm.value.password,
        confirmPassword: this.registerForm.value.confirmPassword,
        documentType: 1, // Tipo de documento por defecto (cédula)
        documentNumber: '12345678' // Número de documento por defecto
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.successMessage = 'Registro exitoso. Redirigiendo al login...';
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Error en el registro';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error de conexión. Por favor, intente de nuevo.';
          console.error('Register error:', error);
        }
      });
    }
  }
}
