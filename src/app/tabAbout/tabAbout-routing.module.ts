import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabAboutPage } from './tabAbout.page';

const routes: Routes = [
  {
    path: '',
    component: TabAboutPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabAboutPageRoutingModule {}
