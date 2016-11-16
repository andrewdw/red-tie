import { RouterModule, Routes } from '@angular/router';

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
        component: AccountsComponent
      }
    ]
  }
];

export const routing = RouterModule.forChild(authRoutes);