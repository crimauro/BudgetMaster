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
    // Esperamos un poco y redirigimos al login por si acaso
    setTimeout(() => {
      router.navigate(['/auth/login']);
    }, 100);
    return false;
  }

  const isAuthenticated = authService.isAuthenticated();
  console.log('AuthGuard: User authenticated:', isAuthenticated);
  console.log('AuthGuard: Token exists:', !!authService.getToken());
  
  // Si hay token en localStorage y el usuario está autenticado
  if (isAuthenticated) {
    console.log('AuthGuard: Access granted');
    return true;
  } else {
    console.log('AuthGuard: Access denied, redirecting to login');
    
    // Limpiar cualquier token inválido antes de redirigir
    if (authService.getToken()) {
      console.log('AuthGuard: Found invalid token, clearing session');
      authService.logout();
    }
    
    // Incluir la URL de retorno para redirigir después del login
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
};