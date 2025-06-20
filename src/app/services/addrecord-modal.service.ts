import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddRecordModalPage } from '../add-record-modal/add-record-modal.page';

@Injectable({ providedIn: 'root' })
export class RecordModalService {
  constructor(private modalController: ModalController) {}

  async openAddRecordModal(componentProps: any = {}): Promise<any> {
    const modal = await this.modalController.create({
      component: AddRecordModalPage,
      componentProps,
    });
    await modal.present();
    const result = await modal.onDidDismiss();
    return result.data;
  }
}
