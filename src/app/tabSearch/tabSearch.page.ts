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
import { AuthService } from '../services/auth.service';
import { RecordModalService } from '../services/addrecord-modal.service';
import { RecordService } from '../services/record.service';
import { MyWorkMockService } from '../services/mywork-mock.service';

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
  optionMyJobsCount: number = 0;
  optionMyProperties: boolean = true;
  optionMyPropertiesCount: number = 0;
  optionAcceptingBids: boolean = true;
  optionAcceptingBidsCount: number = 0;
  optionForSale: boolean = true;
  optionForSaleCount: number = 0;
  optionTrade: boolean = true;
  optionTradeCount: number = 0;
  optionPartner: boolean = true;
  optionPartnerCount: number = 0;
  optionCover: boolean = true;
  optionCoverCount: number = 0;
  optionWorkingInAreas: boolean = true;
  optionWorkingInAreasCount: number = 0;
  optionUnsolicitedBid: boolean = true;
  optionUnsolicitedBidCount: number = 0;

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

  selectedAddresses: any = []; // Array to hold selected points for multi-select

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

      if (
        event.domEvent &&
        'ctrlKey' in event.domEvent &&
        'metaKey' in event.domEvent &&
        ((event.domEvent as MouseEvent).ctrlKey || (event.domEvent as MouseEvent).metaKey)
      ) {
        // Multi-select
        this.selectedAddresses.push({ lat, lng, address });
      } else {
        // Single select
        this.selectedAddresses = [{ lat, lng, address }];
      }

      // let addresses = this.selectedAddresses.map((item: any, i: number) => `${i + 1}- ${item.address}`).join('\n');
      // alert(
      //   `${addresses} \n\n Would you like to create a post for this address(s)? \n
      //   You can do multiple addresses at once by holding down the [Ctrl] key!
      //   This can be used in conjunction with creating similar bids or other features.`
      // );

      const inputData = {
        addresses: this.selectedAddresses,
      };

      const record = await this.recordModalService.openAddRecordModal(inputData);
      if (record) {
        this.recordService.addRecord(record).subscribe({
          next: (response) => {
            this.presentToast('New record added successfully!', 'success', 2000, 'bottom');
          },
          error: (error) => {
            console.error('tabSearch: Add record error:', error); // <-- log the error if any
            this.presentToast('Failed to add record.', 'danger', 2000, 'bottom');
          },
        });
      }
    } catch (err) {
      alert('Error fetching address');
    }
  }

  // addRecord(record: any): void {
  //   // Implement the logic to add a record
  //   console.log('TabSearch: New record added (TODO-move to service so i can call from mapClick() ):', record);
  //   this.presentToast('New record added successfully!', 'success', 2000, 'bottom');
  // }

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

  get isContractor(): boolean | null {
    return this.authService.isLoggedInUserAContractor(); // Get the logged-in user nickname
  }

  get contractorName(): string | null {
    return this.authService.getLoggedInContractorName(); // Get the logged-in user nickname
  }

  optionTypes: string[] = [];
  optionTypeswDuplicates: string[] = [];
  optionTypeCounts: { [key: string]: number } = {};
  myAddress: Address | undefined; // so it gets freshed.

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private platform: Platform,
    private locationService: LocationService,
    //private contractorListingsService: ContractorListingsService,
    //private contractorListingsMockService: ContractorListingsMockService,
    private contractorListingsService: ContractorListingsMockService,
    private myWorkMockService: MyWorkMockService,
    private router: Router, // add this
    private loadingController: LoadingController,
    private modalController: ModalController,
    public authService: AuthService,
    private recordModalService: RecordModalService,
    private recordService: RecordService
  ) {}

  async ngOnInit() {
    this.platFormReady();

    this.boundsChange$.pipe(debounceTime(800)).subscribe(() => {
      this.checkAddressesWithinRange(); // this is called on  google map init ;-)  so we don't need to call on our page init.
    });

    // Flicker for 5 seconds, then stop
    setTimeout(() => {
      this.flickerOverlay = false;
    }, 6000);

    // Show participate popup after x seconds
    setTimeout(() => {
      //this.showParticipatePopup(); // TODO: implemented in later
      this.showAboutUsPopup();
      //
      console.info('Show participate popup after x seconds - TODO: implemented in later');
    }, 3000);

    window.addEventListener('resize', () => this.checkViewportSize());
  }

  get isLoggedIn(): boolean | null {
    return this.authService.isLoggedIn(); // Get the logged-in user nickname
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

  isMyProperty(): boolean | null {
    this.myAddress = this.myWorkMockService.getClaimedAddress();
    console.log('isMyProperty() - myaddress:', this.myAddress);
    return this.myAddress === undefined ? false : true;
  }

  async onClaimIt(address: Address) {
    this.myAddress = address;
    this.myWorkMockService.claimAddress(address); // Store the address in myAddress

    alert('You successfully claimed this address!');
    //await this.closePopupListing();
    //this.router.navigate(['/tabs/tabDashboard']);
  }

  async onRequestBids() {
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

  async showAboutUsPopup() {
    if (this.isLoggedIn) return; // skip as they know whats up

    const alert = await this.alertController.create({
      header: "'What we do' ...in 20 seconds",
      message: `If you are looking for a quick and easy way to find the best contractor with incentives and 
                recommendations from your neighbors, you came to the right place. But that's not all we do...
                click 'How it Works' to learn more `,
      buttons: [
        {
          text: 'Close',
          role: 'close',
        },
        // {
        //   text: 'participate for free',
        //   handler: () => {
        //     this.router.navigate(['/tabs/tabDashboard']); // redirect to tabAbout
        //   },
        // },
      ],
    });
    await alert.present();
  }

  async showParticipatePopup() {
    if (this.isLoggedIn) return; // skip as they know whats up

    const alert = await this.alertController.create({
      header: 'Join the Community',
      message: `As a free service you have nothing to loose.  Simple and easy to use. `,
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
    //   // Apply logic for small viewports
    // } else {
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
      // fetch contractor listings as a promise. using firstValueFrom to convert observable to promise to await it.
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

      this.optionTypeCounts = {}; // reset counts
      this.optionTypeswDuplicates = [];
      this.withinRangeContractorListings.forEach((listing) => {
        listing.contractorListing.icon = this.getCircleIcon(listing);
      });

      this.setTypeCounts();

      // sort by type (alphabetically, case-insensitive)
      this.withinRangeContractorListings.sort((a, b) =>
        a.contractorListing.type.localeCompare(b.contractorListing.type, undefined, { sensitivity: 'base' })
      );

      // After sorting
      this.withinRangeContractorListings.forEach((listing, idx) => {
        listing.contractorListing.ref = String.fromCharCode(65 + idx); // 'A', 'B', 'C', ...
      });

      if (this.withinRangeContractorListings.length === 0) {
        this.presentToast('No listings found. Zoom out or try a different area.', 'warning', 3000);
      }

      // Flicker for 5 seconds, then stop
      this.flickerOverlay = true;
      setTimeout(() => {
        this.flickerOverlay = false;
      }, 4000);

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

  setTypeCounts() {
    this.optionAcceptingBidsCount =
      this.optionForSaleCount =
      this.optionTradeCount =
      this.optionPartnerCount =
      this.optionCoverCount =
      this.optionWorkingInAreasCount =
      this.optionUnsolicitedBidCount =
      this.optionMyPropertiesCount =
      this.optionMyJobsCount =
        0; // reset counts

    // Loop through keys (types)
    for (const type of Object.keys(this.optionTypeCounts)) {
      //types: 'Accepting Bids, For Sale, Trade, Partner, Cover, Working in Area, Unsolicited Bid, My Properties, My Jobs'
      if (type === 'Accepting Bids') this.optionAcceptingBidsCount = this.optionTypeCounts[type] || 0;
      else if (type === 'For Sale') this.optionForSaleCount = this.optionTypeCounts[type] || 0;
      else if (type === 'Trade') this.optionTradeCount = this.optionTypeCounts[type] || 0;
      else if (type === 'Partner') this.optionPartnerCount = this.optionTypeCounts[type] || 0;
      else if (type === 'Cover') this.optionCoverCount = this.optionTypeCounts[type] || 0;
      else if (type === 'Working in Area') this.optionWorkingInAreasCount = this.optionTypeCounts[type] || 0;
      else if (type === 'Unsolicited Bid') this.optionUnsolicitedBidCount = this.optionTypeCounts[type] || 0;
      else if (type === 'My Properties') this.optionMyPropertiesCount = this.optionTypeCounts[type] || 0;
      else if (type === 'My Jobs') this.optionMyJobsCount = this.optionTypeCounts[type] || 0;
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
    this.optionTypes = contractorListing.contractorListing.optionType
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t);
    let allowedFound = false;

    // save original types with duplicates.  for later counts!
    this.optionTypeswDuplicates.push(...this.optionTypes);

    // Remove extra allowed types after the first one
    for (let i = 0; i < this.optionTypes.length; ) {
      if (this.contractorOptionTypes.includes(this.optionTypes[i])) {
        if (!allowedFound) {
          allowedFound = true;
          i++; // keep the first allowed, move to next
        } else {
          this.optionTypes.splice(i, 1); // remove extra allowed, don't increment i
        }
      } else {
        i++; // non-allowed, move to next
      }
    }

    const ringWidth = maxRadius / (this.optionTypes.length || 1);

    let svgCircles = '';
    this.optionTypes.forEach((option: string, i: number) => {
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

    // before returning, lets set counts for each.
    this.optionTypeCounts = {};
    this.optionTypeswDuplicates.forEach((type: string) => {
      this.optionTypeCounts[type] = (this.optionTypeCounts[type] || 0) + 1;
    });

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim()),
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(20, 35),
      labelOrigin: new google.maps.Point(0, 0), // move label above the icon
    };
  }
}
