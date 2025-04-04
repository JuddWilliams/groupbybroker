import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Location } from '@angular/common'; // Import Location service
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email = '';
  password = '';
  errorMessage = '';
  loading = false; // Track loading state

  constructor(private authService: AuthService, private router: Router, private location: Location) {} // Inject Location service

  onCancel(): void {
    this.router.navigate(['/tabs/tabAbout']); // Navigate to the previous screen
  }

  onLogin(): void {
    this.loading = true; // Show spinner
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false; // Hide spinner
        console.log('Login successful:', response);
        this.authService.saveLogin(response.token, response.userId); // Pass the email
        this.router.navigate(['/tabs/tabSearch']);
      },
      error: (error) => {
        this.loading = false; // Hide spinner
        this.errorMessage = 'Invalid credentials. Please try again.';
      },
    });
  }
}
