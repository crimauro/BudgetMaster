import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepositsService } from '../deposits.service';
import { MonetaryFundsService } from '../../monetary-funds/monetary-funds.service';
import { AuthService } from '../../../core/services/auth.service';
import { Deposit, MonetaryFund, CreateDepositRequest, UpdateDepositRequest } from '../../../core/models';

@Component({
  selector: 'app-deposits-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="deposits-container">
      <div class="page-header">
        <h1>Depósitos</h1>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="icon-plus"></i>
          Nuevo Depósito
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
            (input)="filterDeposits()"
            placeholder="Buscar por descripción..."
            class="form-control">
        </div>
        <div class="filter-group">
          <label for="monetaryFundFilter">Fondo Monetario:</label>
          <select 
            id="monetaryFundFilter" 
            [(ngModel)]="monetaryFundFilter" 
            (change)="filterDeposits()"
            class="form-control">
            <option value="">Todos los fondos</option>
            <option *ngFor="let fund of monetaryFunds" [value]="fund.id">{{fund.name}}</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="dateFromFilter">Desde:</label>
          <input 
            type="date" 
            id="dateFromFilter" 
            [(ngModel)]="dateFromFilter" 
            (change)="filterDeposits()"
            class="form-control">
        </div>
        <div class="filter-group">
          <label for="dateToFilter">Hasta:</label>
          <input 
            type="date" 
            id="dateToFilter" 
            [(ngModel)]="dateToFilter" 
            (change)="filterDeposits()"
            class="form-control">
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando depósitos...</p>
      </div>

      <!-- Resumen -->
      <div *ngIf="!loading" class="summary-cards">
        <div class="summary-card">
          <div class="summary-icon">
            <i class="icon-deposits"></i>
          </div>
          <div class="summary-content">
            <h3>Total Depósitos</h3>
            <p class="summary-value">{{getTotalDeposits() | currency:'USD':'symbol':'1.2-2'}}</p>
            <span class="summary-count">{{filteredDeposits.length}} registros</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <i class="icon-calendar"></i>
          </div>
          <div class="summary-content">
            <h3>Este Mes</h3>
            <p class="summary-value">{{getMonthlyDeposits() | currency:'USD':'symbol':'1.2-2'}}</p>
            <span class="summary-count">{{getMonthlyCount()}} depósitos</span>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="error-message">
        <i class="icon-alert"></i>
        <span>{{error}}</span>
      </div>

      <!-- Tabla de depósitos -->
      <div *ngIf="!loading && !error" class="table-card">
        <div class="table-header">
          <h3>Lista de Depósitos</h3>
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm" (click)="refreshData()">
              <i class="icon-refresh"></i>
              Actualizar
            </button>
          </div>
        </div>
        
        <div *ngIf="filteredDeposits.length === 0" class="empty-state">
          <i class="icon-empty"></i>
          <h3>No hay depósitos</h3>
          <p>No se encontraron depósitos con los filtros aplicados.</p>
          <button class="btn btn-primary" (click)="openCreateModal()">
            Crear primer depósito
          </button>
        </div>

        <div *ngIf="filteredDeposits.length > 0" class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th (click)="sort('date')" class="sortable">
                  Fecha
                  <i class="icon-sort" [class.icon-sort-up]="sortField === 'date' && sortDirection === 'asc'" 
                     [class.icon-sort-down]="sortField === 'date' && sortDirection === 'desc'"></i>
                </th>
                <th (click)="sort('monetaryFund.name')" class="sortable">
                  Fondo Monetario
                  <i class="icon-sort" [class.icon-sort-up]="sortField === 'monetaryFund.name' && sortDirection === 'asc'" 
                     [class.icon-sort-down]="sortField === 'monetaryFund.name' && sortDirection === 'desc'"></i>
                </th>
                <th (click)="sort('amount')" class="sortable text-right">
                  Monto
                  <i class="icon-sort" [class.icon-sort-up]="sortField === 'amount' && sortDirection === 'asc'" 
                     [class.icon-sort-down]="sortField === 'amount' && sortDirection === 'desc'"></i>
                </th>
                <th>Descripción</th>
                <th>Estado</th>
                <th class="actions-column">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let deposit of paginatedDeposits; trackBy: trackByDepositId" 
                  class="table-row" 
                  [class.inactive]="!deposit.isActive">
                <td>
                  <div class="cell-content">
                    <strong>{{deposit.date | date:'dd/MM/yyyy'}}</strong>
                    <small>{{deposit.date | date:'HH:mm'}}</small>
                  </div>
                </td>
                <td>
                  <div class="cell-content">
                    <span class="fund-name">{{deposit.monetaryFund?.name || 'N/A'}}</span>
                  </div>
                </td>
                <td class="text-right">
                  <span class="amount positive">
                    +{{deposit.amount | currency:'USD':'symbol':'1.2-2'}}
                  </span>
                </td>
                <td>
                  <div class="description-cell">
                    <span class="description-text" 
                          [title]="deposit.description">
                      {{deposit.description | slice:0:50}}{{deposit.description.length > 50 ? '...' : ''}}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" 
                        [class.status-active]="deposit.isActive" 
                        [class.status-inactive]="!deposit.isActive">
                    {{deposit.isActive ? 'Activo' : 'Inactivo'}}
                  </span>
                </td>
                <td class="actions-column">
                  <div class="action-buttons">
                    <button class="btn btn-icon btn-view" 
                            (click)="viewDeposit(deposit)"
                            title="Ver detalles">
                      <i class="icon-eye"></i>
                    </button>
                    <button class="btn btn-icon btn-edit" 
                            (click)="editDeposit(deposit)"
                            [disabled]="!deposit.isActive"
                            title="Editar">
                      <i class="icon-edit"></i>
                    </button>
                    <button class="btn btn-icon btn-delete" 
                            (click)="confirmDelete(deposit)"
                            title="Eliminar">
                      <i class="icon-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div *ngIf="filteredDeposits.length > pageSize" class="pagination">
          <button class="btn btn-pagination" 
                  [disabled]="currentPage === 1" 
                  (click)="goToPage(currentPage - 1)">
            <i class="icon-chevron-left"></i>
            Anterior
          </button>
          
          <div class="pagination-info">
            <span>Página {{currentPage}} de {{totalPages}}</span>
            <span class="total-records">({{filteredDeposits.length}} registros)</span>
          </div>
          
          <button class="btn btn-pagination" 
                  [disabled]="currentPage === totalPages" 
                  (click)="goToPage(currentPage + 1)">
            Siguiente
            <i class="icon-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Modal de crear/editar -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{isEditing ? 'Editar' : 'Crear'}} Depósito</h3>
            <button class="btn btn-icon btn-close" (click)="closeModal()">
              <i class="icon-close"></i>
            </button>
          </div>
          
          <form [formGroup]="depositForm" (ngSubmit)="onSubmit()" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label for="monetaryFundId">Fondo Monetario *</label>
                <select formControlName="monetaryFundId" id="monetaryFundId" class="form-control">
                  <option value="">Selecciona un fondo</option>
                  <option *ngFor="let fund of monetaryFunds" [value]="fund.id">
                    {{fund.name}} - Saldo: {{fund.balance | currency:'USD':'symbol':'1.2-2'}}
                  </option>
                </select>
                <div *ngIf="depositForm.get('monetaryFundId')?.invalid && depositForm.get('monetaryFundId')?.touched" 
                     class="field-error">
                  El fondo monetario es requerido
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="amount">Monto *</label>
                <input type="number" 
                       formControlName="amount" 
                       id="amount" 
                       class="form-control"
                       placeholder="0.00"
                       min="0.01"
                       step="0.01">
                <div *ngIf="depositForm.get('amount')?.invalid && depositForm.get('amount')?.touched" 
                     class="field-error">
                  <span *ngIf="depositForm.get('amount')?.errors?.['required']">
                    El monto es requerido
                  </span>
                  <span *ngIf="depositForm.get('amount')?.errors?.['min']">
                    El monto debe ser mayor a 0
                  </span>
                </div>
              </div>
              <div class="form-group">
                <label for="date">Fecha *</label>
                <input type="datetime-local" 
                       formControlName="date" 
                       id="date" 
                       class="form-control">
                <div *ngIf="depositForm.get('date')?.invalid && depositForm.get('date')?.touched" 
                     class="field-error">
                  La fecha es requerida
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="description">Descripción *</label>
                <textarea formControlName="description" 
                          id="description" 
                          class="form-control"
                          placeholder="Describe el motivo del depósito..."
                          rows="3"
                          maxlength="500"></textarea>
                <div class="character-count">
                  {{depositForm.get('description')?.value?.length || 0}}/500 caracteres
                </div>
                <div *ngIf="depositForm.get('description')?.invalid && depositForm.get('description')?.touched" 
                     class="field-error">
                  <span *ngIf="depositForm.get('description')?.errors?.['required']">
                    La descripción es requerida
                  </span>
                  <span *ngIf="depositForm.get('description')?.errors?.['minlength']">
                    La descripción debe tener al menos 5 caracteres
                  </span>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="submit" 
                      class="btn btn-primary" 
                      [disabled]="depositForm.invalid || submitting">
                <span *ngIf="submitting" class="spinner-sm"></span>
                {{isEditing ? 'Actualizar' : 'Crear'}} Depósito
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación -->
      <div *ngIf="showDeleteModal" class="modal-overlay" (click)="closeDeleteModal()">
        <div class="modal-content modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Confirmar Eliminación</h3>
            <button class="btn btn-icon btn-close" (click)="closeDeleteModal()">
              <i class="icon-close"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="delete-confirmation">
              <i class="icon-warning"></i>
              <p>¿Estás seguro de que deseas eliminar este depósito?</p>
              <div class="deposit-info">
                <strong>Monto: </strong>{{depositToDelete?.amount | currency:'USD':'symbol':'1.2-2'}}<br>
                <strong>Fecha: </strong>{{depositToDelete?.date | date:'dd/MM/yyyy'}}<br>
                <strong>Fondo: </strong>{{depositToDelete?.monetaryFund?.name}}
              </div>
              <p class="warning-text">Esta acción no se puede deshacer.</p>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="closeDeleteModal()">
              Cancelar
            </button>
            <button type="button" 
                    class="btn btn-danger" 
                    (click)="deleteDeposit()"
                    [disabled]="deleting">
              <span *ngIf="deleting" class="spinner-sm"></span>
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de detalles -->
      <div *ngIf="showDetailsModal" class="modal-overlay" (click)="closeDetailsModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Detalles del Depósito</h3>
            <button class="btn btn-icon btn-close" (click)="closeDetailsModal()">
              <i class="icon-close"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div *ngIf="selectedDeposit" class="deposit-details">
              <div class="detail-section">
                <h4>Información General</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Monto:</label>
                    <span class="amount positive">+{{selectedDeposit.amount | currency:'USD':'symbol':'1.2-2'}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Fecha:</label>
                    <span>{{selectedDeposit.date | date:'dd/MM/yyyy HH:mm'}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Fondo Monetario:</label>
                    <span>{{selectedDeposit.monetaryFund?.name}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Estado:</label>
                    <span class="status-badge" 
                          [class.status-active]="selectedDeposit.isActive" 
                          [class.status-inactive]="!selectedDeposit.isActive">
                      {{selectedDeposit.isActive ? 'Activo' : 'Inactivo'}}
                    </span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>Descripción</h4>
                <p class="description-full">{{selectedDeposit.description}}</p>
              </div>

              <div class="detail-section">
                <h4>Información del Sistema</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>ID:</label>
                    <span>{{selectedDeposit.id}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Creado:</label>
                    <span>{{selectedDeposit.createdAt | date:'dd/MM/yyyy HH:mm'}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Actualizado:</label>
                    <span>{{selectedDeposit.updatedAt | date:'dd/MM/yyyy HH:mm'}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="closeDetailsModal()">
              Cerrar
            </button>
            <button type="button" 
                    class="btn btn-primary" 
                    (click)="editDeposit(selectedDeposit!)"
                    [disabled]="!selectedDeposit?.isActive">
              Editar Depósito
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .deposits-container {
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

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
      transition: transform 0.3s ease;
    }

    .summary-card:hover {
      transform: translateY(-2px);
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

    .table-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e9ecef;
    }

    .table-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
    }

    .table-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .table-actions {
      display: flex;
      gap: 0.5rem;
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

    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s ease;
    }

    .data-table th.sortable:hover {
      background: #e9ecef;
    }

    .data-table .text-right {
      text-align: right;
    }

    .table-row {
      transition: all 0.2s ease;
    }

    .table-row:hover {
      background: #f8f9fa;
    }

    .table-row.inactive {
      opacity: 0.6;
    }

    .cell-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .cell-content strong {
      color: #2c3e50;
    }

    .cell-content small {
      color: #6c757d;
      font-size: 0.75rem;
    }

    .fund-name {
      color: #495057;
      font-weight: 500;
    }

    .amount {
      font-weight: 600;
      font-size: 1rem;
    }

    .amount.positive {
      color: #28a745;
    }

    .description-cell {
      max-width: 200px;
    }

    .description-text {
      display: block;
      color: #495057;
      line-height: 1.4;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .actions-column {
      width: 120px;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
      transform: translateY(-1px);
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c82333;
      transform: translateY(-1px);
    }

    .btn-icon {
      padding: 0.5rem;
      min-width: 36px;
      height: 36px;
    }

    .btn-view {
      background: #17a2b8;
      color: white;
    }

    .btn-view:hover:not(:disabled) {
      background: #138496;
    }

    .btn-edit {
      background: #ffc107;
      color: #212529;
    }

    .btn-edit:hover:not(:disabled) {
      background: #e0a800;
    }

    .btn-delete {
      background: #dc3545;
      color: white;
    }

    .btn-delete:hover:not(:disabled) {
      background: #c82333;
    }

    .btn-close {
      background: transparent;
      color: #adb5bd;
      padding: 0.25rem;
    }

    .btn-close:hover {
      color: #6c757d;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .btn-pagination {
      background: white;
      border: 1px solid #dee2e6;
      color: #495057;
    }

    .btn-pagination:hover:not(:disabled) {
      background: #e9ecef;
      border-color: #adb5bd;
    }

    .pagination-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .total-records {
      font-size: 0.75rem;
      color: #6c757d;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-content.modal-sm {
      max-width: 400px;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
      border-radius: 12px 12px 0 0;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-form {
      padding: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 500;
      color: #495057;
      font-size: 0.875rem;
    }

    .character-count {
      font-size: 0.75rem;
      color: #6c757d;
      text-align: right;
    }

    .field-error {
      color: #dc3545;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .modal-actions {
      padding: 1.5rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      background: #f8f9fa;
      border-radius: 0 0 12px 12px;
    }

    .delete-confirmation {
      text-align: center;
      padding: 1rem;
    }

    .delete-confirmation i {
      font-size: 3rem;
      color: #dc3545;
      margin-bottom: 1rem;
    }

    .deposit-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
      text-align: left;
    }

    .warning-text {
      color: #dc3545;
      font-weight: 500;
      margin-top: 1rem;
    }

    .deposit-details {
      padding: 0;
    }

    .detail-section {
      margin-bottom: 2rem;
    }

    .detail-section h4 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 600;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item label {
      font-weight: 500;
      color: #6c757d;
      font-size: 0.875rem;
    }

    .detail-item span {
      color: #2c3e50;
      font-weight: 500;
    }

    .description-full {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin: 0;
      line-height: 1.6;
      color: #495057;
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

    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
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

    /* Iconos CSS (solo algunos básicos) */
    .icon-plus::before { content: '+'; }
    .icon-search::before { content: '🔍'; }
    .icon-filter::before { content: '⚙'; }
    .icon-refresh::before { content: '🔄'; }
    .icon-eye::before { content: '👁'; }
    .icon-edit::before { content: '✏'; }
    .icon-trash::before { content: '🗑'; }
    .icon-close::before { content: '✕'; }
    .icon-warning::before { content: '⚠'; }
    .icon-sort::before { content: '↕'; }
    .icon-sort-up::before { content: '↑'; }
    .icon-sort-down::before { content: '↓'; }
    .icon-chevron-left::before { content: '‹'; }
    .icon-chevron-right::before { content: '›'; }
    .icon-deposits::before { content: '💰'; }
    .icon-calendar::before { content: '📅'; }
    .icon-empty::before { content: '📭'; }
    .icon-alert::before { content: '⚠'; }

    /* Responsive */
    @media (max-width: 768px) {
      .deposits-container {
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

      .form-row {
        grid-template-columns: 1fr;
      }

      .data-table {
        font-size: 0.875rem;
      }

      .data-table th,
      .data-table td {
        padding: 0.75rem 0.5rem;
      }

      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }

      .modal-content {
        margin: 0.5rem;
        max-width: none;
      }

      .pagination {
        flex-direction: column;
        gap: 1rem;
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
export class DepositsListComponent implements OnInit {
  deposits: Deposit[] = [];
  filteredDeposits: Deposit[] = [];
  paginatedDeposits: Deposit[] = [];
  monetaryFunds: MonetaryFund[] = [];
  
  loading = false;
  error = '';
  
  // Filtros
  searchTerm = '';
  monetaryFundFilter = '';
  dateFromFilter = '';
  dateToFilter = '';
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  
  // Ordenamiento
  sortField = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Modal de crear/editar
  showModal = false;
  isEditing = false;
  selectedDeposit: Deposit | null = null;
  depositForm!: FormGroup;
  submitting = false;
  
  // Modal de eliminación
  showDeleteModal = false;
  depositToDelete: Deposit | null = null;
  deleting = false;
  
  // Modal de detalles
  showDetailsModal = false;

  constructor(
    private depositsService: DepositsService,
    private monetaryFundsService: MonetaryFundsService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadData();
  }

  private initializeForm() {
    this.depositForm = this.fb.group({
      monetaryFundId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [this.getCurrentDateTime(), Validators.required],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  private getCurrentDateTime(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }

  loadData() {
    this.loading = true;
    this.error = '';

    Promise.all([
      this.depositsService.getAll().toPromise(),
      this.monetaryFundsService.getAll().toPromise()
    ]).then(([depositsResponse, fundsResponse]) => {
      if (depositsResponse?.isSuccess) {
        this.deposits = depositsResponse.data || [];
        this.filterDeposits();
      } else {
        this.error = depositsResponse?.message || 'Error al cargar depósitos';
      }

      if (fundsResponse?.isSuccess) {
        this.monetaryFunds = (fundsResponse.data || []).filter(f => f.isActive);
      }

      this.loading = false;
    }).catch(error => {
      console.error('Error loading data:', error);
      this.error = 'Error al cargar los datos';
      this.loading = false;
    });
  }

  refreshData() {
    this.loadData();
  }

  filterDeposits() {
    let filtered = [...this.deposits];

    // Filtro de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(deposit =>
        deposit.description.toLowerCase().includes(term)
      );
    }

    // Filtro por fondo monetario
    if (this.monetaryFundFilter) {
      filtered = filtered.filter(deposit =>
        deposit.monetaryFundId.toString() === this.monetaryFundFilter
      );
    }

    // Filtro por fecha desde
    if (this.dateFromFilter) {
      const fromDate = new Date(this.dateFromFilter);
      filtered = filtered.filter(deposit =>
        new Date(deposit.date) >= fromDate
      );
    }

    // Filtro por fecha hasta
    if (this.dateToFilter) {
      const toDate = new Date(this.dateToFilter);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(deposit =>
        new Date(deposit.date) <= toDate
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue: any = this.getNestedProperty(a, this.sortField);
      let bValue: any = this.getNestedProperty(b, this.sortField);

      if (this.sortField === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredDeposits = filtered;
    this.updatePagination();
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredDeposits.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedDeposits = this.filteredDeposits.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filterDeposits();
  }

  trackByDepositId(index: number, deposit: Deposit): number {
    return deposit.id;
  }

  // Cálculos para resumen
  getTotalDeposits(): number {
    return this.filteredDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
  }

  getMonthlyDeposits(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return this.filteredDeposits
      .filter(deposit => {
        const date = new Date(deposit.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, deposit) => sum + deposit.amount, 0);
  }

  getMonthlyCount(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return this.filteredDeposits
      .filter(deposit => {
        const date = new Date(deposit.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;
  }

  // Modal de crear/editar
  openCreateModal() {
    this.isEditing = false;
    this.selectedDeposit = null;
    this.depositForm.reset({
      monetaryFundId: '',
      amount: '',
      date: this.getCurrentDateTime(),
      description: ''
    });
    this.showModal = true;
  }

  editDeposit(deposit: Deposit) {
    this.isEditing = true;
    this.selectedDeposit = deposit;
    
    const depositDate = new Date(deposit.date);
    const formattedDate = depositDate.toISOString().slice(0, 16);
    
    this.depositForm.patchValue({
      monetaryFundId: deposit.monetaryFundId,
      amount: deposit.amount,
      date: formattedDate,
      description: deposit.description
    });
    
    this.showModal = true;
    this.showDetailsModal = false;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.selectedDeposit = null;
    this.depositForm.reset();
  }

  onSubmit() {
    if (this.depositForm.valid && !this.submitting) {
      this.submitting = true;
      
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.error = 'Usuario no autenticado';
        this.submitting = false;
        return;
      }

      const formValue = this.depositForm.value;
      
      if (this.isEditing && this.selectedDeposit) {
        const updateRequest: UpdateDepositRequest = {
          monetaryFundId: parseInt(formValue.monetaryFundId),
          amount: parseFloat(formValue.amount),
          date: new Date(formValue.date),
          description: formValue.description.trim()
        };

        this.depositsService.update(this.selectedDeposit.id, updateRequest).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.loadData();
              this.closeModal();
            } else {
              this.error = response.message;
            }
            this.submitting = false;
          },
          error: (error) => {
            console.error('Error updating deposit:', error);
            this.error = 'Error al actualizar el depósito';
            this.submitting = false;
          }
        });
      } else {
        const createRequest: CreateDepositRequest = {
          userId: currentUser.id,
          monetaryFundId: parseInt(formValue.monetaryFundId),
          amount: parseFloat(formValue.amount),
          date: new Date(formValue.date),
          description: formValue.description.trim()
        };

        this.depositsService.create(createRequest).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.loadData();
              this.closeModal();
            } else {
              this.error = response.message;
            }
            this.submitting = false;
          },
          error: (error) => {
            console.error('Error creating deposit:', error);
            this.error = 'Error al crear el depósito';
            this.submitting = false;
          }
        });
      }
    }
  }

  // Modal de detalles
  viewDeposit(deposit: Deposit) {
    this.selectedDeposit = deposit;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedDeposit = null;
  }

  // Modal de eliminación
  confirmDelete(deposit: Deposit) {
    this.depositToDelete = deposit;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.depositToDelete = null;
  }

  deleteDeposit() {
    if (this.depositToDelete && !this.deleting) {
      this.deleting = true;

      this.depositsService.delete(this.depositToDelete.id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.loadData();
            this.closeDeleteModal();
          } else {
            this.error = response.message;
          }
          this.deleting = false;
        },
        error: (error) => {
          console.error('Error deleting deposit:', error);
          this.error = 'Error al eliminar el depósito';
          this.deleting = false;
        }
      });
    }
  }
}
