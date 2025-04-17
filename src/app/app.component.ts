import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonApp, 
    IonRouterOutlet
  ]
})
export class AppComponent {
  appName = environment.appName;
  version = environment.version;

  constructor() {
    this.initializeApp();
  }

  private async initializeApp() {
    try {
      // Set document title
      document.title = this.appName;
      
      // Additional initialization can be added here
      console.log(`${this.appName} v${this.version} initialized`);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
}
