import { Routes } from '@angular/router';

export const budgetsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./budgets-list/budgets-list.component').then(m => m.BudgetsListComponent)
  }
];
