import { Component, Input } from '@angular/core';
import { ModalController, IonNav } from '@ionic/angular';

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

  save() {
    this.modalCtrl.dismiss(this.record);
  }
}
