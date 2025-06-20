import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddRecordModalPageRoutingModule } from './add-record-modal-routing.module';

import { AddRecordModalPage } from './add-record-modal.page';
import { Page1Component } from './page1.component';
import { Page2Component } from './page2.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AddRecordModalPageRoutingModule],
  declarations: [AddRecordModalPage, Page2Component, Page1Component],
})
export class AddRecordModalPageModule {}
