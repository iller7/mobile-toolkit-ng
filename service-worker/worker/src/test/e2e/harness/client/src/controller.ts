import {Component} from '@angular/core';

@Component({
  selector: 'controller',
  template: `
 
<!-- Action selection -->
<div>
  <label for="actionSelect">
    Select an action
  </label>
  <select #actionSelect id="actionSelect" (change)="actionSelected($event.target.value)">
    <option disabled selected>...</option>
    <option value="MAKE_REQUEST">Make an HTTP request</option>
    <option value="CACHE_KEYS">Get cache keys</option>
    <option value="SW_CHECK">Check service worker</option>
    <option value="SW_INSTALL">Install service worker</option>
  </select>
  <input id="actionInput" #actionInput [(ngModel)]="action">
  <button id="actionExec" (click)="refresh(actionInput.value)">Exec</button>
</div>

<!-- action configuration -->
<div [ngSwitch]="action">
  <div *ngSwitchWhen="'MAKE_REQUEST'">
    <div>
      <label for="requestUrl">
        Url:
      </label>
      <input #requestUrl id="requestUrl">
    </div>
    <button id="requestAction" (click)="request(requestUrl.value)">Make request</button>
  </div>
  <div *ngSwitchWhen="'SW_INSTALL'">
    <div>
      <label for="workerUrl">
        Worker:
      </label>
      <input #workerUrl id="workerUrl">
    </div>
    <button id="installAction" (click)="installWorker(workerUrl.value)">Install service worker</button>
  </div>
</div>

<pre id="result">{{result}}</pre>
`
})
export class ControllerCmp {
  result: string = '';
  action: string = '';
  
  
  actionSelected(action): void {
    this.action = action;
  }
  
  request(url: string): void {
    fetch(url).then(resp => resp.text()).then(text => {
      this.result = text;
    });
  }
  
  refresh(action) {
    switch (action) {
      case 'CACHE_KEYS':
        this.loadCacheKeys();
        break;
      case 'SW_CHECK':
        this.checkServiceWorker();
        break;
      default:
        this.result = '';
    }
  }
  
  loadCacheKeys(): void {
    let caches = window['caches'];
    caches.keys().then(keys => this.result = JSON.stringify(keys));
  }
  
  installWorker(url): void {
    navigator['serviceWorker'].register(url)
      .then(reg => {
        this.result = JSON.stringify({
          result: {
            scope: reg.scope
          }
        });
      })
      .catch(err => {
        this.result = JSON.stringify({
          error: `${err}`
        })
      });
  }
  
  checkServiceWorker(): void {
    this.result = '';
    navigator['serviceWorker']
      .getRegistrations()
      .then(registrations => {
        console.log(window['Zone'].current);
        return registrations
          .map(reg => {
            return {
              scope: reg.scope,
              active: !!reg.active,
              installing: !!reg.installing,
              waiting: !!reg.waiting
            };
          })
      })
      .then(value => JSON.stringify(value))
      .then(value => {
        this.result = value;
      })
  }
}
