import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, AlertInput, IonInput, ToastController, Platform, ItemReorderEventDetail } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService } from '../services/location.service';
import { ContractorListingsService } from '../services/contractor-listings.service';
import { state } from '@angular/animations';
import { Address, ContractorListing } from '../models/address';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';
import { Subject, firstValueFrom } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabSearch',
  templateUrl: 'tabSearch.page.html',
  styleUrls: ['tabSearch.page.scss'],
  standalone: false,
})
export class TabSearchPage implements OnInit {

  @ViewChild('findRadiusInput', { static: false }) findRadiusInput!: IonInput;
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChild('googleMap', { static: false }) map!: GoogleMap;
  
  mapOptions: google.maps.MapOptions = {    
  };
  
  isPopupOpen = false;
  findRadiusForUI: number = 15;// so its not updated as user types... 

  targetAddress: Address = { street: '', city: '', state: '', postalCode: '32225' };
  userAddedMarker: google.maps.LatLngLiteral | null = null;
  withinRangeContractorListings: {  contractorListing: ContractorListing, location: google.maps.LatLngLiteral }[] = [];
  contractorListings: ContractorListing[] = [];

  private radiusChange$ = new Subject<number>();
  private boundsChange$ = new Subject<void>();
  flickerOverlay = true;


  selectedIndustry: string = 'All'; //'All'; //'Lawn care'; 
  errorMessage: string | null = null;
  isSmallViewport: boolean = false; // Flag to track if the viewport is small
  numberOfContractorsInArea: number = 5; 
  readonly numberOfContractorsInAreaThreshold: number = 5;
  locationNote: string = ''; 
  
  filterForSale: boolean = true;
  filterTrade: boolean = true;
  filterCover: boolean = true;
  
  items = ['Overall', 'Nearest me', 'Popularity by Area', 'Cost', 'Quality', 'Dependability', 'Professionalism'];
  //sorting: string = 'useAi'; // Default sorting option
  sortingValue: string = 'useAi'; // Default selected value  
  selectedAddress: any = null;
  
  // Custom icons for markers
  targetIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', // Red marker for the target
    scaledSize: new google.maps.Size(40, 40), // Optional: Resize the icon
  };

  rangeIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Blue marker for withinRangeContractorListings
    scaledSize: new google.maps.Size(40, 40), // Optional: Resize the icon
  };

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
    private contractorListingsService: ContractorListingsService,
    private router: Router // add this
  ) {}

  onMarkerClick(addressObj: any): void {
    this.selectedAddress = addressObj;    

    //If using an infoWindow, open it here
    this.infoWindow.open();
    alert('Marker clicked: ' + addressObj.contractorListing.address.street);
  }

  selectRadio(value: string): void {
    this.sortingValue = value;
  }

  selectCheckBox(value: string): void {
    alert('Not implemented yet: Checkbox selected: ' + value);
  }

  
  async ngOnInit() {
    this.platFormReady();

    this.boundsChange$
      .pipe(debounceTime(900))
      .subscribe(() => {
        this.checkAddressesWithinRange(); // this is called on  google map init ;-)  so we don't need to call on our page init. 
      });

    // Flicker for 5 seconds, then stop
    setTimeout(() => {
      this.flickerOverlay = false;
    }, 3000);

    // Show participate popup after 2 seconds
    setTimeout(() => {
      this.showParticipatePopup();
    }, 60000);
     
    window.addEventListener('resize', () => this.checkViewportSize());

  }

  onIndustryChange() {
    this.checkAddressesWithinRange();
  }


  async platFormReady() {
    await this.platform.ready();
    this.checkViewportSize();

    // display map in user's area if available. 
    //
    const coords = await this.getUserLocationAndCheckPostalCode();
    
    if (coords) {
      this.refreshMap(coords); 
    } else {
      this.refreshMap();
    }
  }


  refreshMap(coords?: { lat: number, lng: number }) {
    // Use passed coordinates if available, otherwise default to Jacksonville, Fl. (lat: 30.3322, lng: -81.6557)
    const center = coords ? coords : { lat: 30.3322, lng: -81.6557 };
    console.log('Refreshing map with center:', center);
    this.mapOptions = {
      center,
      zoom: 12,
      mapTypeControl: !this.isSmallViewport,
    };
  }

  async getUserLocationAndCheckPostalCode(): Promise<{ lat: number, lng: number } | null> {
    const location = await this.locationService.getUserLocation();    

    if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {      
      return { lat: location.latitude, lng: location.longitude };
    }
    return null;
  }

   async presentToast(message: string, color: string = 'danger', duration: number = 3000, position: 'top' | 'bottom' = 'top') {
    const toast = await this.toastController.create({    
      message: message,
      duration: duration,
      position: position,
      color: color
    });
    await toast.present();
  }

    async showParticipatePopup() {
    const alert = await this.alertController.create({
      header: 'Join the Community',
      message: 'As a free service you have nothing to loose.  Simple and easy to use.',
      buttons: [
        {
          text: 'maybe later',
          role: 'cancel'
        },
        {
          text: 'participate for free',
          handler: () => {
            this.router.navigate(['/tabs/tabDashboard']); // redirect to tabAbout
          }
        }
      ]
    });
    await alert.present();
  }

  checkViewportSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;    
    this.isSmallViewport = width < 600; // Example: Treat viewports smaller than 600px as "small"
    // if (this.isSmallViewport) {
    //   console.log('Rendering for a small viewport');
    //   // Apply logic for small viewports
    // } else {
    //   console.log('Rendering for a large viewport');
    //   // Apply logic for large viewports
    // }
  }

  geocodeAddress(address: Address, callback: (location: google.maps.LatLngLiteral) => void) {
    const geocoder = new google.maps.Geocoder();
        
    geocoder.geocode( 
    {
      componentRestrictions: {
        route: address.street, // Street name
        // cant be empty .. so o remmoved for now until i improve dlg. 
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
      const zoom = this.getZoomLevelForRadius(this.findRadiusForUI);
      this.mapOptions = {
        ...this.mapOptions,
        center: { lat, lng },
        zoom: zoom,
      };

      // Reverse geocode and update targetAddress
      this.locationService.getPostalCodeFromCoordinates(lat, lng).then(address => {
        this.targetAddress = address;                        
      });
      
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

//  openPopup(withinRangeContractorListings: { contractorListing: ContractorListing, location: google.maps.LatLngLiteral }) { 
  openPopup(addressObj?: { contractorListing: ContractorListing, location: google.maps.LatLngLiteral }) {
    console.log('Opening popup for:', addressObj);    
    this.isPopupOpen = true; // Open the popup
  }

  closePopup() {
    this.isPopupOpen = false; // Close the popup
  }

  onRadiusInputChange(value: number) {
    this.radiusChange$.next(value);
  }

  onMapBoundsChanged() {    
    this.boundsChange$.next();    
  }

  async checkAddressesWithinRange() {
    this.withinRangeContractorListings = [];

    if (!this.map.googleMap) {
      console.warn('Google Map is not initialized');
      return;
    }

    const bounds = this.map.googleMap.getBounds();
    if (!bounds) {
      console.warn('Bounds are not available');
      return;
    }

    try {
      // fetch contractor listings as a promise
      const responseContractorListings = await firstValueFrom(
        this.contractorListingsService.ContractorListings(undefined, undefined, undefined, this.selectedIndustry)
      );

      // map and filter in one step
      const contractorListings: ContractorListing[] = responseContractorListings.map((contractorListing: any) => ({
        address: {
          street: contractorListing.street || '',
          city: contractorListing.city || '',
          state: contractorListing.state || '',
          postalCode: contractorListing.postalCode || '',
        },
        company: {
          id: -1,
          companyName: contractorListing.businessName || '',
        },
        type: contractorListing.serviceType || '',
        private: contractorListing.private || false,
      }));

      // geocode and filter by bounds
      const geocodePromises = contractorListings.map(
        (contractorListing) =>
          new Promise<void>((resolve) => {
            this.geocodeAddress(contractorListing.address, (location) => {
              if (this.isWithinBounds(location.lat, location.lng, bounds)) {
                this.withinRangeContractorListings.push({ contractorListing, location });
              }
              resolve();
            });
          })
      );

      await Promise.all(geocodePromises);

      // optional: delay before showing resolve(), then toast
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      
      if (this.withinRangeContractorListings.length === 0) {
        this.presentToast('No listings found. Zoom out or try a different area.', 'warning', 3000);
      }
      // else {
      //   this.presentToast(`Found ${this.withinRangeContractorListings.length} contractor listings within specified area.`, 'success', 1000);
      // }

    } catch (error) {
      console.error('ContractorListings Error:', error);
      this.presentToast('Error loading contractor listings.', 'danger', 3000);
    }
  }

  isWithinBounds(lat: number, lng: number, bounds: google.maps.LatLngBounds): boolean 
  {
    return bounds.contains(new google.maps.LatLng(lat, lng));
  }

}


