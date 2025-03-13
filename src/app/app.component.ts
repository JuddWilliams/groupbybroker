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
    Stripe.initialize({
      publishableKey: environment.publishableKey,
      //publishableKey: 'pk_test_51R201MCAHpHjS7C5j6ulXndfq70jcn2lsxJ1BtUo8RrFbOUg2QeP7K8ek7dEV3Sc07WKGY5VAmJYgXVS8fbSVesG001whu6dnD',
    });
    
  }
}

