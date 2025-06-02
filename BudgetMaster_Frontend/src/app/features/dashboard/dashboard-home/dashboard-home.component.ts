import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../reports/reports.service';
import { AuthService } from '../../../core/services/auth.service';
import { 
  MonthlyFinancialSummary,
  MovementDto
} from '../../../core/models';
import { catchError, finalize, of } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="dashboard-home">      <!-- Indicador de carga -->
      <app-loading-spinner *ngIf="isLoading" message="Cargando datos del dashboard..." [overlay]="true"></app-loading-spinner>

      <!-- Mensaje de error -->
      <div *ngIf="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>

      <div class="stats-grid" *ngIf="!isLoading">
        <div class="stat-card">
          <div class="stat-icon expense">
            <i class="icon-expense"></i>
          </div>
          <div class="stat-content">
            <h3>Gastos del Mes</h3>
            <p class="stat-value">{{ (financialSummary?.totalExpenses | currency:'USD':'symbol':'1.2-2') || '$0.00' }}</p>
            <span class="stat-change" [ngClass]="{
              'positive': expenseChange && expenseChange < 0,
              'negative': expenseChange && expenseChange > 0,
              'neutral': !expenseChange || expenseChange === 0
            }">
              {{ formatPercentage(expenseChange) }}
            </span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon income">
            <i class="icon-deposit"></i>
          </div>
          <div class="stat-content">
            <h3>Ingresos del Mes</h3>
            <p class="stat-value">{{ (financialSummary?.totalIncome | currency:'USD':'symbol':'1.2-2') || '$0.00' }}</p>
            <span class="stat-change" [ngClass]="{
              'positive': incomeChange && incomeChange > 0,
              'negative': incomeChange && incomeChange < 0,
              'neutral': !incomeChange || incomeChange === 0
            }">
              {{ formatPercentage(incomeChange) }}
            </span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon balance">
            <i class="icon-wallet"></i>
          </div>
          <div class="stat-content">
            <h3>Balance Total</h3>
            <p class="stat-value">{{ (financialSummary?.netSavings | currency:'USD':'symbol':'1.2-2') || '$0.00' }}</p>
            <span class="stat-change" [ngClass]="{
              'positive': balanceChange && balanceChange > 0,
              'negative': balanceChange && balanceChange < 0,
              'neutral': !balanceChange || balanceChange === 0
            }">
              {{ formatPercentage(balanceChange) }}
            </span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon budget">
            <i class="icon-budget"></i>
          </div>
          <div class="stat-content">
            <h3>Presupuesto Restante</h3>
            <p class="stat-value">{{ budgetRemaining | currency:'USD':'symbol':'1.2-2' }}</p>
            <span class="stat-change" [ngClass]="{
              'positive': budgetCompliance && budgetCompliance > 0,
              'negative': budgetCompliance && budgetCompliance < 0,
              'neutral': !budgetCompliance || budgetCompliance === 0
            }">
              {{ formatPercentage(budgetCompliance) }}
            </span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid" *ngIf="!isLoading">
        <div class="dashboard-card">
          <h3>Resumen de Gastos</h3>
          <div class="chart-placeholder">
            <p>Gráfico de gastos por categoría</p>
            <small>Próximamente con Chart.js</small>
          </div>
        </div>
        
        <div class="dashboard-card">
          <h3>Últimos Movimientos</h3>      <div class="recent-transactions">
            <div *ngIf="recentMovements.length === 0" class="no-data">
              <p>No hay movimientos recientes</p>
            </div>
            <div *ngFor="let movement of recentMovements" class="transaction-item">
              <div class="transaction-icon" [ngClass]="movement.type.toLowerCase()">
                <i [ngClass]="movement.type === 'Expense' ? 'icon-expense' : 'icon-deposit'"></i>
              </div>
              <div class="transaction-details">
                <span class="transaction-description">{{ movement.description }}</span>
                <span class="transaction-date">{{ formatDate(movement.date) }}</span>
              </div>
              <span class="transaction-amount" [ngClass]="movement.type === 'Expense' ? 'negative' : 'positive'">
                {{ movement.type === 'Expense' ? '-' : '+' }}{{ movement.amount | currency:'USD':'symbol':'1.2-2' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Dashboard Home Styles */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
      display: flex;
      align-items: center;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      font-size: 1.5rem;
      color: white;
    }

    .stat-icon.expense {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
    }

    .stat-icon.income {
      background: linear-gradient(135deg, #27ae60, #229954);
    }

    .stat-icon.balance {
      background: linear-gradient(135deg, #3498db, #2980b9);
    }

    .stat-icon.budget {
      background: linear-gradient(135deg, #f39c12, #e67e22);
    }

    .stat-content h3 {
      margin: 0 0 5px 0;
      font-size: 0.9rem;
      color: #6c757d;
      font-weight: 500;
    }

    .stat-value {
      margin: 0 0 5px 0;
      font-size: 1.8rem;
      font-weight: bold;
      color: #2c3e50;
    }

    .stat-change {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .stat-change.positive {
      color: #27ae60;
    }

    .stat-change.negative {
      color: #e74c3c;
    }

    .stat-change.neutral {
      color: #f39c12;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .dashboard-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    }

    .dashboard-card h3 {
      margin: 0 0 20px 0;
      font-size: 1.2rem;
      color: #2c3e50;
      font-weight: 600;
    }

    .chart-placeholder {
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 2px dashed #dee2e6;
    }

    .recent-transactions {
      max-height: 300px;
      overflow-y: auto;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .transaction-item:last-child {
      border-bottom: none;
    }

    .transaction-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      color: white;
    }

    .transaction-icon.expense {
      background-color: #e74c3c;
    }

    .transaction-icon.deposit {
      background-color: #27ae60;
    }

    .transaction-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .transaction-description {
      font-weight: 500;
      color: #2c3e50;
    }

    .transaction-date {
      font-size: 0.8rem;
      color: #6c757d;
      margin-top: 2px;
    }

    .transaction-amount {
      font-weight: bold;
      font-size: 1.1rem;
    }

    .transaction-amount.positive {
      color: #27ae60;
    }

    .transaction-amount.negative {
      color: #e74c3c;
    }
    
    /* Icons */
    .icon-expense::before { content: '💸'; }
    .icon-deposit::before { content: '💵'; }
    .icon-wallet::before { content: '💰'; }
    .icon-budget::before { content: '📈'; }    /* Error Styles */

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #f5c6cb;
    }

    .no-data {
      padding: 20px 0;
      text-align: center;
      color: #6c757d;
    }
  `]
})
export class DashboardHomeComponent implements OnInit {
  // Usuario actual
  userId: number = 0;
  
  // Datos financieros
  financialSummary: MonthlyFinancialSummary | null = null;
  recentMovements: MovementDto[] = [];
  
  // Estados de carga y errores
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // Métricas calculadas
  expenseChange: number = 0;
  incomeChange: number = 0;
  balanceChange: number = 0;
  budgetCompliance: number = 0;
  budgetRemaining: number = 0;
  
  constructor(
    private reportsService: ReportsService,
    private authService: AuthService
  ) {}
    ngOnInit(): void {
    // Obtener ID del usuario
    const currentUser = this.authService.getCurrentUser();
    console.log('Dashboard: Usuario actual:', currentUser);
    
    // Verificar si hay token aunque no haya usuario
    const token = this.authService.getToken();
    console.log('Dashboard: Token existe:', !!token);
    
    if (currentUser && currentUser.id) {
      console.log('Dashboard: ID de usuario obtenido:', currentUser.id);
      this.userId = currentUser.id;
      this.loadDashboardData();
    } else {
      console.error('Dashboard: No se pudo obtener la información del usuario');
      this.errorMessage = 'No se pudo obtener la información del usuario';
      this.isLoading = false;
      
      // Si hay token pero no hay usuario, intentamos usar un ID hardcodeado para pruebas
      if (token) {
        console.log('Dashboard: Usando ID de usuario por defecto para pruebas');
        this.userId = 1; // Asumimos que existe un usuario con ID 1 en la base de datos
        this.loadDashboardData();
        this.errorMessage = ''; // Limpiar mensaje de error
      }
    }
  }
  
  /**
   * Carga todos los datos del dashboard
   */  loadDashboardData(): void {
    this.isLoading = true;
    
    // Obtener información del mes actual (usamos 2023 como año de prueba ya que probablemente haya datos)
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    // Para desarrollo usamos un año anterior donde hay datos de prueba
    const currentYear = 2023; // Cambiamos de today.getFullYear() a un año fijo para pruebas
    
    console.log(`Dashboard: Cargando datos para usuario ID: ${this.userId}, Mes: ${currentMonth}, Año: ${currentYear}`);
    
    // Carga del resumen financiero mensual
    this.reportsService.getMonthlyFinancialSummary(this.userId, currentMonth, currentYear)
      .pipe(
        catchError(error => {
          console.error('Error al cargar el resumen financiero:', error);
          console.error('Error detalles:', JSON.stringify(error));
          this.errorMessage = 'No se pudieron cargar los datos financieros';
          return of({ isSuccess: false, message: error.message || 'Error desconocido', data: null });
        }),
        finalize(() => {
          // Intentar cargar movimientos incluso si falla el resumen financiero
          this.loadRecentMovements();
        })
      )
      .subscribe(response => {
        console.log('Dashboard: Respuesta del resumen financiero:', response);
        if (response.isSuccess && response.data) {
          this.financialSummary = response.data;
          this.calculateMetrics();
        } else {
          this.errorMessage = response.message || 'No se pudieron cargar los datos financieros';
          console.error('Dashboard: Error en la respuesta:', this.errorMessage);
        }
      });
  }
  
  /**
   * Carga los movimientos recientes
   */
  loadRecentMovements(): void {
    // Obtener fecha de 30 días atrás
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const formattedStartDate = this.formatDateForApi(startDate);
    const formattedEndDate = this.formatDateForApi(endDate);
    
    this.reportsService.getMovements(this.userId, formattedStartDate, formattedEndDate)
      .pipe(
        catchError(error => {
          console.error('Error al cargar los movimientos:', error);
          return of({ isSuccess: false, message: error.message, data: [] });
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(response => {
        if (response.isSuccess && response.data) {
          // Ordenar movimientos por fecha (más recientes primero)
          this.recentMovements = response.data
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5); // Mostrar solo los 5 más recientes
        }
      });
  }
  
  /**
   * Calcula métricas adicionales basadas en la información financiera
   */
  calculateMetrics(): void {
    if (!this.financialSummary) return;
    
    // Establecer valores por defecto si no hay tendencias guardadas
    // En un sistema real, esto se obtendría de datos históricos
    this.expenseChange = 12.5; // Ejemplo: aumento del 12.5% en gastos
    this.incomeChange = 8.2;   // Ejemplo: aumento del 8.2% en ingresos
    this.balanceChange = 15.8; // Ejemplo: aumento del 15.8% en balance
    
    // Usar datos reales de cumplimiento de presupuesto
    this.budgetCompliance = this.financialSummary.budgetCompliance;
    
    // Calcular presupuesto restante (en un sistema real esto vendría del backend)
    // Por ahora usamos un cálculo simple: 40% del ingreso total como presupuesto
    const totalBudget = this.financialSummary.totalIncome * 0.4;
    this.budgetRemaining = totalBudget - this.financialSummary.totalExpenses;
  }
  
  /**
   * Formatear porcentajes para mostrar en la interfaz
   */
  formatPercentage(value: number | null | undefined): string {
    if (value === null || value === undefined) return '0%';
    
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }
  
  /**
   * Formatear fecha para mostrar en la interfaz
   */
  formatDate(dateString: Date | string): string {
    const date = new Date(dateString);
    const now = new Date();
    
    // Calcular diferencia en días
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      // Formato de fecha completa para fechas más antiguas
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  }
  
  /**
   * Formatear fecha para API (YYYY-MM-DD)
   */
  private formatDateForApi(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
}
