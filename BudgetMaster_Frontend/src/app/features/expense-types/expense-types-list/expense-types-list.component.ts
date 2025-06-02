import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseTypesService } from '../expense-types.service';
import { ExpenseType, ApiResponse } from '../../../core/models';

@Component({
  selector: 'app-expense-types-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="expense-types-container">
      <div class="page-header">
        <h1>Tipos de Gasto</h1>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="icon-plus"></i>
          Nuevo Tipo de Gasto
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
            (input)="filterExpenseTypes()"
            placeholder="Buscar por nombre o descripción..."
            class="form-control">
        </div>
        <div class="filter-group">
          <label for="statusFilter">Estado:</label>
          <select 
            id="statusFilter" 
            [(ngModel)]="statusFilter" 
            (change)="filterExpenseTypes()"
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
        <p>Cargando tipos de gasto...</p>
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
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let expenseType of filteredExpenseTypes" [class.inactive]="!expenseType.isActive">
                <td>{{ expenseType.id }}</td>
                <td>
                  <span class="expense-type-name">{{ expenseType.name }}</span>
                </td>
                <td>
                  <span class="description">{{ expenseType.description || 'Sin descripción' }}</span>
                </td>
                <td>
                  <span class="status-badge" [class]="expenseType.isActive ? 'active' : 'inactive'">
                    {{ expenseType.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ formatDate(expenseType.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      (click)="editExpenseType(expenseType)"
                      title="Editar">
                      <i class="icon-edit"></i>
                    </button>
                    <button 
                      *ngIf="expenseType.isActive"
                      class="btn btn-sm btn-outline-warning" 
                      (click)="toggleStatus(expenseType)"
                      title="Desactivar">
                      <i class="icon-disable"></i>
                    </button>
                    <button 
                      *ngIf="!expenseType.isActive"
                      class="btn btn-sm btn-outline-success" 
                      (click)="toggleStatus(expenseType)"
                      title="Activar">
                      <i class="icon-enable"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger" 
                      (click)="deleteExpenseType(expenseType)"
                      title="Eliminar">
                      <i class="icon-delete"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredExpenseTypes.length === 0 && !loading">
                <td colspan="6" class="no-data">
                  No se encontraron tipos de gasto
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Información de resultados -->
      <div class="table-info" *ngIf="!loading">
        <p>Mostrando {{ filteredExpenseTypes.length }} de {{ expenseTypes.length }} tipos de gasto</p>
      </div>
    </div>

    <!-- Modal para crear/editar -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar' : 'Crear' }} Tipo de Gasto</h3>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        
        <form [formGroup]="expenseTypeForm" (ngSubmit)="saveExpenseType()">
          <div class="modal-body">
            <div class="form-group">
              <label for="name">Nombre *</label>
              <input 
                type="text" 
                id="name" 
                formControlName="name" 
                class="form-control"
                placeholder="Ingrese el nombre del tipo de gasto"
                [class.error]="expenseTypeForm.get('name')?.invalid && expenseTypeForm.get('name')?.touched">
              <div *ngIf="expenseTypeForm.get('name')?.invalid && expenseTypeForm.get('name')?.touched" class="error-message">
                <span *ngIf="expenseTypeForm.get('name')?.errors?.['required']">El nombre es requerido</span>
                <span *ngIf="expenseTypeForm.get('name')?.errors?.['maxlength']">El nombre no puede exceder 100 caracteres</span>
              </div>
            </div>

            <div class="form-group">
              <label for="description">Descripción</label>
              <textarea 
                id="description" 
                formControlName="description" 
                class="form-control"
                rows="3"
                placeholder="Descripción opcional del tipo de gasto"
                [class.error]="expenseTypeForm.get('description')?.invalid && expenseTypeForm.get('description')?.touched">
              </textarea>
              <div *ngIf="expenseTypeForm.get('description')?.invalid && expenseTypeForm.get('description')?.touched" class="error-message">
                <span *ngIf="expenseTypeForm.get('description')?.errors?.['maxlength']">La descripción no puede exceder 500 caracteres</span>
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
              [disabled]="expenseTypeForm.invalid || saving">
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
          <p>¿Está seguro que desea eliminar el tipo de gasto "<strong>{{ selectedExpenseType?.name }}</strong>"?</p>
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
    .expense-types-container {
      max-width: 1200px;
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

    .expense-type-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .description {
      color: #6c757d;
      font-style: italic;
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
export class ExpenseTypesListComponent implements OnInit {
  expenseTypes: ExpenseType[] = [];
  filteredExpenseTypes: ExpenseType[] = [];
  loading = false;
  error = '';
  
  // Filtros
  searchTerm = '';
  statusFilter = '';
    // Modal
  showModal = false;
  isEditing = false;
  expenseTypeForm: FormGroup;
  saving = false;
  formError = '';
  
  // Eliminar
  showDeleteModal = false;
  selectedExpenseType: ExpenseType | null = null;
  deleting = false;

  constructor(
    private expenseTypesService: ExpenseTypesService,
    private fb: FormBuilder
  ) {
    this.expenseTypeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadExpenseTypes();
  }

  loadExpenseTypes() {
    this.loading = true;
    this.error = '';    this.expenseTypesService.getAllExpenseTypes().subscribe({
      next: (response: ApiResponse<ExpenseType[]>) => {
        this.loading = false;
        if (response.isSuccess && response.data) {
          this.expenseTypes = response.data;
          this.filterExpenseTypes();
        } else {
          this.error = response.message || 'Error al cargar los tipos de gasto';
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.error = 'Error de conexión. Por favor, intente de nuevo.';
        console.error('Error loading expense types:', error);
      }
    });
  }

  filterExpenseTypes() {
    this.filteredExpenseTypes = this.expenseTypes.filter(expenseType => {
      const matchesSearch = !this.searchTerm || 
        expenseType.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (expenseType.description && expenseType.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = !this.statusFilter || 
        expenseType.isActive.toString() === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.expenseTypeForm.reset({ isActive: true });
    this.formError = '';
    this.showModal = true;
  }

  editExpenseType(expenseType: ExpenseType) {
    this.isEditing = true;
    this.expenseTypeForm.patchValue({
      name: expenseType.name,
      description: expenseType.description,
      isActive: expenseType.isActive
    });
    this.selectedExpenseType = expenseType;
    this.formError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedExpenseType = null;
    this.formError = '';
  }

  saveExpenseType() {
    if (this.expenseTypeForm.valid) {
      this.saving = true;
      this.formError = '';
      
      const formData = this.expenseTypeForm.value;
        const operation = this.isEditing 
        ? this.expenseTypesService.updateExpenseType(this.selectedExpenseType!.id, formData)
        : this.expenseTypesService.createExpenseType(formData);
      
      operation.subscribe({
        next: (response: ApiResponse<ExpenseType>) => {
          this.saving = false;
          if (response.isSuccess) {
            this.closeModal();
            this.loadExpenseTypes();
          } else {
            this.formError = response.message || 'Error al guardar el tipo de gasto';
          }
        },
        error: (error: any) => {
          this.saving = false;
          this.formError = 'Error de conexión. Por favor, intente de nuevo.';
          console.error('Error saving expense type:', error);
        }
      });
    }
  }

  deleteExpenseType(expenseType: ExpenseType) {
    this.selectedExpenseType = expenseType;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedExpenseType = null;
  }

  confirmDelete() {
    if (this.selectedExpenseType) {
      this.deleting = true;
        this.expenseTypesService.deleteExpenseType(this.selectedExpenseType.id).subscribe({
        next: (response: ApiResponse<any>) => {
          this.deleting = false;
          if (response.isSuccess) {
            this.closeDeleteModal();
            this.loadExpenseTypes();
          } else {
            this.error = response.message || 'Error al eliminar el tipo de gasto';
          }
        },
        error: (error: any) => {
          this.deleting = false;
          this.error = 'Error de conexión. Por favor, intente de nuevo.';
          console.error('Error deleting expense type:', error);
        }
      });
    }
  }
  toggleStatus(expenseType: ExpenseType) {
    // Temporalmente deshabilitado hasta implementar en el servicio
    console.log('Toggle status for:', expenseType);
    /*
    const operation = expenseType.isActive
      ? this.expenseTypesService.deactivate(expenseType.id)
      : this.expenseTypesService.activate(expenseType.id);
    
    operation.subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.isSuccess) {
          this.loadExpenseTypes();
        } else {
          this.error = response.message || 'Error al cambiar el estado';
        }
      },
      error: (error: any) => {
        this.error = 'Error de conexión. Por favor, intente de nuevo.';
        console.error('Error toggling status:', error);
      }
    });
    */
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
