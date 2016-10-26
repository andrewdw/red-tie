import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { HttpModule } from '@angular/http';

import { HttpService } from './services/http.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  exports: [
    CommonModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    HttpService
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      // register AuthService and Time here as an application-wide singleton
      providers: [
        AuthService
      ]
    };
  }
}