import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import { defineCustomElements } from 'stripe-pwa-elements/loader';

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.log(err));


  platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => defineCustomElements(window))
  .catch(err => console.log(err));
