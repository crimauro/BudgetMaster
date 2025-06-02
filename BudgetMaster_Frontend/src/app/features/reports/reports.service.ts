import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  BudgetVsExecutionReport, 
  ExpenseSummaryReport, 
  MovementDto,
  MonthlyFinancialSummary
} from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/api/Reports`;

  constructor(private http: HttpClient) { }

  // Reporte de Presupuesto vs Ejecución
  getBudgetVsExecutionReport(userId: number, month: number, year: number): Observable<ApiResponse<BudgetVsExecutionReport>> {
    return this.http.get<ApiResponse<BudgetVsExecutionReport>>(
      `${this.apiUrl}/budget-vs-execution/${userId}/${month}/${year}`
    );
  }

  // Resumen de Gastos
  getExpenseSummaryReport(userId: number, startDate: string, endDate: string): Observable<ApiResponse<ExpenseSummaryReport>> {
    return this.http.get<ApiResponse<ExpenseSummaryReport>>(
      `${this.apiUrl}/expense-summary/${userId}?startDate=${startDate}&endDate=${endDate}`
    );
  }
  // Movimientos (Gastos y Depósitos)
  getMovements(userId: number, startDate?: string, endDate?: string): Observable<ApiResponse<MovementDto[]>> {
    let url = `${this.apiUrl}/movements?userId=${userId}`;
    
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    return this.http.get<ApiResponse<MovementDto[]>>(url);
  }
  // Resumen Financiero Mensual
  getMonthlyFinancialSummary(userId: number, month: number, year: number): Observable<ApiResponse<MonthlyFinancialSummary>> {
    return this.http.get<ApiResponse<MonthlyFinancialSummary>>(
      `${this.apiUrl}/monthly-summary?userId=${userId}&month=${month}&year=${year}`
    );
  }

  // Exportar reportes (opcional, para futuras implementaciones)
  exportBudgetVsExecution(userId: number, month: number, year: number, format: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/budget-vs-execution/${userId}/${month}/${year}?format=${format}`, {
      responseType: 'blob'
    });
  }

  exportExpenseSummary(userId: number, startDate: string, endDate: string, format: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/expense-summary/${userId}?startDate=${startDate}&endDate=${endDate}&format=${format}`, {
      responseType: 'blob'
    });
  }
}
