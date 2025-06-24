import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Preserving your router import
import { AuthService } from './services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MenuController, ModalController, ToastController } from '@ionic/angular';
import { AddRecordModalPage } from './add-record-modal/add-record-modal.page';
import { RecordModalService } from './services/addrecord-modal.service';
import { RecordService } from './services/record.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  private healthCheckInterval: any; // Store the interval ID

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    public router: Router, // Changed to public
    private toastController: ToastController,
    private menu: MenuController,
    private modalController: ModalController,
    private recordModalService: RecordModalService,
    private recordService: RecordService
  ) {} // Preserving your router dependency

  ngOnInit(): void {
    this.checkApiHealth();

    this.healthCheckInterval = setInterval(() => {
      this.checkApiHealth();
    }, 29 * 60 * 1000);
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  onMenu(): void {
    // This method can be used to handle menu actions if needed
    alert('Under Construction: Menu action triggered');
    this.closeMenu();
  }

  closeMenu() {
    this.menu.close();
  }

  checkApiHealth(): void {
    console.warn('API health check failed is disabled to while we use free subscription of azure sql server');
    return;

    const apiKey = environment.apiKey; // Your API key
    const headers = new HttpHeaders({
      'x-api-key': apiKey, // Add API key to headers
      'Content-Type': 'application/json', // Specify JSON content type
    });

    let apiUrl = environment.apiUrl + '/auth/dbhealthcheck';
    this.http.get(apiUrl, { headers }).subscribe({
      next: (response) => {
        console.log('API is healthy:', response);
      },
      error: (error) => {
        console.error('API health check failed:', error);
        //alert('The API is currently unavailable. Please try again later.');
        this.presentToast(
          'The API is currently unavailable. Please allow 30 seconds before refreshing page.',
          'warning',
          6000,
          'bottom'
        );
      },
    });
  }

  async presentToast(
    message: string,
    color: string = 'success',
    duration: number = 3000,
    position: 'top' | 'bottom' | 'middle' = 'top'
  ) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: position,
      color: color,
    });
    await toast.present();
  }

  get loggedInEmail(): string | null {
    return this.authService.getLoggedInEmail(); // Get the logged-in email
  }

  get loggedInUser(): string | null {
    return this.authService.getLoggedInUser(); // Get the logged-in user nickname
  }

  get isContractor(): boolean | null {
    return this.authService.isLoggedInUserAContractor(); // Get the logged-in user nickname
  }

  get contractorName(): string | null {
    return this.authService.getLoggedInContractorName(); // Get the logged-in user nickname
  }

  // onAdd(): void {
  //   // This method can be used to handle add actions if needed

  //   alert('Under Construction: Add action triggered');
  //   this.openAddRecordModal();
  // }
  // async onAdd() {
  //   const record = await this.recordModalService.openAddRecordModal();
  //   if (record) {
  //     this.addRecord(record);
  //   }
  // }

  async onAdd() {
    const record = await this.recordModalService.openAddRecordModal();
    if (record) {
      this.recordService.addRecord(record).subscribe({
        next: (response) => {
          console.log('Header Add(): Add record response:', response); // <-- log the API response here
          this.presentToast('New record added successfully!', 'success', 2000, 'bottom');
        },
        error: (error) => {
          console.error('Header Add():tabSearch: Add record error:', error); // <-- log the error if any
          this.presentToast('Failed to add record.', 'danger', 2000, 'bottom');
        },
      });
    }
  }

  // addRecord(record: any): void {
  //   // Implement the logic to add a record
  //   console.log('Added From Header: New record added (TODO-move to service so i can call from mapClick() ):', record);
  //   this.presentToast('New record added successfully!', 'success', 2000, 'bottom');
  // }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Preserving your navigation logic
  }

  getInitials(nickName: string): string {
    if (!nickName) return '';
    const initials = nickName.substring(0, 2).toUpperCase(); // Extract first 2 letters
    return initials;
  }

  isAuthPage(): boolean {
    const url = this.router.url;
    return url.includes('login') || url.includes('create-user') || url.includes('reset-password') || url.includes('tabDashboard');
  }
}
