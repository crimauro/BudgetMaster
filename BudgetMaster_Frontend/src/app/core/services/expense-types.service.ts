import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseType, ApiResponse } from '../../core/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseTypesService {
  private apiUrl = `${environment.apiUrl}/api/ExpenseTypes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<ExpenseType[]>> {
    return this.http.get<ApiResponse<ExpenseType[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<ExpenseType>> {
    return this.http.get<ApiResponse<ExpenseType>>(`${this.apiUrl}/${id}`);
  }

  create(expenseType: Partial<ExpenseType>): Observable<ApiResponse<ExpenseType>> {
    return this.http.post<ApiResponse<ExpenseType>>(this.apiUrl, expenseType);
  }

  update(id: number, expenseType: Partial<ExpenseType>): Observable<ApiResponse<ExpenseType>> {
    return this.http.put<ApiResponse<ExpenseType>>(`${this.apiUrl}/${id}`, expenseType);
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
