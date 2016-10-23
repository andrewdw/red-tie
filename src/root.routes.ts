import { Routes, RouterModule } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/accounts',
    pathMatch: 'full'
  }
];

// electron has issues with the native html5 routing, so we ass # in front of all urls
export const routing = RouterModule.forRoot(appRoutes, { useHash: true });