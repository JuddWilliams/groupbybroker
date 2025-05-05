import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LocationService } from '../services/location.service';
import { AuthService } from '../services/auth.service';
import { ContractorListingsService } from '../services/contractor-listings.service';

@Component({
  selector: 'app-tabAbout',
  templateUrl: 'tabAbout.page.html',
  styleUrls: ['tabAbout.page.scss'],
  standalone: false,
})
export class TabAboutPage implements OnInit {
  
  numberOfContractorsInArea: number = 0;
  readonly numberOfContractorsInAreaThreshold: number = 5;
  isPopupOpen = false;
  locationNote: string = '';
  reviews = [
    { initials: 'JW', name: 'Joe', feedback: 'In these uncertain times, I needed a way to further my business and improve the bottom line.', date: '4/4' },
    { initials: 'HR', name: 'Henry', feedback: 'As a homeowner I\'ve found a contractor with great reviews and offered me a great deal as he was in the neighborhood!', date: '5/20' },
    { initials: 'AB', name: 'Alice', feedback: 'Great platform for finding contractors!', date: '6/17' },
    { initials: 'MK', name: 'Lisa', feedback: 'I\'m saving.. and my contractor loves it too as he\'s doing better as well.', date: '7/2' },
    { initials: 'LS', name: 'Mike', feedback: 'As a contractor, I have not only increased my revenue but I\'m doing it in less time.  Thank you Group Buyology!!!', date: '6/8' },
  ];

  isFeedbackPopupOpen = false; // Track whether the feedback modal is open
  newFeedback = ''; // Store the user's feedback

  constructor(private locationService: LocationService, private authService: AuthService, private contractorListingsService: ContractorListingsService) {}

  async ngOnInit() {
    this.getUserLocationAndCheckPostalCode();
  }

  openPopup() {
    this.isPopupOpen = true; // Open the popup
  }

  closePopup() {
    this.isPopupOpen = false; // Close the popup
  }

  openFeedbackPopup(): void {
    this.isFeedbackPopupOpen = true; // Open the feedback modal
  }

  test(): void {
    /* 
 this.contractorListingsService.ContractorListings(undefined, 'FL', undefined, 'electrical').subscribe({
      next: (response) => console.log('Response:', response),
      error: (error) => console.error('Error:', error),
    });
     */
    this.contractorListingsService.ContractorListings(undefined, 'FL', '32', 'Lawn Care').subscribe({
      next: (response) => console.log('Response:', response),
      error: (error) => console.error('Error:', error),
    });
  }

  closeFeedbackPopup(): void {
    this.isFeedbackPopupOpen = false; // Close the feedback modal
    this.newFeedback = ''; // Clear the feedback input
  }

  submitFeedback(): void {
    const loggedInEmail = this.authService.getLoggedInEmail();
    if (!loggedInEmail) {
      alert('You must be logged in to leave feedback.');
      return;
    }

    if (this.newFeedback.trim()) {
      const initials = this.getInitials(loggedInEmail);
      const date = this.getCurrentDate();
      this.reviews.unshift({
        initials,
        name: loggedInEmail,
        feedback: this.newFeedback.trim(),
        date,
      });
      this.closeFeedbackPopup(); // Close the modal after submitting
    } else {
      alert('Please enter your feedback before submitting.');
    }
  }

  getInitials(email: string): string {
    if (!email) return '';
    const parts = email.split('@')[0]; // Use the part before the '@'
    return parts.substring(0, 2).toUpperCase(); // Extract the first 2 letters
  }

  getCurrentDate(offsetDays: number = 0): string {
    const now = new Date();
    now.setDate(now.getDate() + offsetDays); 
    const month = (now.getMonth() + 1).toString();
    const day = now.getDate().toString();
    return `${month}/${day}`;
  }

  getFirstDayOfNextMonth(): string { 
    const now = new Date();
    const nextMonth = now.getMonth() + 2; // Move to the next month
    const year = nextMonth > 11 ? now.getFullYear() + 1 : now.getFullYear(); // Handle year rollover
    const month = (nextMonth % 12) === 0 ? '12' : (nextMonth % 12).toString(); // Ensure month is zero-padded
    const day = '1'; // Always the 1st day of the month
    return `${month}/${day}`;
  }

  async getUserLocationAndCheckPostalCode() { 
    const location = await this.locationService.getUserLocation();
    if (location) {
      const postalCode = await this.locationService.getPostalCodeFromCoordinates(
        location.latitude,
        location.longitude
      );

      console.log(`Postal Code: ${postalCode}`);

      // Validate that postalCode is a numeric value
      if (postalCode && /^\d+$/.test(postalCode)) {
        let dateExpiring = this.getFirstDayOfNextMonth();
        if (postalCode.startsWith('322')) {
          // if postal code AND if below threshold
          if (this.numberOfContractorsInArea < this.numberOfContractorsInAreaThreshold) {
            this.locationNote = `Good news, as we expand to new markets for a limited time it's free for your postal code ${postalCode}. *Expires ${dateExpiring}*`; // Update button text
            this.locationService.showFreeAlert();
          } else {
            this.locationNote = `*There are ${this.numberOfContractorsInArea} other Contractors using our service in this area.`;
          }
        } else {
          // if postal code AND if below threshold
          this.locationNote = `Good news, as we expand to new markets for a limited time 
          it's free for your postal code ${postalCode}. Expires ${dateExpiring}`; // Update button text
          this.locationService.showFreeAlert();
        }
      } else {
        // Handle invalid or non-numeric postal code
        console.error('Invalid postal code:', postalCode);
        this.locationNote = 'Note: We were unable to determine your location.';
      }
    }
    else {
      alert( `We're unable to determine your locaton.  You may have disabled location access for groupBuyology.com.\n
        To enable location access, please go to your browser settings:\n
        - In Chrome: Go to Settings > Privacy and Security > Site Settings > Permissions > Location: Under 'Customized behaviors' then delete. Return to page and refresh.\n
        - In Safari: Go to Settings > Safari > Location, and allow location access.\n
        - In Firefox: Click the shield icon in the address bar, then manage location permissions.`
     );
      console.error('Unable to retrieve location.');
      this.locationNote = 'Note: We were unable to determine your location.';
    }
  }
}
