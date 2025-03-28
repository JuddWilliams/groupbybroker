import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Preserving your router import
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(public authService: AuthService, private router: Router) {} // Preserving your router dependency

  get loggedInEmail(): string | null {
    return this.authService.getLoggedInEmail(); // Get the logged-in email
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Preserving your navigation logic
  }

  getInitials(email: string): string {
    if (!email) return '';
    const initials = email.substring(0, 2).toUpperCase(); // Extract first 2 letters
    return initials;
  }
}

