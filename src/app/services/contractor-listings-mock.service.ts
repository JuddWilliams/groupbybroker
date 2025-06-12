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
        businessName: 'Test 1 Lawn Care',
        serviceType: 'Yard care',
        private: false,
        optionType: 'For Sale', //'Out for bid', 'For Sale', 'Trade', 'Cover'
      },
      {
        street: '4322 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'Test 1 Maid & Cleaning services',
        serviceType: 'Maid & Cleaning Services',
        private: false,
        optionType: 'Cover',
      },
      {
        street: '4328 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'Test 2 lawn care',
        serviceType: 'Yard Care',
        private: false,
        optionType: 'Trade',
      },
      {
        street: '4447 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'Test 1 Pesticide services',
        serviceType: 'Pesticides',
        private: false,
        optionType: 'For Sale',
      },
      {
        street: '4419 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'Test 1 Weed & Feed services',
        serviceType: 'Weed & Feed',
        private: false,
        optionType: 'For Sale',
      },
      {
        street: '1119 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'test 1 Pool Maintenance',
        serviceType: 'Pool Maintenance',
        private: false,
        optionType: 'For Sale',
      },
      {
        street: '4201 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'Test 1 Poop Scoop services',
        serviceType: 'Poop Scooping',
        private: false,
        optionType: 'For Sale',
      },
      {
        street: '4212 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'Test 1 Maid & Cleaning services',
        serviceType: 'Maid & Cleaning Services',
        private: false,
        optionType: 'For Sale',
      },
      // Add more mock listings as needed
    ];

    // Filter by type if provided
    if (type != 'All') {
      data = data.filter((item) => item.serviceType?.toLowerCase() === type?.toLowerCase());
    }

    // Filter by option if provided (option is an array)
    if (option) {
      data = data.filter((item) => option.includes(item.optionType));
    }

    return of(data);
  }
}
