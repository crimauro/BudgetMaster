import { Routes } from '@angular/router';

export const expenseRecordsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./expense-records-list/expense-records-list.component').then(m => m.ExpenseRecordsListComponent)
  }
];
