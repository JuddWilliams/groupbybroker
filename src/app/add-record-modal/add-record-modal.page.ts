import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonNav, ModalController } from '@ionic/angular';
import { Page1Component } from './page1.component';

@Component({
  selector: 'app-add-record-modal',
  templateUrl: './add-record-modal.page.html',
  styleUrls: ['./add-record-modal.page.scss'],
  standalone: false, // Set to false if this component is part of a module
})
export class AddRecordModalPage implements OnInit {
  @Input() addresses: string | undefined; // is also passed to page1
  record: any = {}; // also passed to page1
  page1 = Page1Component;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    console.log('AddRecordModalPage initialized with inputData.addresses:', this.addresses);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    this.modalCtrl.dismiss(this.record);
  }
}
