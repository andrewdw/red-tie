import { RouterModule, Routes } from '@angular/router';

// import auth guard and service
import { AuthGuard } from '../auth/auth.guard';

// main page wrapper
import { MainComponent } from './main.component';

export const pageRoutes: Routes = [
  {
    path: 'main',
    component: MainComponent,
    canActivate: [AuthGuard]
  }
];

export const routing = RouterModule.forChild(pageRoutes);