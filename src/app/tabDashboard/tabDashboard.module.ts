import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabDashboardPage } from './tabDashboard.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { TabDashboardPageRoutingModule } from './tabDashboard-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    TabDashboardPageRoutingModule
  ],
  declarations: [TabDashboardPage]
})
export class TabDashboardPageModule {}
