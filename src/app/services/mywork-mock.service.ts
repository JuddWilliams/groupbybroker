import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Address, ContractorListing } from '../models/address';

export interface MyWork {
  addresses?: Address[];
  listings?: ContractorListing[];
  userPreference?: string; // eg.
}

@Injectable({
  providedIn: 'root',
})
export class MyWorkMockService {
  private addressesSubject = new BehaviorSubject<Address[]>([]);
  addresses$ = this.addressesSubject.asObservable();

  data: MyWork | undefined;
  myAddress: Address | undefined;
  myAddressAcceptingBids: Address | undefined;

  constructor(private authService: AuthService) {}

  MyWorkMock(): Observable<MyWork> {
    const isContractor = this.authService.isLoggedInUserAContractor(); // Adjust as needed

    if (isContractor === false) {
      this.getHomeownerData();
    } else {
      this.getContractorData();
    }

    return of(this.data ?? { addresses: [], listings: [], userPreference: '' });
  }

  claimAddress(address: Address) {
    this.myAddress = address;
    this.addressesSubject.next([address]);
  }

  getClaimedAddress() {
    return this.myAddress; // Store the address in myAddress
  }

  getHomeownerData() {
    // This method can be used to fetch the mock data directly if needed
    //let isClamimed: boolean = false; // !!!! to smulate if the user has claimed an address

    if (this.myAddress !== undefined) {
      this.data = {
        addresses: [
          {
            street: this.myAddress.street,
            city: this.myAddress.city,
            state: this.myAddress.state,
            postalCode: this.myAddress.postalCode,
          },
        ],
        listings: [
          {
            address: {
              street: '4322 Harbour Island drive',
              city: 'Jacksonville',
              state: 'FL',
              postalCode: '32225',
            },
            type: 'Maid & Cleaning Services',
            // company: {
            //   id: 1,
            //   companyName: 'Pro Contractors LLC',
            // },
            private: false,
            optionType: 'Accepting Bids',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new google.maps.Size(32, 32),
            },
          },
        ],
        userPreference: 'userPref-tbd for homeowner-claimed',
      };
    } else {
      this.data = {
        addresses: [],
        listings: [],
        userPreference: 'userPref-tbd for homeowner-NOT claimed',
      };
    }
  }

  getContractorData() {
    this.data = {
      addresses: [],
      listings: [
        {
          address: {
            street: '4322 Harbour Island drive',
            city: 'Jacksonville',
            state: 'FL',
            postalCode: '32225',
          },
          type: 'Yard care',
          company: {
            id: 1,
            companyName: 'Pro Contractors LLC',
          },
          private: false,
          optionType: 'For Sale',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(32, 32),
          },
        },
      ],
      userPreference: 'userPref-tbd for contractor',
    };
  }
}
