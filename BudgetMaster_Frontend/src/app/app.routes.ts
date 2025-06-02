import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'expense-types',
        loadChildren: () => import('./features/expense-types/expense-types.routes').then(m => m.expenseTypesRoutes)
      },
      {
        path: 'monetary-funds',
        loadChildren: () => import('./features/monetary-funds/monetary-funds.routes').then(m => m.monetaryFundsRoutes)
      },
      {
        path: 'budgets',
        loadChildren: () => import('./features/budgets/budgets.routes').then(m => m.budgetsRoutes)
      },
      {
        path: 'expense-records',
        loadChildren: () => import('./features/expense-records/expense-records.routes').then(m => m.expenseRecordsRoutes)
      },
      {
        path: 'deposits',
        loadChildren: () => import('./features/deposits/deposits.routes').then(m => m.depositsRoutes)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.reportsRoutes)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
