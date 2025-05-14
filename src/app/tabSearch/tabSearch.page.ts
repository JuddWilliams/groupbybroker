import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, AlertInput, IonInput, ToastController, Platform, ItemReorderEventDetail } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService } from '../services/location.service';
import { ContractorListingsService } from '../services/contractor-listings.service';
import { state } from '@angular/animations';
import { Address, ContractorListing } from '../models/address';

@Component({
  selector: 'app-tabSearch',
  templateUrl: 'tabSearch.page.html',
  styleUrls: ['tabSearch.page.scss'],
  standalone: false,
})
export class TabSearchPage implements OnInit {

  @ViewChild('findRadiusInput', { static: false }) findRadiusInput!: IonInput;
  
  selectedIndustry: string = 'Lawn care'; 
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
          //this.targetAddress = data.streetAddress ? `${data.streetAddress}, ${data.zipCode}` : `${data.zipCode}`;
          // during conversion to object, i did this. may have broken. 
          this.targetAddress = {
            street: data.streetAddress || '',
            city: '',
            state: '',
            postalCode: data.zipCode
          };
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

  findRadius: number = 2;//0.5; // In miles

  targetLocation: google.maps.LatLngLiteral | undefined;
  withinRangeContractorListings: {  contractorListing: ContractorListing, location: google.maps.LatLngLiteral }[] = [];

  mapOptions: google.maps.MapOptions = {
    // see refreshMap() function

    // center: { lat: 0, lng: 0 },
    // zoom: 15,
    // mapTypeControl: true,
  };
  
  //targetAddress: Address = { street: '4322 Harbour Island Drive', city: 'Jacksonville', state: 'FL', postalCode: '32225' };
  targetAddress: Address = { street: '', city: '', state: '', postalCode: '' };
  
  contractorListings: ContractorListing[] = [];
  //   { street: '11269 Island Club Ln', city: 'Jacksonville', state: 'FL', postalCode: '32225' },
  //   { street: '9 Harbor View Lane', city: 'Toms River', state: 'NJ', postalCode: '08753' }
  // ];

  // Custom icons for markers
  targetIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', // Red marker for the target
    scaledSize: new google.maps.Size(40, 40), // Optional: Resize the icon
  };

  rangeIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Blue marker for withinRangeContractorListings
    scaledSize: new google.maps.Size(40, 40), // Optional: Resize the icon
  };

  items = ['Overall', 'Nearest me', 'Popularity by Area', 'Cost', 'Quality', 'Dependability', 'Professionalism'];
  //sorting: string = 'useAi'; // Default sorting option
  sortingValue: string = 'useAi'; // Default selected value

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private platform: Platform,
    private locationService: LocationService,
    private contractorListingsService: ContractorListingsService
  ) {}

  

selectRadio(value: string): void {
  this.sortingValue = value;
}

  //  handleReorder(event: CustomEvent<ItemReorderEventDetail>) {
  //   // The `from` and `to` properties contain the index of the item
  //   // when the drag started and ended, respectively
  //   console.log('Dragged from index', event.detail.from, 'to', event.detail.to);

  //    // Before complete is called with the items they will remain in the
  //   // order before the drag
  //   console.log('Before complete', this.items);

  //   // Finish the reorder and position the item in the DOM based on
  //   // where the gesture ended. Update the items variable to the
  //   // new order of items
  //   this.items = event.detail.complete(this.items);

  //   // After complete is called the items will be in the new order
  //   console.log('After complete', this.items);   
  // }
  
  async ngOnInit() {
    this.contractorListingsService.ContractorListings(undefined, undefined, undefined, this.selectedIndustry).subscribe({
      next: (response) => 
        {
          console.log('ContractorListings Response:', response);
          // this.contractorListings = response.map((contractorListing: any) => {        
          //   return { street: contractorListing.street, city: contractorListing.city, state: contractorListing.state, postalCode: contractorListing.postalCode  };
          // });
          // this.contractorListings = response.map((contractorListing: ContractorListing) => {        
          //   return { street: contractorListing.address.street, city: contractorListing.address.city, state: contractorListing.address.state, postalCode: contractorListing.address.postalCode  };
          // });
         
          this.contractorListings = response.map((contractorListing: any) => {
            return {
              address: {
                street: contractorListing.street || '',
                city: contractorListing.city || '',
                state: contractorListing.state || '',
                postalCode: contractorListing.postalCode || '',
              },
              company: {
                id:  -1,
                companyName: contractorListing.businessName || '',               
              },
              type: contractorListing.serviceType || '', // Assuming 'type' is a property in the response
              private: contractorListing.private || false, // Assuming 'private' is a property in the response
            } as ContractorListing;
          });

          this.platFormReady();

          console.log('ContractorListings contractorListings:', this.contractorListings);
        },
      error: (error) => console.error('ContractorListings Error:', error),
    });
    
  }

  onIndustryChange() {
    this.contractorListingsService.ContractorListings(undefined, undefined, undefined, this.selectedIndustry).subscribe({
      next: (response) => {
        console.log('ContractorListings Response:', response);
        this.contractorListings = response.map((contractorListing: any) => {
          return {
            address: {
              street: contractorListing.street || '',
              city: contractorListing.city || '',
              state: contractorListing.state || '',
              postalCode: contractorListing.postalCode || '',
            },
            company: {
              id:  -1,
              companyName: contractorListing.businessName || '',               
            },
            type: contractorListing.serviceType || '', // Assuming 'type' is a property in the response
            private: contractorListing.private || false, // Assuming 'private' is a property in the response
          } as ContractorListing;
        });

        this.platFormReady();
      },
      error: (error) => console.error('ContractorListings Error:', error),
    });
    
  }

  // async platFormReady() {
  //   this.platform.ready().then(() => {
  //     this.getUserLocationAndCheckPostalCode();
  //     this.checkViewportSize(); // Check the viewport size after the platform is ready
  //     this.refreshMap();        
  //   });
  // }

  async platFormReady() {
    await this.platform.ready(); // Wait for the platform to be ready
    await this.getUserLocationAndCheckPostalCode(); // Wait for location and postal code check
    this.checkViewportSize(); // Execute viewport size check
    await this.refreshMap(); // Wait for the map to refresh
  }


  refreshMap() {
    this.geocodeAddress(this.targetAddress, (location) => {
      this.targetLocation = location;
      this.mapOptions = {       
        center: location,
        zoom: this.isSmallViewport ? 15 : 15, // Adjust zoom level based on viewport size
        mapTypeControl: !this.isSmallViewport,
        //mapTypeId: 'satellite', // Set the map type to satellite       
      };
      this.checkAddressesWithinRange();
    });
  }

  async getUserLocationAndCheckPostalCode() {
    const location = await this.locationService.getUserLocation();
    console.log('XXXUser location:', location); // Log the retrieved location
    if (location) {
      // const postalCode = await this.locationService.getPostalCodeFromCoordinates(
      //   location.latitude,
      //   location.longitude
      // );
      this.targetAddress = await this.locationService.getPostalCodeFromCoordinates(
        location.latitude,
        location.longitude
      );

      console.log(`Postal Code: ${this.targetAddress.postalCode}`);

      // if (postalCode.startsWith('322') && this.numberOfContractorsInArea < this.numberOfContractorsInAreaThreshold) {
      //   this.locationService.showFreeAlert();
      // } else if (postalCode.startsWith('322') && this.numberOfContractorsInArea >= this.numberOfContractorsInAreaThreshold){
      //   this.locationNote = ""; 
      // }
      // else {
      //   this.locationNote = "Note: We were unable to determine your location."; 
      // }
      if (this.targetAddress.postalCode && /^\d+$/.test(this.targetAddress.postalCode)) {    

        if (this.targetAddress.postalCode.startsWith('322') ) {// if postal code AND if below threshold
          if (this.numberOfContractorsInArea < this.numberOfContractorsInAreaThreshold)
          { 
            this.locationNote = `*As we expand to new markets it's free for your area ${this.targetAddress.postalCode}.`; // Update button text
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
            this.locationNote = `*As we expand to new markets it's free for your area ${this.targetAddress.postalCode}.`; // Update button text
            console.error(this.locationNote);
            this.locationService.showFreeAlert();
        }
      } else {
        // Handle invalid or non-numeric postal code
        
        this.locationNote = 'Invalid postal code.', this.targetAddress.postalCode;
        console.error(this.locationNote);        
      }
    }
    else {
      alert( `We're unable to determine your locaton.  You may have disabled location access for groupBuyology.com.\n
        To enable location access, please go to your browser settings:\n
        - In Chrome: Go to Settings > Privacy and Security > Site Settings > Permissions > Location: Under 'Customized behaviors' then delete. Return to page and refresh.\n
        - In Safari: Go to Settings > Safari > Location, and allow location access.\n
        - In Firefox: Click the shield icon in the address bar, then manage location permissions.`
     );
      console.error('Unable to retrieve location.');
      this.locationNote = 'Note: We were unable to determine your location.';
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

  // async presentToast(message: string) {
  //   const toast = await this.toastController.create({    
  //     message: message,
  //     duration: 2000,
  //     position: 'top',
  //     color: 'danger'
  //   });
  //   await toast.present();
  // }
   async presentToast(message: string, color: string = 'danger', duration: number = 3000, position: 'top' | 'bottom' = 'top') {
    const toast = await this.toastController.create({    
      message: message,
      duration: duration,
      position: position,
      color: color
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

  geocodeAddress(address: Address, callback: (location: google.maps.LatLngLiteral) => void) {
    const geocoder = new google.maps.Geocoder();
    
    //geocoder.geocode({ address }, (results, status) => {
    console.log('GeocodingAddress:', address); // Log the address being geocoded
    geocoder.geocode( 
    {
      componentRestrictions: {
        route: address.street, // Street name
        // cant be empty .. so o remmoved for now until i improve dlg. 
        // locality: address.city, // City
        // administrativeArea: address.state, // State
        postalCode: address.postalCode, // ZIP code
        country: 'US', // Restrict to the United States (optional)
      },
    },       
    (results, status) => {
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
    this.withinRangeContractorListings = []; // Clear previous results
  
    console.log('##this.findRadius:', this.findRadius); // Log the target address
      // Return early if findRadius is not a valid number or is less than or equal to 0
    if (isNaN(this.findRadius) || this.findRadius <= 0) {
      console.info('Invalid findRadius:', this.findRadius);      
      return;
    }


    const geocodePromises = this.contractorListings.map((contractorListing) =>
      new Promise<void>((resolve) => {
        console.log('Geocoding contractor address:', contractorListing); // Log the address being geocoded
        const addressString = `${contractorListing.address.street}, ${contractorListing.address.city}, ${contractorListing.address.state} ${contractorListing.address.postalCode}`;
        this.geocodeAddress(contractorListing.address, (location) => {
          if (this.targetLocation) {
            const targetLocation = new google.maps.LatLng(this.targetLocation);
            const addressLocation = new google.maps.LatLng(location);
            const distance =
              google.maps.geometry.spherical.computeDistanceBetween(
                targetLocation,
                addressLocation
              ) / 1609.34; // Convert meters to miles

            if (distance <= this.findRadius) {      
              console.log('TBD street:', contractorListing);       
              this.withinRangeContractorListings.push({ contractorListing, location });             
            }
          }
          resolve(); // Resolve the promise when geocoding is complete
        });
      })
    );

    // Wait for all geocoding operations to complete
    await Promise.all(geocodePromises);

    // Remove duplicates from withinRangeAddresses (if any)
    this.withinRangeContractorListings = this.withinRangeContractorListings.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.contractorListing === value.contractorListing)
    );

    // Display a toast message if no records are found
    if (this.withinRangeContractorListings.length === 0) {
      this.presentToast('No contractor listings found within the specified radius. Change \'lookup Range\' or \'Target Address\'.');
    }
    else {
      this.presentToast(`Found ${this.withinRangeContractorListings.length} contractor listings within specified area.`,
        'success', 1300);
    }

    console.log('Final withinRangeContractorListings:', this.withinRangeContractorListings);
  }

  onRadiusChange() {
    this.checkAddressesWithinRange();
  }

  getLatLng(addressObj: { contractorListing: ContractorListing, location: google.maps.LatLngLiteral }): google.maps.LatLngLiteral {
    return addressObj.location;
  }

  selectText() {
    this.findRadiusInput.getInputElement().then(input => input.select());
  }

 
  

}
