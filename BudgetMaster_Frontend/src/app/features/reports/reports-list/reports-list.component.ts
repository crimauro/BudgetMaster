import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../reports.service';
import { AuthService } from '../../../core/services/auth.service';
import { 
  BudgetVsExecutionReport, 
  ExpenseSummaryReport, 
  MovementDto,
  MonthlyFinancialSummary,
  BudgetVsExecutionItem,
  ExpenseByTypeItem,
  DepositByFundItem
} from '../../../core/models';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <div class="page-header">
        <h1>Reportes y Consultas</h1>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="refreshAllReports()">
            <i class="icon-refresh"></i>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Filtros principales -->
      <div class="filters-card">
        <div class="filter-group">
          <label for="reportType">Tipo de Reporte:</label>
          <select id="reportType" [(ngModel)]="selectedReportType" (change)="onReportTypeChange()" class="form-control">
            <option value="budget-vs-execution">Presupuesto vs Ejecución</option>
            <option value="expense-summary">Resumen de Gastos</option>
            <option value="movements">Movimientos</option>
            <option value="monthly-summary">Resumen Mensual</option>
          </select>
        </div>
        
        <div class="filter-group" *ngIf="selectedReportType === 'budget-vs-execution' || selectedReportType === 'monthly-summary'">
          <label for="month">Mes:</label>
          <select id="month" [(ngModel)]="selectedMonth" (change)="loadSelectedReport()" class="form-control">
            <option *ngFor="let month of months" [value]="month.value">{{month.label}}</option>
          </select>
        </div>
        
        <div class="filter-group" *ngIf="selectedReportType === 'budget-vs-execution' || selectedReportType === 'monthly-summary'">
          <label for="year">Año:</label>
          <select id="year" [(ngModel)]="selectedYear" (change)="loadSelectedReport()" class="form-control">
            <option *ngFor="let year of years" [value]="year">{{year}}</option>
          </select>
        </div>
        
        <div class="filter-group" *ngIf="selectedReportType === 'expense-summary' || selectedReportType === 'movements'">
          <label for="startDate">Fecha Desde:</label>
          <input type="date" id="startDate" [(ngModel)]="startDate" (change)="loadSelectedReport()" class="form-control">
        </div>
        
        <div class="filter-group" *ngIf="selectedReportType === 'expense-summary' || selectedReportType === 'movements'">
          <label for="endDate">Fecha Hasta:</label>
          <input type="date" id="endDate" [(ngModel)]="endDate" (change)="loadSelectedReport()" class="form-control">
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando reporte...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="error-message">
        <i class="icon-alert"></i>
        <span>{{error}}</span>
      </div>

      <!-- Reporte: Presupuesto vs Ejecución -->
      <div *ngIf="!loading && !error && selectedReportType === 'budget-vs-execution' && budgetVsExecutionReport" class="report-section">
        <div class="report-header">
          <h2>Presupuesto vs Ejecución</h2>
          <div class="report-info">
            <span>{{getMonthName(budgetVsExecutionReport.month)}} {{budgetVsExecutionReport.year}}</span>
            <span class="report-date">Generado: {{budgetVsExecutionReport.generatedAt | date:'dd/MM/yyyy HH:mm'}}</span>
          </div>
        </div>

        <!-- Resumen ejecutivo -->
        <div class="summary-cards">
          <div class="summary-card budget">
            <div class="summary-icon">
              <i class="icon-budget"></i>
            </div>
            <div class="summary-content">
              <h3>Total Presupuestado</h3>
              <p class="summary-value">{{budgetVsExecutionReport.totalBudgeted | currency:'USD':'symbol':'1.2-2'}}</p>
            </div>
          </div>
          <div class="summary-card executed">
            <div class="summary-icon">
              <i class="icon-expense"></i>
            </div>
            <div class="summary-content">
              <h3>Total Ejecutado</h3>
              <p class="summary-value">{{budgetVsExecutionReport.totalExecuted | currency:'USD':'symbol':'1.2-2'}}</p>
            </div>
          </div>
          <div class="summary-card variance" [class.positive]="budgetVsExecutionReport.totalVariance >= 0" [class.negative]="budgetVsExecutionReport.totalVariance < 0">
            <div class="summary-icon">
              <i class="icon-variance"></i>
            </div>
            <div class="summary-content">
              <h3>Variación</h3>
              <p class="summary-value">{{budgetVsExecutionReport.totalVariance | currency:'USD':'symbol':'1.2-2'}}</p>
            </div>
          </div>
        </div>

        <!-- Gráfico de barras (simulado) -->
        <div class="chart-card">
          <h3>Comparativo por Categoría</h3>
          <div class="chart-container">
            <div class="chart-bars">
              <div *ngFor="let item of budgetVsExecutionReport.budgetItems" class="bar-group">
                <div class="bar-label">{{item.expenseTypeName}}</div>
                <div class="bars">
                  <div class="bar budget-bar" 
                       [style.height.%]="getBarHeight(item.budgetedAmount, budgetVsExecutionReport.totalBudgeted)"
                       [title]="'Presupuestado: ' + (item.budgetedAmount | currency:'USD':'symbol':'1.2-2')">
                    <span class="bar-value">{{item.budgetedAmount | currency:'USD':'symbol':'1.0-0'}}</span>
                  </div>
                  <div class="bar executed-bar" 
                       [style.height.%]="getBarHeight(item.executedAmount, budgetVsExecutionReport.totalBudgeted)"
                       [title]="'Ejecutado: ' + (item.executedAmount | currency:'USD':'symbol':'1.2-2')">
                    <span class="bar-value">{{item.executedAmount | currency:'USD':'symbol':'1.0-0'}}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color budget"></span>
                <span>Presupuestado</span>
              </div>
              <div class="legend-item">
                <span class="legend-color executed"></span>
                <span>Ejecutado</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla detallada -->
        <div class="table-card">
          <h3>Detalle por Categoría</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th class="text-right">Presupuestado</th>
                  <th class="text-right">Ejecutado</th>
                  <th class="text-right">Variación</th>
                  <th class="text-right">%</th>
                  <th class="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of budgetVsExecutionReport.budgetItems">
                  <td>
                    <div class="category-info">
                      <strong>{{item.expenseTypeName}}</strong>
                      <small>{{item.expenseTypeCode}}</small>
                    </div>
                  </td>
                  <td class="text-right">{{item.budgetedAmount | currency:'USD':'symbol':'1.2-2'}}</td>
                  <td class="text-right">{{item.executedAmount | currency:'USD':'symbol':'1.2-2'}}</td>
                  <td class="text-right" [class.positive]="item.variance >= 0" [class.negative]="item.variance < 0">
                    {{item.variance | currency:'USD':'symbol':'1.2-2'}}
                  </td>
                  <td class="text-right" [class.positive]="item.variancePercentage >= 0" [class.negative]="item.variancePercentage < 0">
                    {{item.variancePercentage | number:'1.1-1'}}%
                  </td>
                  <td class="text-center">
                    <span class="status-badge" [class.status-over]="item.isOverBudget" [class.status-under]="!item.isOverBudget">
                      {{item.isOverBudget ? 'Sobre Presupuesto' : 'Dentro del Presupuesto'}}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Reporte: Resumen de Gastos -->
      <div *ngIf="!loading && !error && selectedReportType === 'expense-summary' && expenseSummaryReport" class="report-section">
        <div class="report-header">
          <h2>Resumen de Gastos</h2>
          <div class="report-info">
            <span>{{expenseSummaryReport.startDate | date:'dd/MM/yyyy'}} - {{expenseSummaryReport.endDate | date:'dd/MM/yyyy'}}</span>
            <span class="report-date">Generado: {{expenseSummaryReport.generatedAt | date:'dd/MM/yyyy HH:mm'}}</span>
          </div>
        </div>

        <!-- Resumen ejecutivo -->
        <div class="summary-cards">
          <div class="summary-card expenses">
            <div class="summary-icon">
              <i class="icon-expense"></i>
            </div>
            <div class="summary-content">
              <h3>Total Gastos</h3>
              <p class="summary-value">{{expenseSummaryReport.totalExpenses | currency:'USD':'symbol':'1.2-2'}}</p>
            </div>
          </div>
          <div class="summary-card deposits">
            <div class="summary-icon">
              <i class="icon-deposit"></i>
            </div>
            <div class="summary-content">
              <h3>Total Depósitos</h3>
              <p class="summary-value">{{expenseSummaryReport.totalDeposits | currency:'USD':'symbol':'1.2-2'}}</p>
            </div>
          </div>
          <div class="summary-card balance" [class.positive]="expenseSummaryReport.netBalance >= 0" [class.negative]="expenseSummaryReport.netBalance < 0">
            <div class="summary-icon">
              <i class="icon-balance"></i>
            </div>
            <div class="summary-content">
              <h3>Balance Neto</h3>
              <p class="summary-value">{{expenseSummaryReport.netBalance | currency:'USD':'symbol':'1.2-2'}}</p>
            </div>
          </div>
        </div>

        <!-- Gastos por categoría -->
        <div class="table-card">
          <h3>Gastos por Categoría</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th class="text-right">Total</th>
                  <th class="text-right">Transacciones</th>
                  <th class="text-right">Promedio</th>
                  <th class="text-right">% del Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of expenseSummaryReport.expensesByType">
                  <td>
                    <div class="category-info">
                      <strong>{{item.expenseTypeName}}</strong>
                      <small>{{item.expenseTypeCode}}</small>
                    </div>
                  </td>
                  <td class="text-right">{{item.totalAmount | currency:'USD':'symbol':'1.2-2'}}</td>
                  <td class="text-right">{{item.transactionCount}}</td>
                  <td class="text-right">{{item.averageAmount | currency:'USD':'symbol':'1.2-2'}}</td>
                  <td class="text-right">{{getPercentage(item.totalAmount, expenseSummaryReport.totalExpenses) | number:'1.1-1'}}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Depósitos por fondo -->
        <div class="table-card">
          <h3>Depósitos por Fondo</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fondo Monetario</th>
                  <th class="text-right">Total</th>
                  <th class="text-right">Transacciones</th>
                  <th class="text-right">% del Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of expenseSummaryReport.depositsByFund">
                  <td>{{item.monetaryFundName}}</td>
                  <td class="text-right">{{item.totalAmount | currency:'USD':'symbol':'1.2-2'}}</td>
                  <td class="text-right">{{item.transactionCount}}</td>
                  <td class="text-right">{{getPercentage(item.totalAmount, expenseSummaryReport.totalDeposits) | number:'1.1-1'}}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Reporte: Movimientos -->
      <div *ngIf="!loading && !error && selectedReportType === 'movements' && movements" class="report-section">
        <div class="report-header">
          <h2>Movimientos</h2>
          <div class="report-info">
            <span *ngIf="startDate && endDate">{{startDate | date:'dd/MM/yyyy'}} - {{endDate | date:'dd/MM/yyyy'}}</span>
            <span *ngIf="!startDate || !endDate">Todos los movimientos</span>
          </div>
        </div>

        <!-- Resumen de movimientos -->
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-icon">
              <i class="icon-movements"></i>
            </div>
            <div class="summary-content">
              <h3>Total Movimientos</h3>
              <p class="summary-value">{{movements.length}}</p>
            </div>
          </div>
          <div class="summary-card expenses">
            <div class="summary-icon">
              <i class="icon-expense"></i>
            </div>
            <div class="summary-content">
              <h3>Gastos</h3>
              <p class="summary-value">{{getExpensesTotal() | currency:'USD':'symbol':'1.2-2'}}</p>
              <span class="summary-count">{{getExpensesCount()}} registros</span>
            </div>
          </div>
          <div class="summary-card deposits">
            <div class="summary-icon">
              <i class="icon-deposit"></i>
            </div>
            <div class="summary-content">
              <h3>Depósitos</h3>
              <p class="summary-value">{{getDepositsTotal() | currency:'USD':'symbol':'1.2-2'}}</p>
              <span class="summary-count">{{getDepositsCount()}} registros</span>
            </div>
          </div>
        </div>

        <!-- Tabla de movimientos -->
        <div class="table-card">
          <h3>Detalle de Movimientos</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Categoría/Fondo</th>
                  <th class="text-right">Monto</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let movement of movements">
                  <td>{{movement.date | date:'dd/MM/yyyy HH:mm'}}</td>
                  <td>
                    <span class="movement-type" [class.expense]="movement.type === 'Expense'" [class.deposit]="movement.type === 'Deposit'">
                      {{movement.type === 'Expense' ? 'Gasto' : 'Depósito'}}
                    </span>
                  </td>
                  <td>{{movement.description}}</td>
                  <td>
                    <span *ngIf="movement.type === 'Expense'">{{movement.expenseTypeName}} ({{movement.expenseTypeCode}})</span>
                    <span *ngIf="movement.type === 'Deposit'">{{movement.monetaryFundName}}</span>
                  </td>
                  <td class="text-right">
                    <span class="amount" [class.positive]="movement.type === 'Deposit'" [class.negative]="movement.type === 'Expense'">
                      {{movement.type === 'Deposit' ? '+' : '-'}}{{movement.amount | currency:'USD':'symbol':'1.2-2'}}
                    </span>
                  </td>
                  <td>{{movement.userName}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Reporte: Resumen Mensual -->
      <div *ngIf="!loading && !error && selectedReportType === 'monthly-summary' && monthlyFinancialSummary" class="report-section">
        <div class="report-header">
          <h2>Resumen Financiero Mensual</h2>
          <div class="report-info">
            <span>{{getMonthName(monthlyFinancialSummary.month)}} {{monthlyFinancialSummary.year}}</span>
            <span class="report-date">Generado: {{monthlyFinancialSummary.generatedAt | date:'dd/MM/yyyy HH:mm'}}</span>
          </div>
        </div>

        <!-- Resumen ejecutivo -->
        <div class="summary-cards">
          <div class="summary-card income">
            <div class="summary-icon">
              <i class="icon-income"></i>
            </div>
            <div class="summary-content">
              <h3>Ingresos Totales</h3>
              <p class="summary-value">{{monthlyFinancialSummary.totalIncome | currency:'USD':'symbol':'1.2-2'}}</p>
            </div>
          </div>
          <div class="summary-card expenses">
            <div class="summary-icon">
              <i class="icon-expense"></i>
            </div>
            <div class="summary-content">
              <h3>Gastos Totales</h3>
              <p class="summary-value">{{monthlyFinancialSummary.totalExpenses | currency:'USD':'symbol':'1.2-2'}}</p>
            </div>
          </div>
          <div class="summary-card savings" [class.positive]="monthlyFinancialSummary.netSavings >= 0" [class.negative]="monthlyFinancialSummary.netSavings < 0">
            <div class="summary-icon">
              <i class="icon-savings"></i>
            </div>
            <div class="summary-content">
              <h3>Ahorro Neto</h3>
              <p class="summary-value">{{monthlyFinancialSummary.netSavings | currency:'USD':'symbol':'1.2-2'}}</p>
            </div>
          </div>
          <div class="summary-card compliance">
            <div class="summary-icon">
              <i class="icon-compliance"></i>
            </div>
            <div class="summary-content">
              <h3>Cumplimiento Presupuestal</h3>
              <p class="summary-value">{{monthlyFinancialSummary.budgetCompliance | number:'1.1-1'}}%</p>
            </div>
          </div>
        </div>

        <!-- Top categorías de gastos -->
        <div class="table-card">
          <h3>Principales Categorías de Gastos</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th class="text-right">Total</th>
                  <th class="text-right">Transacciones</th>
                  <th class="text-right">Promedio</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of monthlyFinancialSummary.topExpenseCategories">
                  <td>
                    <div class="category-info">
                      <strong>{{item.expenseTypeName}}</strong>
                      <small>{{item.expenseTypeCode}}</small>
                    </div>
                  </td>
                  <td class="text-right">{{item.totalAmount | currency:'USD':'symbol':'1.2-2'}}</td>
                  <td class="text-right">{{item.transactionCount}}</td>
                  <td class="text-right">{{item.averageAmount | currency:'USD':'symbol':'1.2-2'}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div *ngIf="!loading && !error && !hasData()" class="empty-state">
        <i class="icon-empty"></i>
        <h3>No hay datos disponibles</h3>
        <p>No se encontraron datos para el período seleccionado.</p>
        <button class="btn btn-primary" (click)="loadSelectedReport()">
          Recargar Datos
        </button>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e9ecef;
    }

    .page-header h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 2.5rem;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .filters-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e9ecef;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 500;
      color: #495057;
      font-size: 0.875rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .report-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e9ecef;
    }

    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .report-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .report-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #6c757d;
    }

    .report-date {
      font-size: 0.75rem;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      padding: 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .summary-card:hover {
      transform: translateY(-2px);
    }

    .summary-card.budget {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .summary-card.executed {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .summary-card.variance.positive {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .summary-card.variance.negative {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
    }

    .summary-card.expenses {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .summary-card.deposits {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .summary-card.balance.positive {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .summary-card.balance.negative {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
    }

    .summary-card.income {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .summary-card.savings.positive {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .summary-card.savings.negative {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
    }

    .summary-card.compliance {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .summary-icon {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .summary-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      opacity: 0.9;
      font-weight: 500;
    }

    .summary-value {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .summary-count {
      font-size: 0.75rem;
      opacity: 0.8;
    }

    .chart-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .chart-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .chart-bars {
      display: flex;
      gap: 1rem;
      align-items: end;
      min-height: 200px;
      padding: 1rem;
      background: white;
      border-radius: 8px;
    }

    .bar-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .bar-label {
      font-size: 0.75rem;
      color: #495057;
      text-align: center;
      font-weight: 500;
    }

    .bars {
      display: flex;
      gap: 0.25rem;
      align-items: end;
      height: 150px;
    }

    .bar {
      width: 30px;
      min-height: 10px;
      border-radius: 4px 4px 0 0;
      position: relative;
      display: flex;
      align-items: end;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .bar:hover {
      transform: translateY(-2px);
    }

    .budget-bar {
      background: linear-gradient(to top, #667eea, #764ba2);
    }

    .executed-bar {
      background: linear-gradient(to top, #f093fb, #f5576c);
    }

    .bar-value {
      font-size: 0.6rem;
      color: white;
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      padding: 0.25rem;
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 2rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #495057;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-color.budget {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .legend-color.executed {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }

    .table-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .table-card h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .table-responsive {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th,
    .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
      vertical-align: middle;
    }

    .data-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .data-table .text-right {
      text-align: right;
    }

    .data-table .text-center {
      text-align: center;
    }

    .category-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .category-info strong {
      color: #2c3e50;
    }

    .category-info small {
      color: #6c757d;
      font-size: 0.75rem;
    }

    .positive {
      color: #28a745;
    }

    .negative {
      color: #dc3545;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-over {
      background: #f8d7da;
      color: #721c24;
    }

    .status-under {
      background: #d4edda;
      color: #155724;
    }

    .movement-type {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .movement-type.expense {
      background: #f8d7da;
      color: #721c24;
    }

    .movement-type.deposit {
      background: #d4edda;
      color: #155724;
    }

    .amount {
      font-weight: 600;
      font-size: 1rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      justify-content: center;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
      transform: translateY(-1px);
    }

    .loading-container {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #495057;
    }

    .empty-state p {
      margin: 0 0 2rem 0;
    }

    /* Iconos CSS */
    .icon-refresh::before { content: '🔄'; }
    .icon-budget::before { content: '📊'; }
    .icon-expense::before { content: '💸'; }
    .icon-variance::before { content: '📈'; }
    .icon-deposit::before { content: '💰'; }
    .icon-balance::before { content: '⚖️'; }
    .icon-movements::before { content: '🔄'; }
    .icon-income::before { content: '💹'; }
    .icon-savings::before { content: '🏦'; }
    .icon-compliance::before { content: '✅'; }
    .icon-empty::before { content: '📭'; }
    .icon-alert::before { content: '⚠'; }

    /* Responsive */
    @media (max-width: 768px) {
      .reports-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .page-header h1 {
        font-size: 2rem;
        text-align: center;
      }

      .filters-card {
        grid-template-columns: 1fr;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }

      .chart-bars {
        overflow-x: auto;
        min-width: 400px;
      }

      .data-table {
        font-size: 0.875rem;
      }

      .data-table th,
      .data-table td {
        padding: 0.75rem 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .table-responsive {
        overflow-x: auto;
      }

      .data-table {
        min-width: 600px;
      }
    }
  `]
})
export class ReportsListComponent implements OnInit {
  // Datos de reportes
  budgetVsExecutionReport: BudgetVsExecutionReport | null = null;
  expenseSummaryReport: ExpenseSummaryReport | null = null;
  movements: MovementDto[] | null = null;
  monthlyFinancialSummary: MonthlyFinancialSummary | null = null;

  // Estados
  loading = false;
  error = '';

  // Filtros
  selectedReportType = 'budget-vs-execution';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  startDate = this.getFirstDayOfMonth();
  endDate = this.getLastDayOfMonth();

  // Opciones para selects
  months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  years: number[] = [];

  constructor(
    private reportsService: ReportsService,
    private authService: AuthService
  ) {
    this.initializeYears();
  }

  ngOnInit() {
    this.loadSelectedReport();
  }

  private initializeYears() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
      this.years.push(year);
    }
  }

  private getFirstDayOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  }

  private getLastDayOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  onReportTypeChange() {
    this.clearReports();
    this.loadSelectedReport();
  }

  private clearReports() {
    this.budgetVsExecutionReport = null;
    this.expenseSummaryReport = null;
    this.movements = null;
    this.monthlyFinancialSummary = null;
    this.error = '';
  }

  loadSelectedReport() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.loading = true;
    this.error = '';

    switch (this.selectedReportType) {
      case 'budget-vs-execution':
        this.loadBudgetVsExecutionReport(currentUser.id);
        break;
      case 'expense-summary':
        this.loadExpenseSummaryReport(currentUser.id);
        break;
      case 'movements':
        this.loadMovements(currentUser.id);
        break;
      case 'monthly-summary':
        this.loadMonthlyFinancialSummary(currentUser.id);
        break;
    }
  }

  private loadBudgetVsExecutionReport(userId: number) {
    this.reportsService.getBudgetVsExecutionReport(userId, this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.budgetVsExecutionReport = response.data;
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading budget vs execution report:', error);
          this.error = 'Error al cargar el reporte de presupuesto vs ejecución';
          this.loading = false;
        }
      });
  }

  private loadExpenseSummaryReport(userId: number) {
    this.reportsService.getExpenseSummaryReport(userId, this.startDate, this.endDate)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.expenseSummaryReport = response.data;
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading expense summary report:', error);
          this.error = 'Error al cargar el resumen de gastos';
          this.loading = false;
        }
      });
  }

  private loadMovements(userId: number) {
    this.reportsService.getMovements(userId, this.startDate, this.endDate)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.movements = response.data || [];
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading movements:', error);
          this.error = 'Error al cargar los movimientos';
          this.loading = false;
        }
      });
  }

  private loadMonthlyFinancialSummary(userId: number) {
    this.reportsService.getMonthlyFinancialSummary(userId, this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.monthlyFinancialSummary = response.data;
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading monthly financial summary:', error);
          this.error = 'Error al cargar el resumen financiero mensual';
          this.loading = false;
        }
      });
  }

  refreshAllReports() {
    this.loadSelectedReport();
  }

  hasData(): boolean {
    switch (this.selectedReportType) {
      case 'budget-vs-execution':
        return !!this.budgetVsExecutionReport;
      case 'expense-summary':
        return !!this.expenseSummaryReport;
      case 'movements':
        return !!this.movements && this.movements.length > 0;
      case 'monthly-summary':
        return !!this.monthlyFinancialSummary;
      default:
        return false;
    }
  }

  // Funciones de utilidad para gráficos
  getBarHeight(value: number, maxValue: number): number {
    if (maxValue === 0) return 0;
    return Math.max((value / maxValue) * 100, 5); // Mínimo 5% para visibilidad
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  getMonthName(month: number): string {
    const monthName = this.months.find(m => m.value === month);
    return monthName ? monthName.label : '';
  }

  // Funciones para resumen de movimientos
  getExpensesTotal(): number {
    if (!this.movements) return 0;
    return this.movements
      .filter(m => m.type === 'Expense')
      .reduce((sum, m) => sum + m.amount, 0);
  }

  getDepositsTotal(): number {
    if (!this.movements) return 0;
    return this.movements
      .filter(m => m.type === 'Deposit')
      .reduce((sum, m) => sum + m.amount, 0);
  }

  getExpensesCount(): number {
    if (!this.movements) return 0;
    return this.movements.filter(m => m.type === 'Expense').length;
  }

  getDepositsCount(): number {
    if (!this.movements) return 0;
    return this.movements.filter(m => m.type === 'Deposit').length;
  }
}
