import { Component, Input } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { Page2Component } from './page2.component';

@Component({
  selector: 'app-page1',
  templateUrl: './page1.component.html',
  standalone: false,
})
export class Page1Component {
  @Input() record: any = {};

  constructor(private nav: IonNav) {}

  getAddresses() {
    return [
      {
        street: '4322 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
      },
    ];
  }

  claimAddress(address: any) {
    console.log('Claiming address:', address);
    this.record.city = address.city;
    this.record.street = address.street;
  }

  goToNext() {
    this.nav.push(Page2Component, { record: this.record });
  }
}
