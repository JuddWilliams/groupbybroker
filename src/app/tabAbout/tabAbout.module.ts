import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabAboutPage } from './tabAbout.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { TabAboutPageRoutingModule } from './tabAbout-routing.module';

import { GoogleMapsModule } from '@angular/google-maps'

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    TabAboutPageRoutingModule,
    GoogleMapsModule
  ],
  declarations: [TabAboutPage]
})
export class TabAboutPageModule {}
