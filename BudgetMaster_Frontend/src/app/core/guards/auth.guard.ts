import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rutas que requieren autenticación
 * Redirige al login si el usuario no está autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log(`AuthGuard: Checking access to ${state.url}`);

  // Verificar si el servicio ya fue inicializado
  if (!authService.isServiceInitialized()) {
    console.log('AuthGuard: Service not initialized yet, denying access temporarily');
    return false;
  }

  const isAuthenticated = authService.isAuthenticated();
  console.log('AuthGuard: User authenticated:', isAuthenticated);

  if (isAuthenticated) {
    console.log('AuthGuard: Access granted');
    return true;
  } else {
    console.log('AuthGuard: Access denied, redirecting to login');
    
    // Incluir la URL de retorno para redirigir después del login
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
};