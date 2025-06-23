import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

export interface ContractorListing {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  businessName?: string;
  serviceType: string;
  optionType: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContractorListingsMockService {
  constructor(private authService: AuthService) {} // Inject AuthService

  data: ContractorListing[] = [];

  ContractorListings(city?: string, state?: string, postalCode?: string, type?: string, option?: string[]): Observable<any[]> {
    console.log('ContractorListingsMockService called with:', { type, option });

    const isLoggedIn = this.authService.isLoggedIn();
    const isContractor = this.authService.isLoggedInUserAContractor(); // Adjust as needed

    if (isLoggedIn === false) {
      this.getNonUserData();
    } else if (isLoggedIn && isContractor === true) {
      this.getContractorData();
    } else {
      this.getHomeownerData();
    }

    // Filter by type if provided
    if (type != 'All') {
      this.data = this.data.filter((item) => item.serviceType?.toLowerCase() === type?.toLowerCase());
    }

    // Filter by option if provided (option is an array)
    // if (option) {
    //   data = data.filter((item) => option.includes(item.optionType));
    // }

    this.data = this.data.filter((item) => {
      if (!item.optionType) return false;
      // Split optionType into an array, trim spaces
      const types = item.optionType.split(',').map((s) => s.trim().toLowerCase());
      // Check if any option matches any type
      return option?.some((opt) => types.includes(opt.toLowerCase())) ?? false;
    });

    return of(this.data);
  }

  getNonUserData() {
    // IF NOT clamed an address.  can only see 'working in area''
    this.data = [
      {
        street: '4330 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'JnW Lawn Care',
        serviceType: 'Yard care',
        optionType: 'Working in Area', //  NOTE: when rerturning: save my jobs/my properties LAST!! (inner circle): 'Accepting Bids, For Sale, Trade, Partner, Cover, Working in Area, Unsolicited Bid, My Properties, My Jobs'
      },
      {
        street: '4316 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'JnW Lawn Care',
        serviceType: 'Yard care',
        optionType: 'Working in Area', //  NOTE: when rerturning: save my jobs/my properties LAST!! (inner circle): 'Accepting Bids, For Sale, Trade, Partner, Cover, Working in Area, Unsolicited Bid, My Properties, My Jobs'
      },
      {
        street: '14071 Inlet drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'JnW Lawn Care',
        serviceType: 'Yard care',
        optionType: 'Working in Area', //  NOTE: when rerturning: save my jobs/my properties LAST!! (inner circle): 'Accepting Bids, For Sale, Trade, Partner, Cover, Working in Area, Unsolicited Bid, My Properties, My Jobs'
      },
    ];
  }

  getHomeownerData() {
    // This method can be used to fetch the mock data directly if needed
    let isClamimed = true; // !!!! to smulate if the user has claimed an address

    this.data = [
      {
        // example accepting bid.  need to process to bid! and user to review.
        street: '4322 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        serviceType: 'Yard care',
        //  NOTE: when rerturning: save my jobs/my properties LAST!! (inner circle): 'Accepting Bids, For Sale, Trade, Partner, Cover, Working in Area, Unsolicited Bid, My Properties, My Jobs'
        optionType: isClamimed ? 'Unsolicited Bid, My Properties' : 'Unsolicited Bid',
      },
      {
        street: '4330 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'JnW Lawn Care',
        serviceType: 'Yard care',
        optionType: 'Working in Area', //  NOTE: when rerturning: save my jobs/my properties LAST!! (inner circle): 'Accepting Bids, For Sale, Trade, Partner, Cover, Working in Area, Unsolicited Bid, My Properties, My Jobs'
      },
      {
        street: '4316 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'JnW Lawn Care',
        serviceType: 'Yard care',
        optionType: 'Working in Area', //  NOTE: when rerturning: save my jobs/my properties LAST!! (inner circle): 'Accepting Bids, For Sale, Trade, Partner, Cover, Working in Area, Unsolicited Bid, My Properties, My Jobs'
      },
      {
        street: '14071 Inlet drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        businessName: 'JnW Lawn Care',
        serviceType: 'Yard care',
        optionType: 'Working in Area', //  NOTE: when rerturning: save my jobs/my properties LAST!! (inner circle): 'Accepting Bids, For Sale, Trade, Partner, Cover, Working in Area, Unsolicited Bid, My Properties, My Jobs'
      },
    ];
  }

  getContractorData() {
    // This method can be used to fetch the mock data directly if needed
    this.data = [
      {
        // example accepting bid.  need to process to bid! and user to review.
        street: '4322 Harbour Island drive',
        city: 'Jacksonville',
        state: 'FL',
        postalCode: '32225',
        serviceType: 'Yard care',
        optionType: 'Unsolicited Bid', //  NOTE: when rerturning: save my jobs/my properties LAST!! (inner circle): 'Accepting Bids, For Sale, Trade, Partner, Cover, Working in Area, Unsolicited Bid, My Properties, My Jobs'
      },
    ];
  }
}
