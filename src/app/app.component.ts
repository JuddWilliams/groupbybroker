import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent { 
  constructor(public authService: AuthService, private router: Router) {}

  get loggedInEmail(): string | null {
    return this.authService.getLoggedInEmail(); // Get the logged-in email
  }

  onLogout() {
    this.authService.logout(); // Call the logout method from AuthService
    this.router.navigate(['/tabs/tabAbout']); // Redirect to the tabAbout page
  }
}

