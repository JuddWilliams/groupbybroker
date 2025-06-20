import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddRecordModalPageRoutingModule } from './add-record-modal-routing.module';

import { AddRecordModalPage } from './add-record-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddRecordModalPageRoutingModule
  ],
  declarations: [AddRecordModalPage]
})
export class AddRecordModalPageModule {}
