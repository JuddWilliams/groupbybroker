import { Component, Input } from '@angular/core';
import { ModalController, IonNav } from '@ionic/angular';
import { Page3Component } from './page3.component';
import { Page4Component } from './page4.component';

@Component({
  selector: 'app-page2',
  templateUrl: './page2.component.html',
  standalone: false,
})
export class Page2Component {
  @Input() record: any = {};

  constructor(private modalCtrl: ModalController, private nav: IonNav) {}

  goToPrevious() {
    this.nav.pop();
  }

  goToNext() {
    console.log('Navigating to Page2 with record:', this.record.name);
    if (this.record.description == 'test') this.nav.push(Page3Component, { record: this.record });
    else this.nav.push(Page4Component, { record: this.record });
  }

  save() {
    this.modalCtrl.dismiss(this.record);
  }
}
