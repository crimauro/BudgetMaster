import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseRecord, ApiResponse } from '../../core/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseRecordsService {
  private apiUrl = `${environment.apiUrl}/api/ExpenseRecords`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<ExpenseRecord[]>> {
    return this.http.get<ApiResponse<ExpenseRecord[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<ExpenseRecord>> {
    return this.http.get<ApiResponse<ExpenseRecord>>(`${this.apiUrl}/${id}`);
  }

  getByUser(userId: number): Observable<ApiResponse<ExpenseRecord[]>> {
    return this.http.get<ApiResponse<ExpenseRecord[]>>(`${this.apiUrl}/user/${userId}`);
  }

  getByPeriod(startDate: string, endDate: string, userId?: number): Observable<ApiResponse<ExpenseRecord[]>> {
    let url = `${this.apiUrl}/period?startDate=${startDate}&endDate=${endDate}`;
    if (userId) {
      url += `&userId=${userId}`;
    }
    return this.http.get<ApiResponse<ExpenseRecord[]>>(url);
  }

  getDetails(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/details`);
  }

  create(expenseRecord: Partial<ExpenseRecord>): Observable<ApiResponse<ExpenseRecord>> {
    return this.http.post<ApiResponse<ExpenseRecord>>(this.apiUrl, expenseRecord);
  }

  update(id: number, expenseRecord: Partial<ExpenseRecord>): Observable<ApiResponse<ExpenseRecord>> {
    return this.http.put<ApiResponse<ExpenseRecord>>(`${this.apiUrl}/${id}`, expenseRecord);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
