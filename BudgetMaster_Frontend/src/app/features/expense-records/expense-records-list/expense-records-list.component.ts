import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ExpenseRecordsService } from '../expense-records.service';
import { ExpenseTypesService } from '../../expense-types/expense-types.service';
import { MonetaryFundsService } from '../../monetary-funds/monetary-funds.service';
import { ExpenseRecord, ExpenseDetail, ExpenseType, MonetaryFund, ApiResponse } from '../../../core/models';

@Component({
  selector: 'app-expense-records-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="expense-records-container">
      <div class="page-header">
        <h1>Registros de Gastos</h1>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="icon-plus"></i>
          Nuevo Registro de Gasto
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
            (input)="filterExpenseRecords()"
            placeholder="Buscar por descripción o referencia..."
            class="form-control">
        </div>
        <div class="filter-group">
          <label for="dateFrom">Fecha Desde:</label>
          <input 
            type="date" 
            id="dateFrom" 
            [(ngModel)]="dateFrom" 
            (change)="filterExpenseRecords()"
            class="form-control">
        </div>
        <div class="filter-group">
          <label for="dateTo">Fecha Hasta:</label>
          <input 
            type="date" 
            id="dateTo" 
            [(ngModel)]="dateTo" 
            (change)="filterExpenseRecords()"
            class="form-control">
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando registros de gastos...</p>
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
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Referencia</th>
                <th>Fondo</th>
                <th>Total</th>
                <th>Items</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let record of filteredExpenseRecords">
                <td>{{ record.id }}</td>
                <td>{{ formatDate(record.expenseDate) }}</td>
                <td>
                  <span class="description">{{ record.description }}</span>
                </td>
                <td>
                  <span class="reference">{{ record.reference || '-' }}</span>
                </td>
                <td>
                  <span class="fund-name">{{ getMonetaryFundName(record.monetaryFundId) }}</span>
                </td>
                <td>
                  <span class="total-amount">{{ formatCurrency(record.totalAmount) }}</span>
                </td>
                <td>
                  <span class="items-count">{{ record.details?.length || 0 }} item(s)</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn btn-sm btn-outline-info" 
                      (click)="viewRecord(record)"
                      title="Ver Detalles">
                      <i class="icon-view"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      (click)="editRecord(record)"
                      title="Editar">
                      <i class="icon-edit"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger" 
                      (click)="deleteRecord(record)"
                      title="Eliminar">
                      <i class="icon-delete"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredExpenseRecords.length === 0 && !loading">
                <td colspan="8" class="no-data">
                  No se encontraron registros de gastos
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Información de resultados -->
      <div class="table-info" *ngIf="!loading">
        <div class="info-stats">
          <p>Mostrando {{ filteredExpenseRecords.length }} de {{ expenseRecords.length }} registros</p>
          <div class="totals" *ngIf="expenseRecords.length > 0">
            <span>Total Gastos: <strong>{{ formatCurrency(getTotalAmount()) }}</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar' : 'Crear' }} Registro de Gasto</h3>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        
        <form [formGroup]="expenseRecordForm" (ngSubmit)="saveExpenseRecord()">
          <div class="modal-body">
            <!-- Información general -->
            <div class="section-title">Información General</div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="expenseDate">Fecha *</label>
                <input 
                  type="date" 
                  id="expenseDate" 
                  formControlName="expenseDate" 
                  class="form-control"
                  [class.error]="expenseRecordForm.get('expenseDate')?.invalid && expenseRecordForm.get('expenseDate')?.touched">
                <div *ngIf="expenseRecordForm.get('expenseDate')?.invalid && expenseRecordForm.get('expenseDate')?.touched" class="error-message">
                  <span *ngIf="expenseRecordForm.get('expenseDate')?.errors?.['required']">La fecha es requerida</span>
                </div>
              </div>

              <div class="form-group">
                <label for="monetaryFundId">Fondo Monetario *</label>
                <select 
                  id="monetaryFundId" 
                  formControlName="monetaryFundId" 
                  class="form-control"
                  [class.error]="expenseRecordForm.get('monetaryFundId')?.invalid && expenseRecordForm.get('monetaryFundId')?.touched">
                  <option value="">Seleccione un fondo</option>
                  <option *ngFor="let fund of monetaryFunds" [value]="fund.id">
                    {{ fund.name }} - {{ formatCurrency(fund.currentBalance) }}
                  </option>
                </select>
                <div *ngIf="expenseRecordForm.get('monetaryFundId')?.invalid && expenseRecordForm.get('monetaryFundId')?.touched" class="error-message">
                  <span *ngIf="expenseRecordForm.get('monetaryFundId')?.errors?.['required']">El fondo monetario es requerido</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="description">Descripción *</label>
              <input 
                type="text" 
                id="description" 
                formControlName="description" 
                class="form-control"
                placeholder="Descripción del gasto"
                [class.error]="expenseRecordForm.get('description')?.invalid && expenseRecordForm.get('description')?.touched">
              <div *ngIf="expenseRecordForm.get('description')?.invalid && expenseRecordForm.get('description')?.touched" class="error-message">
                <span *ngIf="expenseRecordForm.get('description')?.errors?.['required']">La descripción es requerida</span>
                <span *ngIf="expenseRecordForm.get('description')?.errors?.['maxlength']">La descripción no puede exceder 200 caracteres</span>
              </div>
            </div>

            <div class="form-group">
              <label for="reference">Referencia</label>
              <input 
                type="text" 
                id="reference" 
                formControlName="reference" 
                class="form-control"
                placeholder="Número de factura, recibo, etc."
                [class.error]="expenseRecordForm.get('reference')?.invalid && expenseRecordForm.get('reference')?.touched">
              <div *ngIf="expenseRecordForm.get('reference')?.invalid && expenseRecordForm.get('reference')?.touched" class="error-message">
                <span *ngIf="expenseRecordForm.get('reference')?.errors?.['maxlength']">La referencia no puede exceder 100 caracteres</span>
              </div>
            </div>

            <!-- Detalles -->
            <div class="section-title">
              Detalles del Gasto
              <button type="button" class="btn btn-sm btn-outline-primary" (click)="addDetail()">
                <i class="icon-plus"></i>
                Agregar Item
              </button>
            </div>

            <div formArrayName="details" class="details-section">
              <div *ngFor="let detail of details.controls; let i = index" [formGroupName]="i" class="detail-item">
                <div class="detail-header">
                  <span>Item {{ i + 1 }}</span>
                  <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeDetail(i)">
                    <i class="icon-delete"></i>
                  </button>
                </div>
                
                <div class="detail-form">
                  <div class="form-group">
                    <label>Tipo de Gasto *</label>
                    <select formControlName="expenseTypeId" class="form-control">
                      <option value="">Seleccione tipo</option>
                      <option *ngFor="let type of expenseTypes" [value]="type.id">
                        {{ type.name }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label>Descripción *</label>
                    <input type="text" formControlName="description" class="form-control" placeholder="Descripción del item">
                  </div>
                  
                  <div class="form-group">
                    <label>Cantidad *</label>
                    <input type="number" formControlName="quantity" class="form-control" placeholder="1" min="1" step="1">
                  </div>
                  
                  <div class="form-group">
                    <label>Precio Unitario *</label>
                    <input type="number" formControlName="unitPrice" class="form-control" placeholder="0.00" min="0" step="0.01">
                  </div>
                  
                  <div class="form-group">
                    <label>Subtotal</label>
                    <input type="text" [value]="formatCurrency(getDetailSubtotal(i))" class="form-control" readonly>
                  </div>
                </div>
              </div>
              
              <div *ngIf="details.length === 0" class="no-details">
                No hay items agregados. Haga clic en "Agregar Item" para comenzar.
              </div>
            </div>

            <!-- Total -->
            <div class="total-section">
              <div class="total-display">
                <strong>Total: {{ formatCurrency(getTotalFromForm()) }}</strong>
              </div>
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
              [disabled]="expenseRecordForm.invalid || saving || details.length === 0">
              <span *ngIf="saving">Guardando...</span>
              <span *ngIf="!saving">{{ isEditing ? 'Actualizar' : 'Crear' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de vista -->
    <div class="modal-overlay" *ngIf="showViewModal" (click)="closeViewModal()">
      <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Detalles del Registro de Gasto</h3>
          <button class="close-btn" (click)="closeViewModal()">×</button>
        </div>
        
        <div class="modal-body" *ngIf="selectedExpenseRecord">
          <div class="view-section">
            <h4>Información General</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>ID:</label>
                <span>{{ selectedExpenseRecord.id }}</span>
              </div>
              <div class="info-item">
                <label>Fecha:</label>
                <span>{{ formatDate(selectedExpenseRecord.expenseDate) }}</span>
              </div>
              <div class="info-item">
                <label>Descripción:</label>
                <span>{{ selectedExpenseRecord.description }}</span>
              </div>
              <div class="info-item">
                <label>Referencia:</label>
                <span>{{ selectedExpenseRecord.reference || '-' }}</span>
              </div>
              <div class="info-item">
                <label>Fondo Monetario:</label>
                <span>{{ getMonetaryFundName(selectedExpenseRecord.monetaryFundId) }}</span>
              </div>
              <div class="info-item">
                <label>Total:</label>
                <span class="total-amount">{{ formatCurrency(selectedExpenseRecord.totalAmount) }}</span>
              </div>
            </div>
          </div>

          <div class="view-section">
            <h4>Detalles ({{ selectedExpenseRecord.details?.length || 0 }} items)</h4>
            <div class="details-table" *ngIf="selectedExpenseRecord.details && selectedExpenseRecord.details.length > 0">
              <table class="table">
                <thead>
                  <tr>
                    <th>Tipo de Gasto</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let detail of selectedExpenseRecord.details">
                    <td>{{ getExpenseTypeName(detail.expenseTypeId) }}</td>
                    <td>{{ detail.description }}</td>
                    <td>{{ detail.quantity }}</td>
                    <td>{{ formatCurrency(detail.unitPrice) }}</td>
                    <td>{{ formatCurrency(detail.quantity * detail.unitPrice) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeViewModal()">
            Cerrar
          </button>
        </div>
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
          <p>¿Está seguro que desea eliminar este registro de gasto?</p>
          <div class="record-details" *ngIf="selectedExpenseRecord">
            <p><strong>Fecha:</strong> {{ formatDate(selectedExpenseRecord.expenseDate) }}</p>
            <p><strong>Descripción:</strong> {{ selectedExpenseRecord.description }}</p>
            <p><strong>Total:</strong> {{ formatCurrency(selectedExpenseRecord.totalAmount) }}</p>
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
    .expense-records-container {
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
      min-width: 1000px;
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

    .description {
      font-weight: 600;
      color: #2c3e50;
    }

    .reference {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .fund-name {
      color: #667eea;
      font-weight: 500;
    }

    .total-amount {
      font-weight: 600;
      color: #e74c3c;
      font-size: 1.1rem;
    }

    .items-count {
      color: #6c757d;
      font-size: 0.9rem;
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

    .modal-dialog.modal-lg {
      max-width: 900px;
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

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 25px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-title:first-child {
      margin-top: 0;
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

    /* Details Section */
    .details-section {
      margin: 20px 0;
    }

    .detail-item {
      background-color: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .detail-header span {
      font-weight: 600;
      color: #495057;
    }

    .detail-form {
      display: grid;
      grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
      gap: 15px;
    }

    .no-details {
      text-align: center;
      color: #6c757d;
      font-style: italic;
      padding: 30px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .total-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
    }

    .total-display {
      text-align: right;
      font-size: 1.2rem;
      color: #2c3e50;
    }

    /* View Modal */
    .view-section {
      margin-bottom: 30px;
    }

    .view-section h4 {
      color: #2c3e50;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #dee2e6;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .info-item {
      display: flex;
      gap: 10px;
    }

    .info-item label {
      font-weight: 600;
      color: #6c757d;
      min-width: 120px;
    }

    .info-item span {
      color: #2c3e50;
    }

    .details-table {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th,
    .table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }

    .table th {
      background-color: #f8f9fa;
      font-weight: 600;
    }

    .record-details {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }

    .record-details p {
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

    .btn-outline-info {
      background-color: transparent;
      color: #17a2b8;
      border: 1px solid #17a2b8;
    }

    .btn-outline-info:hover {
      background-color: #17a2b8;
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
    .icon-view::before { content: '👁️'; }

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

      .detail-form {
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

      .detail-form {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .info-stats {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }
    }
  `]
})
export class ExpenseRecordsListComponent implements OnInit {
  expenseRecords: ExpenseRecord[] = [];
  filteredExpenseRecords: ExpenseRecord[] = [];
  expenseTypes: ExpenseType[] = [];
  monetaryFunds: MonetaryFund[] = [];
  loading = false;
  error = '';
  
  // Filtros
  searchTerm = '';
  dateFrom = '';
  dateTo = '';
  
  // Modal principal
  showModal = false;
  isEditing = false;
  expenseRecordForm: FormGroup;
  saving = false;
  formError = '';
  
  // Modal de vista
  showViewModal = false;
  
  // Eliminar
  showDeleteModal = false;
  selectedExpenseRecord: ExpenseRecord | null = null;
  deleting = false;

  constructor(
    private expenseRecordsService: ExpenseRecordsService,
    private expenseTypesService: ExpenseTypesService,
    private monetaryFundsService: MonetaryFundsService,
    private fb: FormBuilder
  ) {
    this.expenseRecordForm = this.fb.group({
      expenseDate: [new Date().toISOString().split('T')[0], [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      reference: ['', [Validators.maxLength(100)]],
      monetaryFundId: ['', [Validators.required]],
      details: this.fb.array([])
    });
  }

  get details() {
    return this.expenseRecordForm.get('details') as FormArray;
  }

  ngOnInit() {
    this.loadExpenseRecords();
    this.loadExpenseTypes();
    this.loadMonetaryFunds();
  }

  loadExpenseRecords() {
    this.loading = true;
    this.error = '';
    
    this.expenseRecordsService.getAll().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.isSuccess && response.data) {
          this.expenseRecords = response.data;
          this.filterExpenseRecords();
        } else {
          this.error = response.message || 'Error al cargar los registros de gastos';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error de conexión. Por favor, intente de nuevo.';
        console.error('Error loading expense records:', error);
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

  loadMonetaryFunds() {
    this.monetaryFundsService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.monetaryFunds = response.data.filter(mf => mf.isActive);
        }
      },
      error: (error) => {
        console.error('Error loading monetary funds:', error);
      }
    });
  }

  filterExpenseRecords() {
    this.filteredExpenseRecords = this.expenseRecords.filter(record => {
      const matchesSearch = !this.searchTerm || 
        record.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (record.reference && record.reference.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const recordDate = new Date(record.expenseDate);
      const matchesDateFrom = !this.dateFrom || recordDate >= new Date(this.dateFrom);
      const matchesDateTo = !this.dateTo || recordDate <= new Date(this.dateTo);
      
      return matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }

  addDetail() {
    const detailGroup = this.fb.group({
      expenseTypeId: ['', [Validators.required]],
      description: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
    
    this.details.push(detailGroup);
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
  }

  getDetailSubtotal(index: number): number {
    const detail = this.details.at(index);
    const quantity = detail.get('quantity')?.value || 0;
    const unitPrice = detail.get('unitPrice')?.value || 0;
    return quantity * unitPrice;
  }

  getTotalFromForm(): number {
    return this.details.controls.reduce((total, control, index) => {
      return total + this.getDetailSubtotal(index);
    }, 0);
  }

  openCreateModal() {
    this.isEditing = false;
    this.expenseRecordForm.reset({
      expenseDate: new Date().toISOString().split('T')[0]
    });
    this.details.clear();
    this.addDetail(); // Agregar un detalle por defecto
    this.formError = '';
    this.showModal = true;
  }  editRecord(record: ExpenseRecord) {
    this.isEditing = true;
    const dateValue = record.expenseDate ? new Date(record.expenseDate).toISOString().split('T')[0] : '';
    this.expenseRecordForm.patchValue({
      expenseDate: dateValue,
      description: record.description,
      reference: record.reference,
      monetaryFundId: record.monetaryFundId
    });
    
    this.details.clear();
    if (record.details) {
      record.details.forEach(detail => {
        const detailGroup = this.fb.group({
          expenseTypeId: [detail.expenseTypeId, [Validators.required]],
          description: [detail.description, [Validators.required]],
          quantity: [detail.quantity, [Validators.required, Validators.min(1)]],
          unitPrice: [detail.unitPrice, [Validators.required, Validators.min(0)]]
        });
        this.details.push(detailGroup);
      });
    }
    
    this.selectedExpenseRecord = record;
    this.formError = '';
    this.showModal = true;
  }

  viewRecord(record: ExpenseRecord) {
    this.selectedExpenseRecord = record;
    this.showViewModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedExpenseRecord = null;
    this.formError = '';
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedExpenseRecord = null;
  }

  saveExpenseRecord() {
    if (this.expenseRecordForm.valid && this.details.length > 0) {
      this.saving = true;
      this.formError = '';
      
      const formData = {
        ...this.expenseRecordForm.value,
        totalAmount: this.getTotalFromForm()
      };
      
      const operation = this.isEditing 
        ? this.expenseRecordsService.update(this.selectedExpenseRecord!.id, formData)
        : this.expenseRecordsService.create(formData);
      
      operation.subscribe({
        next: (response) => {
          this.saving = false;
          if (response.isSuccess) {
            this.closeModal();
            this.loadExpenseRecords();
          } else {
            this.formError = response.message || 'Error al guardar el registro de gasto';
          }
        },
        error: (error) => {
          this.saving = false;
          this.formError = 'Error de conexión. Por favor, intente de nuevo.';
          console.error('Error saving expense record:', error);
        }
      });
    }
  }

  deleteRecord(record: ExpenseRecord) {
    this.selectedExpenseRecord = record;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedExpenseRecord = null;
  }

  confirmDelete() {
    if (this.selectedExpenseRecord) {
      this.deleting = true;
      
      this.expenseRecordsService.delete(this.selectedExpenseRecord.id).subscribe({
        next: (response) => {
          this.deleting = false;
          if (response.isSuccess) {
            this.closeDeleteModal();
            this.loadExpenseRecords();
          } else {
            this.error = response.message || 'Error al eliminar el registro de gasto';
          }
        },
        error: (error) => {
          this.deleting = false;
          this.error = 'Error de conexión. Por favor, intente de nuevo.';
          console.error('Error deleting expense record:', error);
        }
      });
    }
  }

  getExpenseTypeName(expenseTypeId: number): string {
    const expenseType = this.expenseTypes.find(et => et.id === expenseTypeId);
    return expenseType ? expenseType.name : 'Tipo no encontrado';
  }

  getMonetaryFundName(monetaryFundId: number): string {
    const fund = this.monetaryFunds.find(mf => mf.id === monetaryFundId);
    return fund ? fund.name : 'Fondo no encontrado';
  }

  getTotalAmount(): number {
    return this.expenseRecords.reduce((total, record) => total + record.totalAmount, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  }
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }
}
