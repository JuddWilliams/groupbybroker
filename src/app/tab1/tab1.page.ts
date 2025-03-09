import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {

  targetAddress = '4322 Harbour Island Drive, Jacksonville, FL 32225';

  public alertButtons = ['OK'];
  public alertInputs = [
    {
      placeholder: 'Street address   eg. 1600 Pennsylvania Avenue NW',
    },
  
     {
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
    zoom: 15
  };

  constructor() {}

  ngOnInit() {
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
    //console.log("geocoder: ", geocoder);
    //console.log("address: ", address);
    geocoder.geocode({ address }, (results, status) => {
      //console.log("results: ", results);
      //console.log("status: ", status);
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        //console.log("lat: ", lat);
        //console.log("lng: ", lng);
        callback({ lat, lng });
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  checkAddressesWithinRange() {
    this.withinRangeAddresses = []; // Clear previous results
    this.addresses.forEach(address => {
      this.geocodeAddress(address, (location) => {
        //console.log("checkAddressesWithinRange()->geocodeAddress(address): ", address);
        //console.log("checkAddressesWithinRange()->geocodeAddress(location): ", location);
        if (this.targetLocation) {
          //console.log("this.targetLocation: ", this.targetLocation);
          const targetLocation = new google.maps.LatLng(this.targetLocation);
          //console.log("targetLocation: ", this.targetLocation);
          const addressLocation = new google.maps.LatLng(location);
          //console.log("addressLocation: ", addressLocation);
          const distance = google.maps.geometry.spherical.computeDistanceBetween(targetLocation, addressLocation) / 1609.34; // Convert meters to miles
          //console.log("distance: ", distance);
          if (distance <= this.findRadius) {
            this.withinRangeAddresses.push({ address, location });
            //console.log("this.withinRangeAddresses: ", this.withinRangeAddresses);
          }
        }
      });
    });
  }

  onRadiusChange() {
    this.checkAddressesWithinRange();
  }

  getLatLng(addressObj: { address: string, location: google.maps.LatLngLiteral }): google.maps.LatLngLiteral {
    //console.log("getLatLng(addressObj):", addressObj);
    //console.log("getLatLng(addressObj)-> addressObj.location:", addressObj.location);
    return addressObj.location;
  }

}
