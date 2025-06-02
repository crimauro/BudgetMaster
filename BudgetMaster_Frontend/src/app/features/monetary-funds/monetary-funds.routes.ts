import { Routes } from '@angular/router';

export const monetaryFundsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./monetary-funds-list/monetary-funds-list.component').then(m => m.MonetaryFundsListComponent)
  }
];
