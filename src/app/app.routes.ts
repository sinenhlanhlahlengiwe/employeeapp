import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'employee-details',
    loadComponent: () => import('./employee-details/employee-details.page').then(m => m.EmployeeDetailsPage)
  },
  {
    path: 'employee-details/:id',
    loadComponent: () => import('./employee-details/employee-details.page').then(m => m.EmployeeDetailsPage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];