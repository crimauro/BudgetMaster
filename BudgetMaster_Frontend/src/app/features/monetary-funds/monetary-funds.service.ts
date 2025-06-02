import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonetaryFund, ApiResponse } from '../../core/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonetaryFundsService {
  private apiUrl = `${environment.apiUrl}/api/MonetaryFunds`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<MonetaryFund[]>> {
    return this.http.get<ApiResponse<MonetaryFund[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<MonetaryFund>> {
    return this.http.get<ApiResponse<MonetaryFund>>(`${this.apiUrl}/${id}`);
  }

  getBalance(id: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/${id}/balance`);
  }

  create(monetaryFund: Partial<MonetaryFund>): Observable<ApiResponse<MonetaryFund>> {
    return this.http.post<ApiResponse<MonetaryFund>>(this.apiUrl, monetaryFund);
  }

  update(id: number, monetaryFund: Partial<MonetaryFund>): Observable<ApiResponse<MonetaryFund>> {
    return this.http.put<ApiResponse<MonetaryFund>>(`${this.apiUrl}/${id}`, monetaryFund);
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
