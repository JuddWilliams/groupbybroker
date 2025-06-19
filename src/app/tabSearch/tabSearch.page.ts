import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  AlertInput,
  IonInput,
  ToastController,
  Platform,
  ItemReorderEventDetail,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService } from '../services/location.service';
import { ContractorListingsService } from '../services/contractor-listings.service';
import { ContractorListingsMockService } from '../services/contractor-listings-mock.service';
import { state } from '@angular/animations';
import { Address, ContractorListing } from '../models/address';
import { GoogleMap } from '@angular/google-maps';
import { Subject, firstValueFrom } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tabSearch',
  templateUrl: 'tabSearch.page.html',
  styleUrls: ['tabSearch.page.scss'],
  standalone: false,
})
export class TabSearchPage implements OnInit {
  @ViewChild('googleMap', { static: false }) map!: GoogleMap;

  mapOptions: google.maps.MapOptions = {};

  isPopupOpenListing = false;
  isPopupOpenOptions = false;
  findRadiusForUI: number = 15; // so its not updated as user types...

  targetAddress: Address = { street: '', city: '', state: '', postalCode: '32225' };
  withinRangeContractorListings: { contractorListing: ContractorListing; location: google.maps.LatLngLiteral }[] = [];
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

  optionMyJobs: boolean = true;
  optionMyProperties: boolean = true;
  optionAcceptingBids: boolean = true;
  optionForSale: boolean = true;
  optionTrade: boolean = true;
  optionPartner: boolean = true;
  optionCover: boolean = true;
  optionWorkingInAreas: boolean = true;
  optionUnsolicitedBid: boolean = true;

  typeColorMap: { [key: string]: string } = {
    'My Properties': '#0054e9', // primary blue
    'My Jobs': '#0163aa', // secondary blue

    'Accepting Bids': '#4CAF50', // green

    Partner: '#6f6f6f', // medium gray
    'For Sale': '#6f6f6f', // medium gray
    Trade: '#6f6f6f', // medium gray
    Cover: '#6f6f6f', // medium gray

    'Working in Area': '#ff9900', // orange
    'Unsolicited Bid': '#006600', // success tinted
  };

  readonly contractorOptionTypes = ['Partner', 'For Sale', 'Trade', 'Cover'];
  optionTypeValue: string[] = [
    'My Properties',
    'My Jobs',
    'Accepting Bids',
    'For Sale',
    'Trade',
    'Partner',
    'Cover',
    'Working in Area',
    'Unsolicited Bid',
  ]; // Default selected values for options

  // other
  //
  other1: boolean = false;
  other2: boolean = false;

  satelliteZoom = 19;
  streetViewHeading = 0; // default north
  streetViewFov = 80; // default field of view
  streetViewPitch = 0; // default is level

  readonly items = ['Overall', 'Nearest me', 'Popularity by Area', 'Cost', 'Quality', 'Dependability', 'Professionalism'];
  //sorting: string = 'useAi'; // Default sorting option
  sortingValue: string = 'useAi'; // Default selected value
  otherValue: string[] = ['tbd'];
  selectedAddress: any = null;

  currentContractorListing: any | undefined;
  homeOwnerRating: number = 80; // Percentage for the progress bar
  contractorRating: number = 25; // Percentage for the progress bar

  // Custom icons for markers
  targetIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', // Red marker for the target
    scaledSize: new google.maps.Size(40, 40), // Optional: Resize the icon
  };

  rangeIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Blue marker for withinRangeContractorListings
    scaledSize: new google.maps.Size(40, 40), // Optional: Resize the icon
  };

  async onMapClick(event: google.maps.MapMouseEvent) {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat == null || lng == null) return;

    const apiKey = environment.googleMapsApiKey; // Replace with your API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const address = data.results?.[0]?.formatted_address || 'Address not found';
      alert(`Clicked address: ${address} \n would you like to create a post for this address?`);
    } catch (err) {
      alert('Error fetching address');
    }
  }

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
            postalCode: data.zipCode,
          };
          this.refreshMap();
          return true; // Allow the alert to be dismissed
        } else {
          // Show an error message if the zip code is not valid
          alert('Please enter a valid 5-digit zip code.');
          return false; // Prevent the alert from being dismissed
        }
      },
    },
  ];

  public alertInputs: AlertInput[] = [
    {
      name: 'streetAddress',
      placeholder: 'Street address   eg. 1600 Pennsylvania Avenue NW',
      type: 'text',
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
    //private contractorListingsService: ContractorListingsService,
    //private contractorListingsMockService: ContractorListingsMockService,
    private contractorListingsService: ContractorListingsMockService,
    private router: Router, // add this
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    console.log('Selected options:', this.optionTypeValue);
    this.platFormReady();

    this.boundsChange$.pipe(debounceTime(800)).subscribe(() => {
      this.checkAddressesWithinRange(); // this is called on  google map init ;-)  so we don't need to call on our page init.
    });

    // Flicker for 5 seconds, then stop
    setTimeout(() => {
      this.flickerOverlay = false;
    }, 4000);

    // Show participate popup after x seconds
    setTimeout(() => {
      //this.showParticipatePopup();  // TODO: implemented in later
      console.log('Show participate popup after 60 seconds - TODO: implemented in later');
    }, 30000);

    window.addEventListener('resize', () => this.checkViewportSize());
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

  refreshMap(coords?: { lat: number; lng: number }) {
    // Use passed coordinates if available, otherwise default to Jacksonville, Fl. (lat: 30.3322, lng: -81.6557)
    const center = coords ? coords : { lat: 30.3322, lng: -81.6557 };
    console.log('Refreshing map with center:', center);
    this.mapOptions = {
      center,
      zoom: 12,
      mapTypeControl: !this.isSmallViewport,
      // styles: [
      //   { featureType: 'markers.labels', elementType: 'labels.text.fill', stylers: [{ saturation: '-20', color: '#000000' }] },
      // ],
    };
  }

  getStaticMapUrl(
    address: { street: string; city: string; state: string; postalCode: string },
    mapType: string = 'roadmap',
    zoom: number = this.satelliteZoom
  ): string {
    const apiKey = environment.googleMapsApiKey;
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    return `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=${zoom}&size=350x200&maptype=${mapType}&markers=color:red%7C${encodedAddress}&key=${apiKey}`;
  }
  increaseSatelliteZoom() {
    this.satelliteZoom = Math.min(this.satelliteZoom + 1, 21);
  }

  decreaseSatelliteZoom() {
    this.satelliteZoom = Math.max(this.satelliteZoom - 1, 16);
  }

  getStreetViewUrl(location: google.maps.LatLngLiteral): string {
    const apiKey = environment.googleMapsApiKey;
    const { lat, lng } = location;
    return `https://maps.googleapis.com/maps/api/streetview?size=350x200&location=${lat},${lng}&fov=${this.streetViewFov}&heading=${this.streetViewHeading}&pitch=${this.streetViewPitch}&key=${apiKey}`;
  }

  increaseStreetViewFov() {
    this.streetViewFov = Math.min(this.streetViewFov + 10, 120);
  }

  decreaseStreetViewFov() {
    this.streetViewFov = Math.max(this.streetViewFov - 10, 10);
  }

  increaseStreetViewPitch() {
    this.streetViewPitch = Math.min(this.streetViewPitch + 10, 90);
  }

  decreaseStreetViewPitch() {
    this.streetViewPitch = Math.max(this.streetViewPitch - 10, -90);
  }

  async onClaimIt() {
    await this.closePopupListing();
    this.router.navigate(['/tabs/tabDashboard']);
  }

  onMarkerClick(contractorListing: any): void {
    this.currentContractorListing = contractorListing;
    this.isPopupOpenListing = true; // Open the popup
  }

  openPopupListing(Obj?: { contractorListing: ContractorListing; location: google.maps.LatLngLiteral }) {
    this.currentContractorListing = Obj;
    this.isPopupOpenListing = true; // Open the popup
  }

  async closePopupListing() {
    await this.modalController.dismiss();
    this.isPopupOpenListing = false;
  }

  openPopupOptions() {
    this.isPopupOpenOptions = true; // Open the popup
  }

  async closePopupOptions() {
    this.isPopupOpenOptions = false;
  }

  selectRadio(value: string): void {
    this.sortingValue = value;
  }

  alertMsg(message: string) {
    alert(message);
  }

  selectCheckBox(): void {
    const selected: string[] = [];
    if (this.optionMyProperties) selected.push('My Properties');
    if (this.optionMyJobs) selected.push('My Jobs');
    if (this.optionAcceptingBids) selected.push('Accepting Bids');
    if (this.optionForSale) selected.push('For Sale');
    if (this.optionTrade) selected.push('Trade');
    if (this.optionPartner) selected.push('Partner');
    if (this.optionCover) selected.push('Cover');
    if (this.optionWorkingInAreas) selected.push('Working in Area');
    if (this.optionUnsolicitedBid) selected.push('Unsolicited Bid');

    this.optionTypeValue = selected;
    console.log('Selected options:', this.optionTypeValue);
    this.checkAddressesWithinRange();
  }

  onIndustryChange() {
    this.checkAddressesWithinRange();
  }

  async getUserLocationAndCheckPostalCode(): Promise<{ lat: number; lng: number } | null> {
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
      color: color,
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
          role: 'cancel',
        },
        {
          text: 'participate for free',
          handler: () => {
            this.router.navigate(['/tabs/tabDashboard']); // redirect to tabAbout
          },
        },
      ],
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
        address: `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`,
        componentRestrictions: {
          country: 'US',
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
      }
    );
  }

  getLatLng(addressObj: {
    contractorListing: ContractorListing;
    location: google.maps.LatLngLiteral;
  }): google.maps.LatLngLiteral {
    return addressObj.location;
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

  onRadiusInputChange(value: number) {
    this.radiusChange$.next(value);
  }

  onMapBoundsChanged() {
    this.boundsChange$.next();
  }

  async checkAddressesWithinRange() {
    const loading = await this.loadingController.create({
      message: 'Loading map data...',
      spinner: 'crescent', // or 'bubbles', 'dots', etc.
      backdropDismiss: false,
    });
    await loading.present();

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
        this.contractorListingsService.ContractorListings(
          undefined,
          undefined,
          undefined,
          this.selectedIndustry,
          this.optionTypeValue
        )
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
        optionType: contractorListing.optionType || '',
        icon: {
          url:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
                                  <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1">
                                    <rect fill="none" />
                                  </svg>
                                `),
        },
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

      this.withinRangeContractorListings.forEach((listing) => {
        listing.contractorListing.icon = this.getCircleIcon(listing); // this worked: rangeIconOverride
        console.log('Updated icon for listing:', listing);
      });

      // sort by type (alphabetically, case-insensitive)
      this.withinRangeContractorListings.sort((a, b) =>
        a.contractorListing.type.localeCompare(b.contractorListing.type, undefined, { sensitivity: 'base' })
      );

      if (this.withinRangeContractorListings.length === 0) {
        this.presentToast('No listings found. Zoom out or try a different area.', 'warning', 3000);
      }
      // else {
      //   this.presentToast(`Found ${this.withinRangeContractorListings.length} contractor listings within specified area.`, 'success', 1000);
      // }
    } catch (error) {
      console.error('ContractorListings Error:', error);
      this.presentToast('Error loading contractor listings.', 'danger', 3000);
    } finally {
      await loading.dismiss();
    }
  }

  isWithinBounds(lat: number, lng: number, bounds: google.maps.LatLngBounds): boolean {
    return bounds.contains(new google.maps.LatLng(lat, lng));
  }

  getCircleIcon(contractorListing: any): google.maps.Icon {
    const size = 30;
    const center = size / 2;
    const maxRadius = center - 2; // leave space for stroke

    // Split type string into array of options
    const optionTypes = contractorListing.contractorListing.optionType
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t);

    let allowedFound = false;

    console.log('Contractor optionTypes:', optionTypes);

    // Remove extra allowed types after the first one
    for (let i = 0; i < optionTypes.length; ) {
      if (this.contractorOptionTypes.includes(optionTypes[i])) {
        if (!allowedFound) {
          allowedFound = true;
          i++; // keep the first allowed, move to next
        } else {
          optionTypes.splice(i, 1); // remove extra allowed, don't increment i
        }
      } else {
        i++; // non-allowed, move to next
      }
    }

    const ringWidth = maxRadius / (optionTypes.length || 1);

    let svgCircles = '';
    optionTypes.forEach((option: string, i: number) => {
      const radius = maxRadius - i * ringWidth;
      svgCircles += `<circle cx="${center}" cy="${center}" r="${radius}" fill="${this.typeColorMap[option] || '#ccc'}"/>`;
    });

    // Add black outline on top
    svgCircles += `<circle cx="${center}" cy="${center}" r="${maxRadius}" fill="none" stroke="black" stroke-width="2"/>`;

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      ${svgCircles}
    </svg>
  `;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim()),
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(20, 35),
      labelOrigin: new google.maps.Point(0, 0), // move label above the icon
    };

    /*
    const icon = {
  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim()),
  scaledSize: new google.maps.Size(40, 40),
  anchor: new google.maps.Point(20, 40) // x=center, y=bottom
};
 */
  }
}
