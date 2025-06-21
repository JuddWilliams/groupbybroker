import { Component, Input } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { Page2Component } from './page2.component';
import { Page3Component } from './page3.component';

@Component({
  selector: 'app-page1',
  templateUrl: './page1.component.html',
  standalone: false,
})
export class Page1Component {
  @Input() record: any = {};
  @Input() addresses: any | undefined;

  constructor(private nav: IonNav) {}

  ngOnInit() {
    console.log('Addresses passed:', this.addresses);
  }

  getAddresses() {
    return this.addresses;
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
