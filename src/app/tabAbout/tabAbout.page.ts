import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LocationService } from '../services/location.service';
import { AuthService } from '../services/auth.service';

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
    { initials: 'JW', name: 'Joe', feedback: 'I love this website. It’s the best!', date: '12/4' },
    { initials: 'HR', name: 'Henry', feedback: 'I use this site every day.', date: '12/4' },
    { initials: 'AB', name: 'Alice', feedback: 'Great platform for finding contractors!', date: '12/4' },
    { initials: 'MK', name: 'Mike', feedback: 'Saved me so much time and money!', date: '12/4' },
    { initials: 'LS', name: 'Lisa', feedback: 'Highly recommend this to everyone.', date: '12/4' },
  ];

  isFeedbackPopupOpen = false; // Track whether the feedback modal is open
  newFeedback = ''; // Store the user's feedback

  constructor(private locationService: LocationService, private authService: AuthService) {}

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

  getCurrentDate(): string {
    const now = new Date();
    const month = (now.getMonth() + 1).toString();
    const day = now.getDate().toString();
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
        if (postalCode.startsWith('322')) {
          // if postal code AND if below threshold
          if (this.numberOfContractorsInArea < this.numberOfContractorsInAreaThreshold) {
            this.locationNote = `Good news, as we expand to new markets it's free for your postal code ${postalCode}.`; // Update button text
            this.locationService.showFreeAlert();
          } else {
            this.locationNote = `*There are ${this.numberOfContractorsInArea} other Contractors using our service in this area.`;
          }
        } else {
          // if postal code AND if below threshold
          this.locationNote = `Good news, as we expand to new markets it's free for your postal code ${postalCode}.`; // Update button text
          this.locationService.showFreeAlert();
        }
      } else {
        // Handle invalid or non-numeric postal code
        console.error('Invalid postal code:', postalCode);
        this.locationNote = 'Note: We were unable to determine your location.';
      }
    }
  }
}
