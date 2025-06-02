import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, ApiResponse } from '../../core/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetsService {
  private apiUrl = `${environment.apiUrl}/api/Budgets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Budget[]>> {
    return this.http.get<ApiResponse<Budget[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Budget>> {
    return this.http.get<ApiResponse<Budget>>(`${this.apiUrl}/${id}`);
  }

  getByUserMonthAndYear(userId: number, month: number, year: number): Observable<ApiResponse<Budget[]>> {
    return this.http.get<ApiResponse<Budget[]>>(`${this.apiUrl}/user/${userId}/month/${month}/year/${year}`);
  }

  create(budget: Partial<Budget>): Observable<ApiResponse<Budget>> {
    return this.http.post<ApiResponse<Budget>>(this.apiUrl, budget);
  }

  update(id: number, budget: Partial<Budget>): Observable<ApiResponse<Budget>> {
    return this.http.put<ApiResponse<Budget>>(`${this.apiUrl}/${id}`, budget);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  activate(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
