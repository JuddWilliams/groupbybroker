import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, AlertInput, IonInput, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {

  @ViewChild('findRadiusInput', { static: false }) findRadiusInput!: IonInput;

  targetAddress = '4322 Harbour Island Drive, Jacksonville, FL 32225';
  errorMessage: string | null = null;

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
    mapTypeControl: false,
  };

  constructor(private alertController: AlertController, private toastController: ToastController) {}

  ngOnInit() {
    this.refreshMap();
    this.onRadiusChange(); // Ensure addresses within range are displayed by default
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

  refreshMap() {
    this.geocodeAddress(this.targetAddress, (location) => {
      this.targetLocation = location;
      this.mapOptions = {
        center: location,
        zoom: 15 // Adjust the zoom level as needed
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

  checkAddressesWithinRange() {
    this.withinRangeAddresses = []; // Clear previous results
    this.addresses.forEach(address => {
      this.geocodeAddress(address, (location) => {
        if (this.targetLocation) {
          const targetLocation = new google.maps.LatLng(this.targetLocation);
          const addressLocation = new google.maps.LatLng(location);
          const distance = google.maps.geometry.spherical.computeDistanceBetween(targetLocation, addressLocation) / 1609.34; // Convert meters to miles
          if (distance <= this.findRadius) {
            this.withinRangeAddresses.push({ address, location });
          }
        }
      });
    });
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
