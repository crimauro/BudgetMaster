import { Routes } from '@angular/router';

export const expenseTypesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./expense-types-list/expense-types-list.component').then(m => m.ExpenseTypesListComponent)
  }
];
