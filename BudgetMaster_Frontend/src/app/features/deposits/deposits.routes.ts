import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const depositsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./deposits-list/deposits-list.component').then(m => m.DepositsListComponent),
    canActivate: [authGuard]
  }
];
