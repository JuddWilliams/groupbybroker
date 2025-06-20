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

  goToNext() {
    this.nav.push(Page2Component, { record: this.record });
  }
}
