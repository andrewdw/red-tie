import { NgModule } from '@angular/core';

// component
import { AuthComponent } from './auth.component';
// child components
import { AccountsComponent } from './components/accounts.component';

// shared modules
import { SharedModule } from '../shared/shared.module';

// services
import {
  LoginGuard,
  TwoFactorGuard
} from './auth.guard';

// imports
import { routing } from './auth.routes';

@NgModule({
  imports: [
    routing,
    SharedModule
  ],
  declarations: [
    AuthComponent,
    AccountsComponent
  ],
  providers: [
    LoginGuard,
    TwoFactorGuard
  ]
})
export class AuthModule {}