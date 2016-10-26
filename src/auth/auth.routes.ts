import { RouterModule, Routes } from '@angular/router';

// import auth guard and service
import {
  LoginGuard,
  TwoFactorGuard
} from './auth.guard';

// main component
import { AuthComponent } from './auth.component';
// children
import { AccountsComponent } from './components/accounts.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'accounts',
        component: AccountsComponent,
        // canActivate: [LoginGuard]
      }
    ]
  }
];

export const routing = RouterModule.forChild(authRoutes);