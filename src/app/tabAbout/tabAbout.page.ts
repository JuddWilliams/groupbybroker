import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, AlertInput, IonInput, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab-about',
  templateUrl: './tabAbout.page.html',
  styleUrls: ['./tabAbout.page.scss'],
  standalone: false,
})
export class TabAboutPage {
  isPopupOpen = false; // State to control the popup visibility

  constructor() {}

  openPopup() {
    this.isPopupOpen = true; // Open the popup
  }

  closePopup() {
    this.isPopupOpen = false; // Close the popup
  }
}
