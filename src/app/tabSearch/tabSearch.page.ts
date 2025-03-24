import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, AlertInput, IonInput, ToastController, Platform } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-tabSearch',
  templateUrl: 'tabSearch.page.html',
  styleUrls: ['tabSearch.page.scss'],
  standalone: false,
})
export class TabSearchPage implements OnInit {

  @ViewChild('findRadiusInput', { static: false }) findRadiusInput!: IonInput;

  targetAddress = '4322 Harbour Island Drive, Jacksonville, FL 32225';
  errorMessage: string | null = null;
  isSmallViewport: boolean = false; // Flag to track if the viewport is small
  numberOfContractorsInArea: number = 5; 
  readonly numberOfContractorsInAreaThreshold: number = 5;
  locationNote: string = ''; 

  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
    },
    {
      text: 'OK',
      handler: (data: any) => {
        if (data.zipCode && data.zipCode.length === 5) {
          this.targetAddress = data.streetAddress ? `${data.streetAddress}, ${data.zipCode}` : `${data.zipCode}`;
          this.refreshMap(); 
          return true; // Allow the alert to be dismissed
        } else {
          // Show an error message if the zip code is not valid
          alert('Please enter a valid 5-digit zip code.');
          return false; // Prevent the alert from being dismissed
        }
      }
    }
  ];

  public alertInputs: AlertInput[] = [
    {
      name: 'streetAddress',
      placeholder: 'Street address   eg. 1600 Pennsylvania Avenue NW',
      type: 'text'
    },
    {
      name: 'zipCode',
      type: 'number',
      placeholder: 'Zip code  eg. 20500',
      attributes: {
        maxlength: 5,
      },
      min: 1,
      max: 99999,
    },
  ];

  findRadius: number = 0.5; // In miles

  addresses = [
    '4225 Harbour Island Drive, Jacksonville, FL 32225',
    '4325 Harbour Island Drive, Jacksonville, FL 32225',
    '11269 Island Club Ln, Jacksonville, FL 32225',
    '1794 Girvin Rd, Jacksonville, FL 32225'
  ];

  targetLocation: google.maps.LatLngLiteral | undefined;
  withinRangeAddresses: { address: string, location: google.maps.LatLngLiteral }[] = [];

  mapOptions: google.maps.MapOptions = {
    center: { lat: 0, lng: 0 },
    zoom: 15,
    mapTypeControl: true,
  };

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private platform: Platform,
    private locationService: LocationService
  ) {}

  async ngOnInit() {
    this.platform.ready().then(() => {
      this.checkViewportSize(); // Check the viewport size after the platform is ready
      this.refreshMap();
      this.onRadiusChange(); // Ensure addresses within range are displayed by default
      //this.getUserLocation(); // Get user's location on page load
      this.getUserLocationAndCheckPostalCode();
    });
  }

  async getUserLocationAndCheckPostalCode() {
    const location = await this.locationService.getUserLocation();
    if (location) {
      const postalCode = await this.locationService.getPostalCodeFromCoordinates(
        location.latitude,
        location.longitude
      );

      console.log(`Postal Code: ${postalCode}`);

      // if (postalCode.startsWith('322') && this.numberOfContractorsInArea < this.numberOfContractorsInAreaThreshold) {
      //   this.locationService.showFreeAlert();
      // } else if (postalCode.startsWith('322') && this.numberOfContractorsInArea >= this.numberOfContractorsInAreaThreshold){
      //   this.locationNote = ""; 
      // }
      // else {
      //   this.locationNote = "Note: We were unable to determine your location."; 
      // }
      if (postalCode && /^\d+$/.test(postalCode)) {    

        if (postalCode.startsWith('322') ) {// if postal code AND if below threshold
          if (this.numberOfContractorsInArea < this.numberOfContractorsInAreaThreshold)
          { 
            this.locationNote = `Good news, as we expand to new markets it's free for your postal code ${postalCode}.`; // Update button text
            console.error(this.locationNote);
            this.locationService.showFreeAlert();
          }
          else 
          {            
            this.locationNote = `*There are ${this.numberOfContractorsInArea} other Contractors using our service in this area.`; 
            console.error(this.locationNote);
          }         
        }
        else // if postal code AND if below threshold
        {
            this.locationNote = `Good news, as we expand to new markets it's free for your postal code ${postalCode}.`; // Update button text
            console.error(this.locationNote);
            this.locationService.showFreeAlert();
        }
      } else {
        // Handle invalid or non-numeric postal code
        
        this.locationNote = 'Invalid postal code.', postalCode;
        console.error(this.locationNote);        
      }
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Please enter address',
      inputs: this.alertInputs,
      buttons: this.alertButtons
    });

    await alert.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }

  checkViewportSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    console.log(`Viewport size: ${width}x${height}`);
    this.isSmallViewport = width < 600; // Example: Treat viewports smaller than 600px as "small"
    if (this.isSmallViewport) {
      console.log('Rendering for a small viewport');
      // Apply logic for small viewports
    } else {
      console.log('Rendering for a large viewport');
      // Apply logic for large viewports
    }
  }

  refreshMap() {
    this.geocodeAddress(this.targetAddress, (location) => {
      this.targetLocation = location;
      this.mapOptions = {
        center: location,
        zoom: this.isSmallViewport ? 12 : 15, // Adjust zoom level based on viewport size
        mapTypeControl: !this.isSmallViewport,
      };
      this.checkAddressesWithinRange();
    });
  }

  geocodeAddress(address: string, callback: (location: google.maps.LatLngLiteral) => void) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        callback({ lat, lng });
        this.errorMessage = null; // Clear any previous error message
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
        this.presentToast('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  async checkAddressesWithinRange() {
    this.withinRangeAddresses = []; // Clear previous results
    const processedAddresses = new Set<string>(); // Use a Set to track processed addresses

    const geocodePromises = this.addresses.map((address) =>
      new Promise<void>((resolve) => {
        this.geocodeAddress(address, (location) => {
          if (this.targetLocation) {
            const targetLocation = new google.maps.LatLng(this.targetLocation);
            const addressLocation = new google.maps.LatLng(location);
            const distance =
              google.maps.geometry.spherical.computeDistanceBetween(
                targetLocation,
                addressLocation
              ) / 1609.34; // Convert meters to miles

            if (distance <= this.findRadius) {
              // Check if the address is already in the Set
              if (!processedAddresses.has(address)) {
                this.withinRangeAddresses.push({ address, location });
                processedAddresses.add(address); // Add the address to the Set
              }
            }
          }
          resolve(); // Resolve the promise when geocoding is complete
        });
      })
    );

    // Wait for all geocoding operations to complete
    await Promise.all(geocodePromises);

    // Remove duplicates from withinRangeAddresses (if any)
    this.withinRangeAddresses = this.withinRangeAddresses.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.address === value.address)
    );

    console.log('Final withinRangeAddresses:', this.withinRangeAddresses);
  }

  onRadiusChange() {
    this.checkAddressesWithinRange();
  }

  getLatLng(addressObj: { address: string, location: google.maps.LatLngLiteral }): google.maps.LatLngLiteral {
    return addressObj.location;
  }

  selectText() {
    this.findRadiusInput.getInputElement().then(input => input.select());
  }

}
