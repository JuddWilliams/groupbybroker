import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-record-modal',
  templateUrl: './add-record-modal.page.html',
  styleUrls: ['./add-record-modal.page.scss'],
  standalone: false, // Set to false if this component is part of a module
})
export class AddRecordModalPage implements OnInit {
  record: any = {};
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    this.modalCtrl.dismiss(this.record);
  }
}
