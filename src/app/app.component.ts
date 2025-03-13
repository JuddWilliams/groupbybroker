import { Component } from '@angular/core';

import { Stripe } from '@capacitor-community/stripe';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {
    // Stripe.initialize({
    //   publishableKey: environment.publishableKey,
    // });
    
  }
}

