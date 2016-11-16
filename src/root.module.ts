import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

// root
import { RootComponent } from './root.component';
import { routing } from './root.routes';

// import other modules
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { MainModule } from './main/main.module';

@NgModule({
  imports: [
    routing,
    BrowserModule,
    AuthModule,
    MainModule,
    SharedModule.forRoot()
  ],
  declarations: [
    RootComponent
  ],
  bootstrap: [ RootComponent ]
})
export class RootModule {}
