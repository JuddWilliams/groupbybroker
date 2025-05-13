import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Preserving your router import
import { AuthService } from './services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  private healthCheckInterval: any; // Store the interval ID

  constructor(private http: HttpClient, 
    public authService: AuthService, 
    private router: Router,
  private toastController: ToastController ) {} // Preserving your router dependency

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

  checkApiHealth(): void {
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
        this.presentToast('The API is currently unavailable. Please allow 30 seconds before refreshing page.', 'warning', 6000, 'bottom');
      },
    });
  }

  async presentToast(message: string, color: string = 'success', duration: number = 3000, position: 'top' | 'bottom' | 'middle' = 'top' ) {
    const toast = await this.toastController.create({    
      message: message,
      duration: duration,
      position: position,
      color: color
    });
    await toast.present();
  }

  get loggedInEmail(): string | null {
    return this.authService.getLoggedInEmail(); // Get the logged-in email
  }

  get loggedInUser(): string | null {
    return this.authService.getLoggedInUser(); // Get the logged-in user nickname
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Preserving your navigation logic
  }

  getInitials(nickName: string): string {
    if (!nickName) return '';
    const initials = nickName.substring(0, 2).toUpperCase(); // Extract first 2 letters
    return initials;
  }
}

