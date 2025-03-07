import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  targetAddress = '4322 Harbour Island Drive, Jacksonville, FL 32225';

  addresses = [
    '4320 Harbour Island Drive, Jacksonville, FL 32225',
    '4324 Harbour Island Drive, Jacksonville, FL 32225'
  ];
  

  targetLocation: google.maps.LatLngLiteral | undefined;
  withinRangeAddresses: string[] = [];

  mapOptions: google.maps.MapOptions = {
    center: { lat: 0, lng: 0 },
    zoom: 12
  };


  constructor() {}

  
  ngOnInit() {
    this.geocodeAddress(this.targetAddress, (location) => {
      this.targetLocation = location;
      this.mapOptions.center = location;
      this.checkAddressesWithinRange();
    });
  }

  geocodeAddress(address: string, callback: (location: google.maps.LatLngLiteral) => void) {
    const geocoder = new google.maps.Geocoder();
    console.log("geocoder: ", geocoder);
    console.log("address: ", address);
    geocoder.geocode({ address }, (results, status) => {
      console.log("results: ", results);
      console.log("status: ", status);
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        console.log("lat: ", lat);
        console.log("lng: ", lng);
        callback({ lat, lng });
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  checkAddressesWithinRange() {
    this.addresses.forEach(address => {
      this.geocodeAddress(address, (location) => {
        console.log("checkAddressesWithinRange()->geocodeAddress(address): ", address);
        console.log("checkAddressesWithinRange()->geocodeAddress(location): ", location);
        if (this.targetLocation) {
          console.log("this.targetLocation: ", this.targetLocation);
          const targetLocation = new google.maps.LatLng(this.targetLocation);
          console.log("targetLocation: ", this.targetLocation);
          const addressLocation = new google.maps.LatLng(location);
          console.log("addressLocation: ", addressLocation);
          const distance = google.maps.geometry.spherical.computeDistanceBetween(targetLocation, addressLocation) / 1609.34; // Convert meters to miles
          console.log("distance: ", distance);
          if (distance <= 2) {            
            this.withinRangeAddresses.push(address);
            console.log("this.withinRangeAddresses: ", this.withinRangeAddresses);
          }
        }      
      });
    });
  }

  getLatLng(address: any): google.maps.LatLngLiteral {
    console.log("getLatLng(address):", address);
    console.log("getLatLng(address)-> address.location:", address.location);
    return address.location;
  }

}
