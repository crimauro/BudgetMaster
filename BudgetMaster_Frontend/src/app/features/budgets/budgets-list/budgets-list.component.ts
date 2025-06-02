import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetsService } from '../budgets.service';
import { ExpenseTypesService } from '../../expense-types/expense-types.service';
import { Budget, ExpenseType, ApiResponse } from '../../../core/models';

@Component({
  selector: 'app-budgets-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="budgets-container">
      <div class="page-header">
        <h1>Presupuestos</h1>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="icon-plus"></i>
          Nuevo Presupuesto
        </button>
      </div>

      <!-- Filtros -->
      <div class="filters-card">
        <div class="filter-group">
          <label for="search">Buscar:</label>
          <input 
            type="text" 
            id="search" 
            [(ngModel)]="searchTerm" 
            (input)="filterBudgets()"
            placeholder="Buscar por tipo de gasto..."
            class="form-control">
        </div>
        <div class="filter-group">
          <label for="statusFilter">Estado:</label>
          <select 
            id="statusFilter" 
            [(ngModel)]="statusFilter" 
            (change)="filterBudgets()"
            class="form-control">
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="periodFilter">Período:</label>
          <select 
            id="periodFilter" 
            [(ngModel)]="periodFilter" 
            (change)="filterBudgets()"
            class="form-control">
            <option value="">Todos</option>
            <option value="Monthly">Mensual</option>
            <option value="Quarterly">Trimestral</option>
            <option value="Annual">Anual</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando presupuestos...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="error-alert">
        {{ error }}
      </div>

      <!-- Tabla -->
      <div class="table-card" *ngIf="!loading">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo de Gasto</th>
                <th>Período</th>
                <th>Año</th>
                <th>Mes</th>
                <th>Monto Asignado</th>
                <th>Monto Gastado</th>
                <th>Disponible</th>
                <th>% Ejecución</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let budget of filteredBudgets" [class.inactive]="!budget.isActive">
                <td>{{ budget.id }}</td>
                <td>
                  <span class="expense-type-name">{{ getExpenseTypeName(budget.expenseTypeId) }}</span>
                </td>
                <td>
                  <span class="period-badge" [class]="'period-' + budget.period.toLowerCase()">
                    {{ getPeriodName(budget.period) }}
                  </span>
                </td>
                <td>{{ budget.year }}</td>
                <td>{{ budget.month || '-' }}</td>
                <td>
                  <span class="amount assigned">{{ formatCurrency(budget.assignedAmount) }}</span>
                </td>
                <td>
                  <span class="amount spent">{{ formatCurrency(budget.spentAmount) }}</span>
                </td>
                <td>
                  <span class="amount" [class]="getAvailableClass(budget.assignedAmount - budget.spentAmount)">
                    {{ formatCurrency(budget.assignedAmount - budget.spentAmount) }}
                  </span>
                </td>
                <td>
                  <div class="execution-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" 
                           [style.width.%]="getExecutionPercentage(budget)"
                           [class]="getProgressClass(getExecutionPercentage(budget))">
                      </div>
                    </div>
                    <span class="percentage" [class]="getProgressClass(getExecutionPercentage(budget))">
                      {{ getExecutionPercentage(budget) }}%
                    </span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [class]="budget.isActive ? 'active' : 'inactive'">
                    {{ budget.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      (click)="editBudget(budget)"
                      title="Editar">
                      <i class="icon-edit"></i>
                    </button>
                    <button 
                      *ngIf="budget.isActive"
                      class="btn btn-sm btn-outline-warning" 
                      (click)="toggleStatus(budget)"
                      title="Desactivar">
                      <i class="icon-disable"></i>
                    </button>
                    <button 
                      *ngIf="!budget.isActive"
                      class="btn btn-sm btn-outline-success" 
                      (click)="toggleStatus(budget)"
                      title="Activar">
                      <i class="icon-enable"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger" 
                      (click)="deleteBudget(budget)"
                      title="Eliminar">
                      <i class="icon-delete"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredBudgets.length === 0 && !loading">
                <td colspan="11" class="no-data">
                  No se encontraron presupuestos
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Información de resultados -->
      <div class="table-info" *ngIf="!loading">
        <div class="info-stats">
          <p>Mostrando {{ filteredBudgets.length }} de {{ budgets.length }} presupuestos</p>
          <div class="totals" *ngIf="budgets.length > 0">
            <span>Total Asignado: <strong>{{ formatCurrency(getTotalAssigned()) }}</strong></span>
            <span>Total Gastado: <strong>{{ formatCurrency(getTotalSpent()) }}</strong></span>
            <span>Total Disponible: <strong [class]="getAvailableClass(getTotalAvailable())">{{ formatCurrency(getTotalAvailable()) }}</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar' : 'Crear' }} Presupuesto</h3>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        
        <form [formGroup]="budgetForm" (ngSubmit)="saveBudget()">
          <div class="modal-body">
            <div class="form-group">
              <label for="expenseTypeId">Tipo de Gasto *</label>
              <select 
                id="expenseTypeId" 
                formControlName="expenseTypeId" 
                class="form-control"
                [class.error]="budgetForm.get('expenseTypeId')?.invalid && budgetForm.get('expenseTypeId')?.touched">
                <option value="">Seleccione un tipo de gasto</option>
                <option *ngFor="let expenseType of expenseTypes" [value]="expenseType.id">
                  {{ expenseType.name }}
                </option>
              </select>
              <div *ngIf="budgetForm.get('expenseTypeId')?.invalid && budgetForm.get('expenseTypeId')?.touched" class="error-message">
                <span *ngIf="budgetForm.get('expenseTypeId')?.errors?.['required']">El tipo de gasto es requerido</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="period">Período *</label>
                <select 
                  id="period" 
                  formControlName="period" 
                  class="form-control"
                  (change)="onPeriodChange()"
                  [class.error]="budgetForm.get('period')?.invalid && budgetForm.get('period')?.touched">
                  <option value="">Seleccione período</option>
                  <option value="Monthly">Mensual</option>
                  <option value="Quarterly">Trimestral</option>
                  <option value="Annual">Anual</option>
                </select>
                <div *ngIf="budgetForm.get('period')?.invalid && budgetForm.get('period')?.touched" class="error-message">
                  <span *ngIf="budgetForm.get('period')?.errors?.['required']">El período es requerido</span>
                </div>
              </div>

              <div class="form-group">
                <label for="year">Año *</label>
                <input 
                  type="number" 
                  id="year" 
                  formControlName="year" 
                  class="form-control"
                  placeholder="2025"
                  min="2020"
                  max="2030"
                  [class.error]="budgetForm.get('year')?.invalid && budgetForm.get('year')?.touched">
                <div *ngIf="budgetForm.get('year')?.invalid && budgetForm.get('year')?.touched" class="error-message">
                  <span *ngIf="budgetForm.get('year')?.errors?.['required']">El año es requerido</span>
                  <span *ngIf="budgetForm.get('year')?.errors?.['min'] || budgetForm.get('year')?.errors?.['max']">El año debe estar entre 2020 y 2030</span>
                </div>
              </div>
            </div>

            <div class="form-group" *ngIf="showMonthField">
              <label for="month">Mes *</label>
              <select 
                id="month" 
                formControlName="month" 
                class="form-control"
                [class.error]="budgetForm.get('month')?.invalid && budgetForm.get('month')?.touched">
                <option value="">Seleccione mes</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
              <div *ngIf="budgetForm.get('month')?.invalid && budgetForm.get('month')?.touched" class="error-message">
                <span *ngIf="budgetForm.get('month')?.errors?.['required']">El mes es requerido para presupuestos mensuales</span>
              </div>
            </div>

            <div class="form-group">
              <label for="assignedAmount">Monto Asignado *</label>
              <input 
                type="number" 
                id="assignedAmount" 
                formControlName="assignedAmount" 
                class="form-control"
                placeholder="0.00"
                step="0.01"
                min="0"
                [class.error]="budgetForm.get('assignedAmount')?.invalid && budgetForm.get('assignedAmount')?.touched">
              <div *ngIf="budgetForm.get('assignedAmount')?.invalid && budgetForm.get('assignedAmount')?.touched" class="error-message">
                <span *ngIf="budgetForm.get('assignedAmount')?.errors?.['required']">El monto asignado es requerido</span>
                <span *ngIf="budgetForm.get('assignedAmount')?.errors?.['min']">El monto no puede ser negativo</span>
              </div>
            </div>

            <div class="form-group" *ngIf="isEditing">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="isActive"
                  class="checkbox">
                <span class="checkmark"></span>
                Activo
              </label>
            </div>

            <div *ngIf="formError" class="error-alert">
              {{ formError }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="budgetForm.invalid || saving">
              <span *ngIf="saving">Guardando...</span>
              <span *ngIf="!saving">{{ isEditing ? 'Actualizar' : 'Crear' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="closeDeleteModal()">
      <div class="modal-dialog modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
          <button class="close-btn" (click)="closeDeleteModal()">×</button>
        </div>
        
        <div class="modal-body">
          <p>¿Está seguro que desea eliminar este presupuesto?</p>
          <div class="budget-details" *ngIf="selectedBudget">
            <p><strong>Tipo:</strong> {{ getExpenseTypeName(selectedBudget.expenseTypeId) }}</p>
            <p><strong>Período:</strong> {{ getPeriodName(selectedBudget.period) }} {{ selectedBudget.year }}</p>
            <p><strong>Monto:</strong> {{ formatCurrency(selectedBudget.assignedAmount) }}</p>
          </div>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeDeleteModal()">
            Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-danger"
            [disabled]="deleting"
            (click)="confirmDelete()">
            <span *ngIf="deleting">Eliminando...</span>
            <span *ngIf="!deleting">Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .budgets-container {
      max-width: 1600px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .page-header h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 2rem;
      font-weight: 600;
    }

    .filters-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
      margin-bottom: 25px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 20px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group label {
      margin-bottom: 8px;
      font-weight: 600;
      color: #374151;
    }

    .table-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 1200px;
    }

    .data-table th {
      background-color: #f8f9fa;
      color: #495057;
      font-weight: 600;
      padding: 15px 10px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
      white-space: nowrap;
    }

    .data-table td {
      padding: 15px 10px;
      border-bottom: 1px solid #dee2e6;
      vertical-align: middle;
    }

    .data-table tr:hover {
      background-color: #f8f9fa;
    }

    .data-table tr.inactive {
      opacity: 0.6;
    }

    .expense-type-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .period-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .period-badge.period-monthly {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .period-badge.period-quarterly {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .period-badge.period-annual {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .amount {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .amount.assigned {
      color: #2c3e50;
    }

    .amount.spent {
      color: #e74c3c;
    }

    .amount.positive {
      color: #27ae60;
    }

    .amount.negative {
      color: #e74c3c;
    }

    .amount.zero {
      color: #6c757d;
    }

    .execution-progress {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .progress-bar {
      width: 60px;
      height: 8px;
      background-color: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .progress-fill.good {
      background-color: #28a745;
    }

    .progress-fill.warning {
      background-color: #ffc107;
    }

    .progress-fill.danger {
      background-color: #dc3545;
    }

    .percentage {
      font-size: 0.8rem;
      font-weight: 600;
      min-width: 35px;
    }

    .percentage.good {
      color: #28a745;
    }

    .percentage.warning {
      color: #e67e22;
    }

    .percentage.danger {
      color: #dc3545;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-badge.active {
      background-color: #d4edda;
      color: #155724;
    }

    .status-badge.inactive {
      background-color: #f8d7da;
      color: #721c24;
    }

    .action-buttons {
      display: flex;
      gap: 6px;
    }

    .no-data {
      text-align: center;
      color: #6c757d;
      font-style: italic;
      padding: 40px;
    }

    .table-info {
      padding: 15px 25px;
      background: white;
      border-top: 1px solid #dee2e6;
    }

    .info-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #6c757d;
      font-size: 0.875rem;
    }

    .totals {
      display: flex;
      gap: 20px;
    }

    .totals span {
      white-space: nowrap;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-alert {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-dialog {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      animation: modalSlideIn 0.3s ease;
    }

    .modal-dialog.modal-sm {
      max-width: 450px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 25px;
      border-bottom: 1px solid #dee2e6;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6c757d;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #495057;
    }

    .modal-body {
      padding: 25px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px 25px;
      border-top: 1px solid #dee2e6;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 5px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: normal;
    }

    .checkbox {
      margin-right: 10px;
    }

    .budget-details {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }

    .budget-details p {
      margin: 5px 0;
    }

    .warning-text {
      color: #e74c3c;
      font-size: 0.875rem;
      margin: 10px 0 0 0;
    }

    /* Button Styles */
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #5a6268;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #c82333;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn-outline-primary {
      background-color: transparent;
      color: #667eea;
      border: 1px solid #667eea;
    }

    .btn-outline-primary:hover {
      background-color: #667eea;
      color: white;
    }

    .btn-outline-warning {
      background-color: transparent;
      color: #f39c12;
      border: 1px solid #f39c12;
    }

    .btn-outline-warning:hover {
      background-color: #f39c12;
      color: white;
    }

    .btn-outline-success {
      background-color: transparent;
      color: #27ae60;
      border: 1px solid #27ae60;
    }

    .btn-outline-success:hover {
      background-color: #27ae60;
      color: white;
    }

    .btn-outline-danger {
      background-color: transparent;
      color: #dc3545;
      border: 1px solid #dc3545;
    }

    .btn-outline-danger:hover {
      background-color: #dc3545;
      color: white;
    }

    /* Icons */
    .icon-plus::before { content: '+'; }
    .icon-edit::before { content: '✏️'; }
    .icon-delete::before { content: '🗑️'; }
    .icon-disable::before { content: '⏸️'; }
    .icon-enable::before { content: '▶️'; }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .filters-card {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 768px) {
      .filters-card {
        grid-template-columns: 1fr;
      }

      .page-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .action-buttons {
        flex-wrap: wrap;
      }

      .modal-dialog {
        margin: 10px;
        width: calc(100% - 20px);
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .info-stats {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }

      .totals {
        flex-direction: column;
        gap: 5px;
      }
    }
  `]
})
export class BudgetsListComponent implements OnInit {
  budgets: Budget[] = [];
  filteredBudgets: Budget[] = [];
  expenseTypes: ExpenseType[] = [];
  loading = false;
  error = '';
  
  // Filtros
  searchTerm = '';
  statusFilter = '';
  periodFilter = '';
  
  // Modal
  showModal = false;
  isEditing = false;
  budgetForm: FormGroup;
  saving = false;
  formError = '';
  showMonthField = false;
  
  // Eliminar
  showDeleteModal = false;
  selectedBudget: Budget | null = null;
  deleting = false;

  constructor(
    private budgetsService: BudgetsService,
    private expenseTypesService: ExpenseTypesService,
    private fb: FormBuilder
  ) {
    this.budgetForm = this.fb.group({
      expenseTypeId: ['', [Validators.required]],
      period: ['', [Validators.required]],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2020), Validators.max(2030)]],
      month: [null],
      assignedAmount: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadBudgets();
    this.loadExpenseTypes();
  }

  loadBudgets() {
    this.loading = true;
    this.error = '';
    
    this.budgetsService.getAll().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.isSuccess && response.data) {
          this.budgets = response.data;
          this.filterBudgets();
        } else {
          this.error = response.message || 'Error al cargar los presupuestos';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error de conexión. Por favor, intente de nuevo.';
        console.error('Error loading budgets:', error);
      }
    });
  }
  loadExpenseTypes() {
    this.expenseTypesService.getAllExpenseTypes().subscribe({
      next: (response: ApiResponse<ExpenseType[]>) => {
        if (response.isSuccess && response.data) {
          this.expenseTypes = response.data.filter((et: ExpenseType) => et.isActive);
        }
      },
      error: (error: any) => {
        console.error('Error loading expense types:', error);
      }
    });
  }

  filterBudgets() {
    this.filteredBudgets = this.budgets.filter(budget => {
      const expenseTypeName = this.getExpenseTypeName(budget.expenseTypeId);
      const matchesSearch = !this.searchTerm || 
        expenseTypeName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || 
        budget.isActive.toString() === this.statusFilter;
      
      const matchesPeriod = !this.periodFilter || 
        budget.period === this.periodFilter;
      
      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }

  onPeriodChange() {
    const period = this.budgetForm.get('period')?.value;
    this.showMonthField = period === 'Monthly';
    
    if (this.showMonthField) {
      this.budgetForm.get('month')?.setValidators([Validators.required]);
    } else {
      this.budgetForm.get('month')?.clearValidators();
      this.budgetForm.get('month')?.setValue(null);
    }
    this.budgetForm.get('month')?.updateValueAndValidity();
  }

  openCreateModal() {
    this.isEditing = false;
    this.budgetForm.reset({ 
      isActive: true,
      year: new Date().getFullYear(),
      assignedAmount: 0
    });
    this.showMonthField = false;
    this.formError = '';
    this.showModal = true;
  }

  editBudget(budget: Budget) {
    this.isEditing = true;
    this.budgetForm.patchValue({
      expenseTypeId: budget.expenseTypeId,
      period: budget.period,
      year: budget.year,
      month: budget.month,
      assignedAmount: budget.assignedAmount,
      isActive: budget.isActive
    });
    this.showMonthField = budget.period === 'Monthly';
    this.onPeriodChange(); // Actualizar validaciones
    this.selectedBudget = budget;
    this.formError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedBudget = null;
    this.formError = '';
    this.showMonthField = false;
  }

  saveBudget() {
    if (this.budgetForm.valid) {
      this.saving = true;
      this.formError = '';
      
      const formData = this.budgetForm.value;
      
      const operation = this.isEditing 
        ? this.budgetsService.update(this.selectedBudget!.id, formData)
        : this.budgetsService.create(formData);
      
      operation.subscribe({
        next: (response) => {
          this.saving = false;
          if (response.isSuccess) {
            this.closeModal();
            this.loadBudgets();
          } else {
            this.formError = response.message || 'Error al guardar el presupuesto';
          }
        },
        error: (error) => {
          this.saving = false;
          this.formError = 'Error de conexión. Por favor, intente de nuevo.';
          console.error('Error saving budget:', error);
        }
      });
    }
  }

  deleteBudget(budget: Budget) {
    this.selectedBudget = budget;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedBudget = null;
  }

  confirmDelete() {
    if (this.selectedBudget) {
      this.deleting = true;
      
      this.budgetsService.delete(this.selectedBudget.id).subscribe({
        next: (response) => {
          this.deleting = false;
          if (response.isSuccess) {
            this.closeDeleteModal();
            this.loadBudgets();
          } else {
            this.error = response.message || 'Error al eliminar el presupuesto';
          }
        },
        error: (error) => {
          this.deleting = false;
          this.error = 'Error de conexión. Por favor, intente de nuevo.';
          console.error('Error deleting budget:', error);
        }
      });
    }
  }

  toggleStatus(budget: Budget) {
    const operation = budget.isActive 
      ? this.budgetsService.deactivate(budget.id)
      : this.budgetsService.activate(budget.id);
    
    operation.subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.loadBudgets();
        } else {
          this.error = response.message || 'Error al cambiar el estado';
        }
      },
      error: (error) => {
        this.error = 'Error de conexión. Por favor, intente de nuevo.';
        console.error('Error toggling status:', error);
      }
    });
  }

  getExpenseTypeName(expenseTypeId: number): string {
    const expenseType = this.expenseTypes.find(et => et.id === expenseTypeId);
    return expenseType ? expenseType.name : 'Tipo no encontrado';
  }

  getPeriodName(period: string): string {
    const periods: { [key: string]: string } = {
      'Monthly': 'Mensual',
      'Quarterly': 'Trimestral',
      'Annual': 'Anual'
    };
    return periods[period] || period;
  }

  getExecutionPercentage(budget: Budget): number {
    if (budget.assignedAmount === 0) return 0;
    return Math.round((budget.spentAmount / budget.assignedAmount) * 100);
  }

  getProgressClass(percentage: number): string {
    if (percentage <= 75) return 'good';
    if (percentage <= 90) return 'warning';
    return 'danger';
  }

  getAvailableClass(amount: number): string {
    if (amount > 0) return 'positive';
    if (amount < 0) return 'negative';
    return 'zero';
  }

  getTotalAssigned(): number {
    return this.budgets
      .filter(budget => budget.isActive)
      .reduce((total, budget) => total + budget.assignedAmount, 0);
  }

  getTotalSpent(): number {
    return this.budgets
      .filter(budget => budget.isActive)
      .reduce((total, budget) => total + budget.spentAmount, 0);
  }

  getTotalAvailable(): number {
    return this.getTotalAssigned() - this.getTotalSpent();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  }
}
