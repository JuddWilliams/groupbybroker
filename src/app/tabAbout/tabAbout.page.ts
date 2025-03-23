import { Component, OnInit } from '@angular/core';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-tabAbout',
  templateUrl: 'tabAbout.page.html',
  styleUrls: ['tabAbout.page.scss'],
  standalone: false,
})
export class TabAboutPage implements OnInit {
  isPopupOpen = false; // State to control the popup visibility

  constructor(private locationService: LocationService) {}

  async ngOnInit() {
    this.getUserLocationAndCheckPostalCode();
  }

  openPopup() {
    this.isPopupOpen = true; // Open the popup
  }

  closePopup() {
    this.isPopupOpen = false; // Close the popup
  }

  async getUserLocationAndCheckPostalCode() {
    const location = await this.locationService.getUserLocation();
    if (location) {
      const postalCode = await this.locationService.getPostalCodeFromCoordinates(
        location.latitude,
        location.longitude
      );

      console.log(`Postal Code: ${postalCode}`);

      if (postalCode.startsWith('322')) {
        this.locationService.showFreeAlert();
      }
    }
  }
}
