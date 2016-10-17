import { Routes, RouterModule } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/accounts',
    pathMatch: 'full'
  }
];

export const routing = RouterModule.forRoot(appRoutes, { useHash: true });