import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <h2 class="logo" *ngIf="!sidebarCollapsed">BudgetMaster</h2>
          <button class="toggle-btn" (click)="toggleSidebar()">
            <i class="icon-menu"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li class="nav-item">
              <a href="#" class="nav-link active" (click)="navigateTo('/dashboard')">
                <i class="icon-dashboard"></i>
                <span *ngIf="!sidebarCollapsed">Dashboard</span>
              </a>
            </li>
            
            <li class="nav-section" *ngIf="!sidebarCollapsed">
              <span class="section-title">Mantenimientos</span>
            </li>
            
            <li class="nav-item">
              <a href="#" class="nav-link" (click)="navigateTo('/expense-types')">
                <i class="icon-category"></i>
                <span *ngIf="!sidebarCollapsed">Tipos de Gasto</span>
              </a>
            </li>
            
            <li class="nav-item">
              <a href="#" class="nav-link" (click)="navigateTo('/monetary-funds')">
                <i class="icon-wallet"></i>
                <span *ngIf="!sidebarCollapsed">Fondos Monetarios</span>
              </a>
            </li>
            
            <li class="nav-item">
              <a href="#" class="nav-link" (click)="navigateTo('/budgets')">
                <i class="icon-budget"></i>
                <span *ngIf="!sidebarCollapsed">Presupuestos</span>
              </a>
            </li>
            
            <li class="nav-section" *ngIf="!sidebarCollapsed">
              <span class="section-title">Movimientos</span>
            </li>
            
            <li class="nav-item">
              <a href="#" class="nav-link" (click)="navigateTo('/expense-records')">
                <i class="icon-expense"></i>
                <span *ngIf="!sidebarCollapsed">Gastos</span>
              </a>
            </li>
            
            <li class="nav-item">
              <a href="#" class="nav-link" (click)="navigateTo('/deposits')">
                <i class="icon-deposit"></i>
                <span *ngIf="!sidebarCollapsed">Depósitos</span>
              </a>
            </li>
            
            <li class="nav-section" *ngIf="!sidebarCollapsed">
              <span class="section-title">Reportes</span>
            </li>
            
            <li class="nav-item">
              <a href="#" class="nav-link" (click)="navigateTo('/reports')">
                <i class="icon-reports"></i>
                <span *ngIf="!sidebarCollapsed">Reportes</span>
              </a>
            </li>
          </ul>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" *ngIf="!sidebarCollapsed">
            <div class="user-avatar">
              <i class="icon-user"></i>
            </div>
            <div class="user-details">
              <span class="username">{{ currentUser?.username }}</span>
              <span class="user-role">Administrador</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()" [title]="sidebarCollapsed ? 'Cerrar Sesión' : ''">
            <i class="icon-logout"></i>
            <span *ngIf="!sidebarCollapsed">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content" [class.sidebar-collapsed]="sidebarCollapsed">
        <header class="main-header">
          <div class="header-content">
            <h1 class="page-title">{{ pageTitle }}</h1>
            <div class="header-actions">
              <div class="user-menu">
                <span class="welcome-text">Bienvenido, {{ currentUser?.firstName }}</span>
              </div>
            </div>
          </div>
        </header>

        <div class="content-area">
          <router-outlet></router-outlet>
          
          <!-- Dashboard Home Content -->
          <div class="dashboard-home" *ngIf="showDashboardHome">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon expense">
                  <i class="icon-expense"></i>
                </div>
                <div class="stat-content">
                  <h3>Gastos del Mes</h3>
                  <p class="stat-value">$1,250.00</p>
                  <span class="stat-change negative">+12.5%</span>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon income">
                  <i class="icon-deposit"></i>
                </div>
                <div class="stat-content">
                  <h3>Ingresos del Mes</h3>
                  <p class="stat-value">$3,500.00</p>
                  <span class="stat-change positive">+8.2%</span>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon balance">
                  <i class="icon-wallet"></i>
                </div>
                <div class="stat-content">
                  <h3>Balance Total</h3>
                  <p class="stat-value">$2,250.00</p>
                  <span class="stat-change positive">+15.8%</span>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon budget">
                  <i class="icon-budget"></i>
                </div>
                <div class="stat-content">
                  <h3>Presupuesto Restante</h3>
                  <p class="stat-value">$750.00</p>
                  <span class="stat-change neutral">-5.2%</span>
                </div>
              </div>
            </div>

            <div class="dashboard-grid">
              <div class="dashboard-card">
                <h3>Resumen de Gastos</h3>
                <div class="chart-placeholder">
                  <p>Gráfico de gastos por categoría</p>
                  <small>Próximamente con Chart.js</small>
                </div>
              </div>
              
              <div class="dashboard-card">
                <h3>Últimos Movimientos</h3>
                <div class="recent-transactions">
                  <div class="transaction-item">
                    <div class="transaction-icon expense">
                      <i class="icon-expense"></i>
                    </div>
                    <div class="transaction-details">
                      <span class="transaction-description">Supermercado</span>
                      <span class="transaction-date">Hoy</span>
                    </div>
                    <span class="transaction-amount negative">-$85.50</span>
                  </div>
                  <div class="transaction-item">
                    <div class="transaction-icon deposit">
                      <i class="icon-deposit"></i>
                    </div>
                    <div class="transaction-details">
                      <span class="transaction-description">Salario</span>
                      <span class="transaction-date">Ayer</span>
                    </div>
                    <span class="transaction-amount positive">+$2,500.00</span>
                  </div>
                  <div class="transaction-item">
                    <div class="transaction-icon expense">
                      <i class="icon-expense"></i>
                    </div>
                    <div class="transaction-details">
                      <span class="transaction-description">Gasolina</span>
                      <span class="transaction-date">2 días</span>
                    </div>
                    <span class="transaction-amount negative">-$45.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      height: 100vh;
      background-color: #f8f9fa;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
      color: white;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 1000;
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid #34495e;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
    }

    .toggle-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      margin: 5px 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: #bdc3c7;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .nav-link:hover,
    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-link i {
      margin-right: 15px;
      font-size: 1.2rem;
      width: 20px;
      text-align: center;
    }

    .nav-section {
      margin: 20px 0 10px 0;
    }

    .section-title {
      font-size: 0.8rem;
      color: #7f8c8d;
      text-transform: uppercase;
      font-weight: bold;
      padding: 0 20px;
    }

    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid #34495e;
    }

    .user-info {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background-color: #3498db;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .username {
      font-weight: bold;
      font-size: 0.9rem;
    }

    .user-role {
      font-size: 0.8rem;
      color: #bdc3c7;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 10px;
      background: none;
      border: 1px solid #e74c3c;
      color: #e74c3c;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background-color: #e74c3c;
      color: white;
    }

    .logout-btn i {
      margin-right: 10px;
    }

    /* Main Content Styles */
    .main-content {
      flex: 1;
      margin-left: 280px;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .main-content.sidebar-collapsed {
      margin-left: 70px;
    }

    .main-header {
      background: white;
      border-bottom: 1px solid #e9ecef;
      padding: 0 30px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 70px;
    }

    .page-title {
      font-size: 1.8rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
    }

    .welcome-text {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .content-area {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }

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
    .icon-menu::before { content: '☰'; }
    .icon-dashboard::before { content: '📊'; }
    .icon-category::before { content: '📂'; }
    .icon-wallet::before { content: '💰'; }
    .icon-budget::before { content: '📈'; }
    .icon-expense::before { content: '💸'; }
    .icon-deposit::before { content: '💵'; }
    .icon-reports::before { content: '📋'; }
    .icon-user::before { content: '👤'; }
    .icon-logout::before { content: '🚪'; }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  sidebarCollapsed = false;
  pageTitle = 'Dashboard';
  currentUser: any;
  showDashboardHome = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  navigateTo(route: string) {
    this.showDashboardHome = route === '/dashboard';
    
    if (route !== '/dashboard') {
      this.router.navigate([route]);
    }
    
    // Update page title based on route
    const titles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/expense-types': 'Tipos de Gasto',
      '/monetary-funds': 'Fondos Monetarios',
      '/budgets': 'Presupuestos',
      '/expense-records': 'Gastos',
      '/deposits': 'Depósitos',
      '/reports': 'Reportes'
    };
    
    this.pageTitle = titles[route] || 'Dashboard';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
