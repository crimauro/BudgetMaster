import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Deposit, CreateDepositRequest, UpdateDepositRequest } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class DepositsService {
  private apiUrl = `${environment.apiUrl}/api/Deposits`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<ApiResponse<Deposit[]>> {
    return this.http.get<ApiResponse<Deposit[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Deposit>> {
    return this.http.get<ApiResponse<Deposit>>(`${this.apiUrl}/${id}`);
  }

  create(deposit: CreateDepositRequest): Observable<ApiResponse<Deposit>> {
    return this.http.post<ApiResponse<Deposit>>(this.apiUrl, deposit);
  }

  update(id: number, deposit: UpdateDepositRequest): Observable<ApiResponse<Deposit>> {
    return this.http.put<ApiResponse<Deposit>>(`${this.apiUrl}/${id}`, deposit);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getByUserId(userId: number): Observable<ApiResponse<Deposit[]>> {
    return this.http.get<ApiResponse<Deposit[]>>(`${this.apiUrl}/user/${userId}`);
  }

  getByPeriod(startDate: string, endDate: string, userId?: number): Observable<ApiResponse<Deposit[]>> {
    let url = `${this.apiUrl}/period?startDate=${startDate}&endDate=${endDate}`;
    if (userId) {
      url += `&userId=${userId}`;
    }
    return this.http.get<ApiResponse<Deposit[]>>(url);
  }

  getByMonetaryFundId(monetaryFundId: number): Observable<ApiResponse<Deposit[]>> {
    return this.http.get<ApiResponse<Deposit[]>>(`${this.apiUrl}/fund/${monetaryFundId}`);
  }

  getByDateRange(startDate: string, endDate: string): Observable<ApiResponse<Deposit[]>> {
    return this.http.get<ApiResponse<Deposit[]>>(`${this.apiUrl}/date-range?startDate=${startDate}&endDate=${endDate}`);
  }
}
