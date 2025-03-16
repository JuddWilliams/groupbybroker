import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabSearchPage } from './tabSearch.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { TabSearchPageRoutingModule } from './tabSearch-routing.module';

import { GoogleMapsModule } from '@angular/google-maps'

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    TabSearchPageRoutingModule,
    GoogleMapsModule
  ],
  declarations: [TabSearchPage]
})
export class TabSearchPageModule {}
