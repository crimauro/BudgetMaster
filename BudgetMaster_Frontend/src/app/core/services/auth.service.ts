import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse, User } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Flag para evitar loops de redirección
  private isInitialized = false;

  constructor(private http: HttpClient) {
    this.initializeAuthState();
  }  login(loginRequest: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/api/Auth/login`, loginRequest)
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          if (response.isSuccess && response.data) {
            this.setSession(response.data);
          }
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/api/Auth/register`, registerRequest);
  }
  logout(): void {
    console.log('Manual logout called');
    this.clearSession();
  }

  /**
   * Verifica si el usuario está autenticado
   * Incluye validación de token y logs para debugging
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    
    if (!token) {
      console.log('AuthService: No token found');
      return false;
    }
    
    const isValid = this.isTokenValid(token);
    console.log('AuthService: Token validation result:', isValid);
    
    return isValid;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si el servicio ha sido inicializado
   * Útil para evitar checks prematuros en los guards
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Inicializa el estado de autenticación al cargar la aplicación
   * Solo restaura la sesión si el token es válido
   */
  private initializeAuthState(): void {
    console.log('AuthService: Initializing auth state...');
    
    const userStr = localStorage.getItem('user');
    const token = this.getToken();
    
    console.log('AuthService: Retrieved userStr:', userStr);
    console.log('AuthService: Retrieved token exists:', !!token);
    
    // Verificar que userStr no sea null, undefined, "undefined", "null" o string vacío
    if (this.isValidStoredData(userStr) && token) {
      if (this.isTokenValid(token)) {
        try {
          const user = JSON.parse(userStr!);
          this.currentUserSubject.next(user);
          console.log('AuthService: User session restored successfully', user);
        } catch (error) {
          console.warn('AuthService: Error parsing stored user data:', error);
          console.warn('AuthService: Problematic userStr value:', userStr);
          this.silentClearSession();
        }
      } else {
        console.log('AuthService: Token expired or invalid, clearing session');
        this.silentClearSession();
      }
    } else {
      console.log('AuthService: No valid stored session found');
      if (userStr || token) {
        console.log('AuthService: Clearing invalid stored data');
        this.silentClearSession();
      }
    }
    
    this.isInitialized = true;
  }

  /**
   * Verifica si los datos almacenados en localStorage son válidos
   */
  private isValidStoredData(data: string | null): boolean {
    return data !== null && 
           data !== undefined && 
           data !== 'undefined' && 
           data !== 'null' && 
           data.trim() !== '' &&
           data !== '{}';
  }

  /**
   * Valida si un token JWT es válido y no ha expirado
   */
  private isTokenValid(token: string): boolean {
    try {
      // Verificar formato del token
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('AuthService: Invalid token format');
        return false;
      }

      // Decodificar payload
      const payload = JSON.parse(atob(parts[1]));
      
      if (!payload.exp) {
        console.warn('AuthService: Token has no expiration date');
        return false;
      }

      const exp = payload.exp * 1000; // Convertir a milliseconds
      const now = Date.now();
      const isValid = now < exp;
      
      if (!isValid) {
        const expDate = new Date(exp);
        console.log(`AuthService: Token expired at ${expDate.toLocaleString()}`);
      }
      
      return isValid;
    } catch (error) {
      console.error('AuthService: Error validating token:', error);
      return false;
    }
  }
  /**
   * Establece la sesión del usuario después del login
   */  private setSession(authResponse: AuthResponse): void {
    console.log('AuthService: Setting user session');
    
    // Verificar que los datos sean válidos antes de guardar
    if (!authResponse.token) {
      console.error('AuthService: Invalid auth response - no token', authResponse);
      return;
    }
    
    try {
      localStorage.setItem('token', authResponse.token);
      
      // Decodificar el token para obtener el ID del usuario u otra información
      const tokenPayload = this.getDecodedToken(authResponse.token);
      console.log('Token payload:', tokenPayload);
        // Crear objeto de usuario basado en los campos individuales de la respuesta
      const user: User = {
        id: tokenPayload?.userId ? Number(tokenPayload.userId) : 0, // Asegurar que siempre sea un número
        username: authResponse.username,
        email: authResponse.email || '',
        fullName: authResponse.fullName
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
      console.log('AuthService: Session set successfully');
    } catch (error) {
      console.error('AuthService: Error setting session:', error);
      this.silentClearSession();
    }
  }

  /**
   * Limpia la sesión del usuario (logout público)
   */
  private clearSession(): void {
    console.log('AuthService: Clearing user session');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  /**
   * Limpia la sesión silenciosamente (sin logs extensos)
   * Usado internamente cuando se detecta un token inválido
   */
  private silentClearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
  /**
   * Método para verificar el estado del token sin side effects
   * Útil para debugging
   */
  getTokenInfo(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        payload,
        exp: new Date(payload.exp * 1000),
        isValid: this.isTokenValid(token),
        timeToExpiry: (payload.exp * 1000) - Date.now()
      };
    } catch (error) {
      return { error: 'Invalid token format' };
    }
  }

  /**
   * Decodifica un token JWT para obtener su payload
   */
  private getDecodedToken(token: string): any {
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('AuthService: Invalid token format');
        return null;
      }

      // Decodificar payload
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('AuthService: Error decoding token:', error);
      return null;
    }
  }
}