import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.page.html',
  styleUrls: ['./test-page.page.scss'],
  standalone: false,
})
export class TestPagePage implements OnInit {
  address: string = '4322 harbour island drive, Jacksonville, FL';

  constructor() {}

  ngOnInit() {}

  async testGetNeighborHood() {
    console.log('testGetNeighborHood');

    //const address = '7976 woodpecker trail, Jacksonville, FL';
    const apiKey = environment.googleMapsApiKey; // Replace with your real API key

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(this.address)}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const components = data.results[0].address_components;
        const neighborhood = components.find((c: { types: string | string[] }) => c.types.includes('neighborhood'));
        const sublocality = components.find((c: { types: string | string[] }) => c.types.includes('sublocality'));
        const name = neighborhood?.long_name || sublocality?.long_name || 'Not found';

        console.log('Neighborhood/Development:', name);
        // You can also display this in your UI as needed
      } else {
        console.log('No results found');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  }
}
