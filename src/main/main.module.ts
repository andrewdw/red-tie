import {
  NgModule
} from '@angular/core';

// SERVICES
import { AuthGuard } from '../auth/auth.guard';

// main component
import { MainComponent } from './main.component';

// imports
import { routing } from './main.routes';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    routing,
    SharedModule
  ],
  declarations: [
    MainComponent,
  ],
  exports: [],
  providers: [
    AuthGuard
  ]
})
export class MainModule {}