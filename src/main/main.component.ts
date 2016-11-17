import {
  Component,
  ViewEncapsulation,
  Pipe,
  PipeTransform,
  AfterViewInit
} from '@angular/core';

import { Http } from '@angular/http';

const { remote } = require('electron')
let { BrowserWindow } = remote;

// todo
// - get angular to see the webview object through a child component
// - try to see if if can invoke it entirely within angular
// - try accessing webview's api from the component

@Component({
  template: `
    <h2>Main Component</h2>
     <div id="foo"></div>
     <a [routerLink]="['/auth/accounts']">accounts</a>
  `,
  encapsulation: ViewEncapsulation.Emulated,
  styles: [
    require('./main.component.scss')
  ]
})
export class MainComponent implements AfterViewInit {
  ready = true;
  constructor(
    private http: Http
  ) {
    console.log('MAIN COMPONENT ACTIVATE')
    // this.open()
    // this.getWebPage('http://phirelight.com/').subscribe((d) => {
    //   console.log(d)
    //   var iframe = document.getElementById('foo'),
    //   iframedoc = iframe.contentDocument || iframe.contentWindow.document;
    //   iframedoc.body.innerHTML = d._body;
    //   console.log(d._body)
    // })
  }
  ngAfterViewInit() {
    var webview:any = document.createElement("webview")
    webview.className = "webview-content";
    webview.src = "http://phirelight.com/";
    console.log(webview)


    var parent = document.getElementById("foo")
    parent.appendChild(webview);

      // setTimeout(function(){
      //   webview.loadURL('http://google.ca')
      // },5000)
      // if (parent.classList)
      //   parent.classList.add(className);
      // else
      //   parent.className += ' ' + className;
  }
  open() {
    let win = new BrowserWindow(
      {
        width: 800,
        height: 600,
        allowDisplayingInsecureContent: true,
        allowRunningInsecureContent: true
      }
    )
    win.on('closed', () => {
      win = null
    })

    // Load a remote URL
    win.loadURL('http://phirelight.com')
  }
  getWebPage(url:string) {
    return this.http.get(url)
  }
}