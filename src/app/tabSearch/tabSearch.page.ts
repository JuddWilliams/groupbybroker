import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, AlertInput, IonInput, ToastController, Platform, ItemReorderEventDetail } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService } from '../services/location.service';
import { ContractorListingsService } from '../services/contractor-listings.service';
import { state } from '@angular/animations';
import { Address, ContractorListing } from '../models/address';
import { MapInfoWindow } from '@angular/google-maps';

@Component({
  selector: 'app-tabSearch',
  templateUrl: 'tabSearch.page.html',
  styleUrls: ['tabSearch.page.scss'],
  standalone: false,
})
export class TabSearchPage implements OnInit {

  @ViewChild('findRadiusInput', { static: false }) findRadiusInput!: IonInput;
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  
  findRadius: number = 5;//0.5; // In miles  
  targetAddress: Address = { street: '', city: '', state: '', postalCode: '32225' };
  userAddedMarker: google.maps.LatLngLiteral | null = null;

  selectedIndustry: string = 'Lawn care'; 
  errorMessage: string | null = null;
  isSmallViewport: boolean = false; // Flag to track if the viewport is small
  numberOfContractorsInArea: number = 5; 
  readonly numberOfContractorsInAreaThreshold: number = 5;
  locationNote: string = ''; 
  
  withinRangeContractorListings: {  contractorListing: ContractorListing, location: google.maps.LatLngLiteral }[] = [];

  mapOptions: google.maps.MapOptions = {
    // see refreshMap() function

    // center: { lat: 0, lng: 0 },
    // zoom: 15,
    // mapTypeControl: true,
  };
  
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
  selectedAddress: any = null;
  

  
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


  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private platform: Platform,
    private locationService: LocationService,
    private contractorListingsService: ContractorListingsService
  ) {}

  onMarkerClick(addressObj: any): void {
    this.selectedAddress = addressObj;
    console.log('Marker clicked:', this.selectedAddress);

    //If using an infoWindow, open it here
    this.infoWindow.open();
    alert('Marker clicked: ' + addressObj.contractorListing.address.street);
  }

  selectRadio(value: string): void {
    this.sortingValue = value;
  }
  
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


  async platFormReady() {
    await this.platform.ready(); // Wait for the platform to be ready
    //await this.getUserLocationAndCheckPostalCode(); // Wait for location and postal code check
    this.checkViewportSize(); // Execute viewport size check
    await this.refreshMap(); // Wait for the map to refresh
  }


  refreshMap() {

      //Default to Northeast Florida (Jacksonville)
        //console.log('Geocoded location specified:', location); // Log the geocoded location        
        this.mapOptions = {
          center: { lat: 30.3322, lng: -81.6557 },
          zoom: 12,
          mapTypeControl: !this.isSmallViewport,
        };
    
      

    // this.geocodeAddress(this.targetAddress, (location) => {
    //   if (location && location.lat && location.lng) {
    //     console.log('Geocoded location specified:', location); // Log the geocoded location
    //     this.targetLocation = location;
    //     this.mapOptions = {       
    //       center: location,
    //       zoom: this.isSmallViewport ? 15 : 15,
    //       mapTypeControl: !this.isSmallViewport,
    //     };
    //   } else {
    //     // Default to Northeast Florida (Jacksonville)
    //     console.log('Geocoded location specified:', location); // Log the geocoded location
    //     this.targetLocation = { lat: 30.3322, lng: -81.6557 };
    //     this.mapOptions = {
    //       center: this.targetLocation,
    //       zoom: 12,
    //       mapTypeControl: !this.isSmallViewport,
    //     };
    //   }
    //   this.checkAddressesWithinRange();
    // });
  }

  async getUserLocationAndCheckPostalCode() {
    //const location = await this.locationService.getUserLocation();    
    //console.log('USER LOCATION:', location); // Log the retrieved location
    
    //if (location) {
    if (true)
    {
      // const postalCode = await this.locationService.getPostalCodeFromCoordinates(
      //   location.latitude,
      //   location.longitude
      // );
      if (
        this.userAddedMarker &&
        typeof this.userAddedMarker.lat === 'number' &&
        typeof this.userAddedMarker.lng === 'number'
      ) {
        this.targetAddress = await this.locationService.getPostalCodeFromCoordinates(
          this.userAddedMarker.lat,
          this.userAddedMarker.lng
        );
      } else {
        console.error('User added marker coordinates are not defined.');
        this.targetAddress = { street: '', city: '', state: '', postalCode: '' };
      }

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
        //
        // if we found a valid address, lets use that as default. 
        //
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
        // 
        // seems we couldn't determine OR accuracy was too low to determine postal code.
        //
        
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
          if (this.userAddedMarker) {
            const targetLocation = new google.maps.LatLng(this.userAddedMarker);
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
    //this.refreshMap();
  }

  getLatLng(addressObj: { contractorListing: ContractorListing, location: google.maps.LatLngLiteral }): google.maps.LatLngLiteral {
    return addressObj.location;
  }

  selectText() {
    this.findRadiusInput.getInputElement().then(input => input.select());
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.userAddedMarker = { lat, lng };

      // Center the map on the new marker and set zoom to fit findRadius
      const zoom = this.getZoomLevelForRadius(this.findRadius);
      this.mapOptions = {
        ...this.mapOptions,
        center: { lat, lng },
        zoom: zoom,
      };

      console.log('User added marker at:', this.userAddedMarker, 'Zoom set to:', zoom);

      // Reverse geocode and update targetAddress
      this.locationService.getPostalCodeFromCoordinates(lat, lng).then(address => {
        this.targetAddress = address;
        console.log('Updated targetAddress:', this.targetAddress);
        // Optionally, refresh the map or listings if needed:
        // this.refreshMap();
        this.checkAddressesWithinRange();
      });

      // Optionally update postal code and location note
      // this.getUserLocationAndCheckPostalCode();
    }
  }

  // Returns zoom level so that the given radius (in miles) fits in the map view
  getZoomLevelForRadius(radiusMiles: number): number {
    const mapWidth = window.innerWidth || 800;
    const mapHeight = window.innerHeight || 600;
    const mapDim = Math.min(mapWidth, mapHeight); // Use the smaller dimension
    const radiusMeters = radiusMiles * 1609.34;
    const earthCircumference = 40075017;
    const diameter = radiusMeters * 2;
    const padding = 1.6; // 1.6 = 60% extra space, adjust as needed for your UI

    // The formula ensures the circle fits within the smallest map dimension
    const zoom = Math.log2((mapDim * earthCircumference) / (diameter * 256 * padding));
    return Math.max(2, Math.min(Math.floor(zoom), 21));
  }
}
