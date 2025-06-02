import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ExpenseType } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ExpenseTypesService {
  private apiUrl = `${environment.apiUrl}/api/ExpenseTypes`;

  constructor(private http: HttpClient) { }

  getAllExpenseTypes(): Observable<ApiResponse<ExpenseType[]>> {
    return this.http.get<ApiResponse<ExpenseType[]>>(this.apiUrl);
  }

  getExpenseTypeById(id: number): Observable<ApiResponse<ExpenseType>> {
    return this.http.get<ApiResponse<ExpenseType>>(`${this.apiUrl}/${id}`);
  }

  createExpenseType(expenseType: Partial<ExpenseType>): Observable<ApiResponse<ExpenseType>> {
    return this.http.post<ApiResponse<ExpenseType>>(this.apiUrl, expenseType);
  }

  updateExpenseType(id: number, expenseType: Partial<ExpenseType>): Observable<ApiResponse<ExpenseType>> {
    return this.http.put<ApiResponse<ExpenseType>>(`${this.apiUrl}/${id}`, expenseType);
  }

  deleteExpenseType(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  activate(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
