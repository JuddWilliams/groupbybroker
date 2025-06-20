import { Component, OnInit, ViewChild } from '@angular/core';
import { IonNav, ModalController } from '@ionic/angular';
import { Page1Component } from './page1.component';
//import { Page1Component } from './page1.component';

@Component({
  selector: 'app-add-record-modal',
  templateUrl: './add-record-modal.page.html',
  styleUrls: ['./add-record-modal.page.scss'],
  standalone: false, // Set to false if this component is part of a module
})
export class AddRecordModalPage implements OnInit {
  //@ViewChild('nav') private nav!: IonNav;
  record: any = {};
  page1 = Page1Component;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  // onWillPresent() {
  //   this.nav.setRoot(Page1Component);
  // }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    this.modalCtrl.dismiss(this.record);
  }
}
