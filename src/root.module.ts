import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { rootComponent } from './root.component';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    rootComponent
  ],
  bootstrap: [ rootComponent ]
})
export class rootModule { }
