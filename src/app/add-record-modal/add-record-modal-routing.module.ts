import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddRecordModalPage } from './add-record-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AddRecordModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddRecordModalPageRoutingModule {}
