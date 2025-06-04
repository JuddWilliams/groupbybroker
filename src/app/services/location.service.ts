import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Address } from '../models/address';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private alertController: AlertController) {}

  async getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      //const position = await Geolocation.getCurrentPosition();
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, // Request high accuracy
        maximumAge: 0,
      });
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      console.log(`getCurrentPosition:`, position);
      console.log(`Accuracy(meters):`, position.coords.accuracy);

      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      return { latitude, longitude };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  async getPostalCodeFromCoordinates(latitude: number, longitude: number): Promise<Address> {
    const apiKey = 'AIzaSyCkX46SX8MpXB0cBsNgTLov1-xe19I0Q4s'; // Replace with your Google Maps API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const addressComponents = data.results[0].address_components;
      console.log('Address Components:', addressComponents); // Log the address components for debugging


      const streetNumberComponent = addressComponents.find((component: any) =>
        component.types.includes('street_number')
      );
      console.log('Street Number Component:', streetNumberComponent); // Log the street number component for debugging     

      const routeComponent = addressComponents.find((component: any) =>
        component.types.includes('route')
      );
      console.log('Route Component:', routeComponent); // Log the street route component for debugging
      
      const postalCodeComponent = addressComponents.find((component: any) =>
        component.types.includes('postal_code')
      );
      console.log('Postal Code Component:', postalCodeComponent);

      let streetAddress =  (streetNumberComponent ? streetNumberComponent.long_name : '') + ' ' + (routeComponent ? routeComponent.long_name : ''); // Concatenate street number and route for full address
      console.log('Street Address:', streetAddress); // Log the full street address for debugging
      let address: Address = {
        street: streetAddress,
        postalCode: postalCodeComponent ? postalCodeComponent.long_name : '',
        city: '',
        state: ''
      };

      return address;
    }

    return {
      street: '',
      postalCode: '',
      city: '',
      state: ''
    };
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
