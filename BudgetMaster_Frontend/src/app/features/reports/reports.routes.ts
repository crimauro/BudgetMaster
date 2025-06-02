import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const reportsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports-list/reports-list.component').then(m => m.ReportsListComponent),
    canActivate: [authGuard]
  }
];
