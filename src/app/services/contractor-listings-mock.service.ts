import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContractorListingsMockService {
  ContractorListings(city?: string, state?: string, postalCode?: string, type?: string, option?: string[]): Observable<any[]> {
    console.log('ContractorListingsMockService called with:', { type, option });
    // Example mock data
    let data = [
      {
        street: '4322 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'JnW Lawn Care',
        serviceType: 'Yard care',
        private: false,
        optionType: 'Partner, For Sale, Trade, Working in Area', //'Open to bid', 'For Sale', 'Trade', 'Partner', 'Cover'
        homeOwnerRating: 100,
      },
      {
        street: '12307 Hawkstowe lane',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'Williams Pool & Spa Services',
        serviceType: 'Pool Maintenance',
        private: false,
        optionType: 'For Sale',
      },
      {
        street: '7976 Woodpecker Trail',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32256',
        //businessName: 'JnW Lawn Care',
        serviceType: 'Yard care',
        private: false,
        optionType: 'Accepting Bids',
      },

      // Add more mock listings as needed
    ];

    // Filter by type if provided
    if (type != 'All') {
      data = data.filter((item) => item.serviceType?.toLowerCase() === type?.toLowerCase());
    }

    // Filter by option if provided (option is an array)
    // if (option) {
    //   data = data.filter((item) => option.includes(item.optionType));
    // }

    data = data.filter((item) => {
      if (!item.optionType) return false;
      // Split optionType into an array, trim spaces
      const types = item.optionType.split(',').map((s) => s.trim().toLowerCase());
      // Check if any option matches any type
      return option?.some((opt) => types.includes(opt.toLowerCase())) ?? false;
    });

    return of(data);
  }
}
