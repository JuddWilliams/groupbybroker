import { Component, OnInit } from '@angular/core';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-tabAbout',
  templateUrl: 'tabAbout.page.html',
  styleUrls: ['tabAbout.page.scss'],
  standalone: false,
})
export class TabAboutPage implements OnInit {
  numberOfContractorsInArea: number = 11; 
  readonly numberOfContractorsInAreaThreshold: number = 5;
  isPopupOpen = false; 
  locationNote: string = ''; 

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

        // Validate that postalCode is a numeric value
      if (postalCode && /^\d+$/.test(postalCode)) {    

        if (postalCode.startsWith('322') ) {// if postal code AND if below threshold
          if (this.numberOfContractorsInArea < this.numberOfContractorsInAreaThreshold)
          { 
            this.locationNote = `Good news, as we expand to new markets it's free for your postal code ${postalCode}.`; // Update button text
            this.locationService.showFreeAlert();
          }
          else 
          {
            this.locationNote = `*There are ${this.numberOfContractorsInArea} other Contractors using our service in this area.`; 
          }         
        }
        else // if postal code AND if below threshold
        {
            this.locationNote = `Good news, as we expand to new markets it's free for your postal code ${postalCode}.`; // Update button text
            this.locationService.showFreeAlert();
        }
      } else {
        // Handle invalid or non-numeric postal code
        console.error('Invalid postal code:', postalCode);
        this.locationNote = 'Note: We were unable to determine your location.';
      }
    }
  }
}
