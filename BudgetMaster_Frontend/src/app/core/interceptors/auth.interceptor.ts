import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Obtener el token del servicio de autenticación
  const token = authService.getToken();
    // Si hay un token y el servicio está inicializado, añadirlo a los headers
  if (token && authService.isServiceInitialized() && authService.isAuthenticated()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('AuthInterceptor: Added token to request', req.url);
  }
  
  // Procesar la petición y manejar errores de autenticación
  return next(req).pipe(
    catchError(error => {
      // Solo redirigir al login si es un error 401 en rutas protegidas
      // y no es una ruta de autenticación
      if (error.status === 401 && !req.url.includes('/auth/')) {
        console.error('Token inválido o expirado:', error);
        authService.logout();
        router.navigate(['/auth/login']);
      }
      
      return throwError(() => error);
    })
  );
};