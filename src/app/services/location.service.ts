import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private alertController: AlertController) {}

  async getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const position = await Geolocation.getCurrentPosition();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      return { latitude, longitude };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  async getPostalCodeFromCoordinates(latitude: number, longitude: number): Promise<string> {
    const apiKey = 'AIzaSyCkX46SX8MpXB0cBsNgTLov1-xe19I0Q4s'; // Replace with your Google Maps API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const addressComponents = data.results[0].address_components;
      const postalCodeComponent = addressComponents.find((component: any) =>
        component.types.includes('postal_code')
      );

      return postalCodeComponent ? postalCodeComponent.long_name : '';
    }

    return '';
  }

  async showFreeAlert() {
    const alert = await this.alertController.create({
      header: 'Free Service!',
      message: 'This service is free in your area!',
      buttons: ['OK'],
    });

    await alert.present();
  }
}
