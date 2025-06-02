import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MonetaryFundsService } from '../monetary-funds.service';
import { MonetaryFund } from '../../../core/models';

@Component({
  selector: 'app-monetary-funds-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="monetary-funds-container">
      <div class="page-header">
        <h1>Fondos Monetarios</h1>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="icon-plus"></i>
          Nuevo Fondo Monetario
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
            (input)="filterMonetaryFunds()"
            placeholder="Buscar por nombre o descripción..."
            class="form-control">
        </div>
        <div class="filter-group">
          <label for="statusFilter">Estado:</label>
          <select 
            id="statusFilter" 
            [(ngModel)]="statusFilter" 
            (change)="filterMonetaryFunds()"
            class="form-control">
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando fondos monetarios...</p>
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
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Balance Actual</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let fund of filteredMonetaryFunds" [class.inactive]="!fund.isActive">
                <td>{{ fund.id }}</td>
                <td>
                  <span class="fund-name">{{ fund.name }}</span>
                </td>
                <td>
                  <span class="description">{{ fund.description || 'Sin descripción' }}</span>
                </td>
                <td>
                  <span class="balance" [class]="getBalanceClass(fund.currentBalance)">
                    {{ formatCurrency(fund.currentBalance) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class]="fund.isActive ? 'active' : 'inactive'">
                    {{ fund.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ formatDate(fund.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      (click)="editMonetaryFund(fund)"
                      title="Editar">
                      <i class="icon-edit"></i>
                    </button>
                    <button 
                      *ngIf="fund.isActive"
                      class="btn btn-sm btn-outline-warning" 
                      (click)="toggleStatus(fund)"
                      title="Desactivar">
                      <i class="icon-disable"></i>
                    </button>
                    <button 
                      *ngIf="!fund.isActive"
                      class="btn btn-sm btn-outline-success" 
                      (click)="toggleStatus(fund)"
                      title="Activar">
                      <i class="icon-enable"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger" 
                      (click)="deleteMonetaryFund(fund)"
                      title="Eliminar">
                      <i class="icon-delete"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredMonetaryFunds.length === 0 && !loading">
                <td colspan="7" class="no-data">
                  No se encontraron fondos monetarios
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Información de resultados -->
      <div class="table-info" *ngIf="!loading">
        <p>Mostrando {{ filteredMonetaryFunds.length }} de {{ monetaryFunds.length }} fondos monetarios</p>
        <p *ngIf="monetaryFunds.length > 0">
          Balance total: <strong>{{ formatCurrency(getTotalBalance()) }}</strong>
        </p>
      </div>
    </div>

    <!-- Modal para crear/editar -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar' : 'Crear' }} Fondo Monetario</h3>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        
        <form [formGroup]="monetaryFundForm" (ngSubmit)="saveMonetaryFund()">
          <div class="modal-body">
            <div class="form-group">
              <label for="name">Nombre *</label>
              <input 
                type="text" 
                id="name" 
                formControlName="name" 
                class="form-control"
                placeholder="Ingrese el nombre del fondo monetario"
                [class.error]="monetaryFundForm.get('name')?.invalid && monetaryFundForm.get('name')?.touched">
              <div *ngIf="monetaryFundForm.get('name')?.invalid && monetaryFundForm.get('name')?.touched" class="error-message">
                <span *ngIf="monetaryFundForm.get('name')?.errors?.['required']">El nombre es requerido</span>
                <span *ngIf="monetaryFundForm.get('name')?.errors?.['maxlength']">El nombre no puede exceder 100 caracteres</span>
              </div>
            </div>

            <div class="form-group">
              <label for="description">Descripción</label>
              <textarea 
                id="description" 
                formControlName="description" 
                class="form-control"
                rows="3"
                placeholder="Descripción opcional del fondo monetario"
                [class.error]="monetaryFundForm.get('description')?.invalid && monetaryFundForm.get('description')?.touched">
              </textarea>
              <div *ngIf="monetaryFundForm.get('description')?.invalid && monetaryFundForm.get('description')?.touched" class="error-message">
                <span *ngIf="monetaryFundForm.get('description')?.errors?.['maxlength']">La descripción no puede exceder 500 caracteres</span>
              </div>
            </div>

            <div class="form-group">
              <label for="initialBalance">Balance Inicial *</label>
              <input 
                type="number" 
                id="initialBalance" 
                formControlName="initialBalance" 
                class="form-control"
                placeholder="0.00"
                step="0.01"
                min="0"
                [class.error]="monetaryFundForm.get('initialBalance')?.invalid && monetaryFundForm.get('initialBalance')?.touched">
              <div *ngIf="monetaryFundForm.get('initialBalance')?.invalid && monetaryFundForm.get('initialBalance')?.touched" class="error-message">
                <span *ngIf="monetaryFundForm.get('initialBalance')?.errors?.['required']">El balance inicial es requerido</span>
                <span *ngIf="monetaryFundForm.get('initialBalance')?.errors?.['min']">El balance no puede ser negativo</span>
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
              [disabled]="monetaryFundForm.invalid || saving">
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
          <p>¿Está seguro que desea eliminar el fondo monetario "<strong>{{ selectedMonetaryFund?.name }}</strong>"?</p>
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
    .monetary-funds-container {
      max-width: 1400px;
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
      grid-template-columns: 2fr 1fr;
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
    }

    .data-table th {
      background-color: #f8f9fa;
      color: #495057;
      font-weight: 600;
      padding: 15px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }

    .data-table td {
      padding: 15px;
      border-bottom: 1px solid #dee2e6;
      vertical-align: middle;
    }

    .data-table tr:hover {
      background-color: #f8f9fa;
    }

    .data-table tr.inactive {
      opacity: 0.6;
    }

    .fund-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .description {
      color: #6c757d;
      font-style: italic;
    }

    .balance {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .balance.positive {
      color: #27ae60;
    }

    .balance.negative {
      color: #e74c3c;
    }

    .balance.zero {
      color: #6c757d;
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
      gap: 8px;
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
      color: #6c757d;
      font-size: 0.875rem;
    }

    .table-info p {
      margin: 5px 0;
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
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: modalSlideIn 0.3s ease;
    }

    .modal-dialog.modal-sm {
      max-width: 400px;
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
    }
  `]
})
export class MonetaryFundsListComponent implements OnInit {
  monetaryFunds: MonetaryFund[] = [];
  filteredMonetaryFunds: MonetaryFund[] = [];
  loading = false;
  error = '';
  
  // Filtros
  searchTerm = '';
  statusFilter = '';
  
  // Modal
  showModal = false;
  isEditing = false;
  monetaryFundForm: FormGroup;
  saving = false;
  formError = '';
  
  // Eliminar
  showDeleteModal = false;
  selectedMonetaryFund: MonetaryFund | null = null;
  deleting = false;

  constructor(
    private monetaryFundsService: MonetaryFundsService,
    private fb: FormBuilder
  ) {
    this.monetaryFundForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadMonetaryFunds();
  }

  loadMonetaryFunds() {
    this.loading = true;
    this.error = '';
    
    this.monetaryFundsService.getAll().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.isSuccess && response.data) {
          this.monetaryFunds = response.data;
          this.filterMonetaryFunds();
        } else {
          this.error = response.message || 'Error al cargar los fondos monetarios';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error de conexión. Por favor, intente de nuevo.';
        console.error('Error loading monetary funds:', error);
      }
    });
  }

  filterMonetaryFunds() {
    this.filteredMonetaryFunds = this.monetaryFunds.filter(fund => {
      const matchesSearch = !this.searchTerm || 
        fund.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (fund.description && fund.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = !this.statusFilter || 
        fund.isActive.toString() === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.monetaryFundForm.reset({ 
      isActive: true,
      initialBalance: 0
    });
    this.formError = '';
    this.showModal = true;
  }

  editMonetaryFund(fund: MonetaryFund) {
    this.isEditing = true;
    this.monetaryFundForm.patchValue({
      name: fund.name,
      description: fund.description,
      initialBalance: fund.initialBalance,
      isActive: fund.isActive
    });
    this.selectedMonetaryFund = fund;
    this.formError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedMonetaryFund = null;
    this.formError = '';
  }

  saveMonetaryFund() {
    if (this.monetaryFundForm.valid) {
      this.saving = true;
      this.formError = '';
      
      const formData = this.monetaryFundForm.value;
      
      const operation = this.isEditing 
        ? this.monetaryFundsService.update(this.selectedMonetaryFund!.id, formData)
        : this.monetaryFundsService.create(formData);
      
      operation.subscribe({
        next: (response) => {
          this.saving = false;
          if (response.isSuccess) {
            this.closeModal();
            this.loadMonetaryFunds();
          } else {
            this.formError = response.message || 'Error al guardar el fondo monetario';
          }
        },
        error: (error) => {
          this.saving = false;
          this.formError = 'Error de conexión. Por favor, intente de nuevo.';
          console.error('Error saving monetary fund:', error);
        }
      });
    }
  }

  deleteMonetaryFund(fund: MonetaryFund) {
    this.selectedMonetaryFund = fund;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedMonetaryFund = null;
  }

  confirmDelete() {
    if (this.selectedMonetaryFund) {
      this.deleting = true;
      
      this.monetaryFundsService.delete(this.selectedMonetaryFund.id).subscribe({
        next: (response) => {
          this.deleting = false;
          if (response.isSuccess) {
            this.closeDeleteModal();
            this.loadMonetaryFunds();
          } else {
            this.error = response.message || 'Error al eliminar el fondo monetario';
          }
        },
        error: (error) => {
          this.deleting = false;
          this.error = 'Error de conexión. Por favor, intente de nuevo.';
          console.error('Error deleting monetary fund:', error);
        }
      });
    }
  }

  toggleStatus(fund: MonetaryFund) {
    const operation = fund.isActive 
      ? this.monetaryFundsService.deactivate(fund.id)
      : this.monetaryFundsService.activate(fund.id);
    
    operation.subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.loadMonetaryFunds();
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

  getTotalBalance(): number {
    return this.monetaryFunds
      .filter(fund => fund.isActive)
      .reduce((total, fund) => total + fund.currentBalance, 0);
  }

  getBalanceClass(balance: number): string {
    if (balance > 0) return 'positive';
    if (balance < 0) return 'negative';
    return 'zero';
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
