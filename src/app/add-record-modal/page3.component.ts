import { Component, Input } from '@angular/core';
import { ModalController, IonNav } from '@ionic/angular';
import { Page4Component } from './page4.component';

@Component({
  selector: 'app-page3',
  templateUrl: './page3.component.html',
  standalone: false,
})
export class Page3Component {
  @Input() record: any = {};

  constructor(private modalCtrl: ModalController, private nav: IonNav) {}

  goToPrevious() {
    this.nav.pop();
  }

  goToNext() {
    this.nav.push(Page4Component, { record: this.record });
  }

  save() {
    this.modalCtrl.dismiss(this.record);
  }
}
