import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.page.html',
  styleUrls: ['./set-password.page.scss'],
  standalone: false,
})
export class SetPasswordPage implements OnInit {
  token: string = ''; // Token from query parameter
  newPassword: string = ''; // New password
  confirmPassword: string = ''; // Confirm new password
  errorMessage: string = ''; // Error message
  loading: boolean = false; // Loading state

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the token from the query parameters
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  onSetPassword(): void {
    // Validate that the passwords match
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    // Call the newPassword service method
    this.loading = true;
    const loggedInEmail = this.authService.getLoggedInEmail();
    this.authService.newPassword({
      token: this.token,
      password: this.newPassword,
      email: loggedInEmail || '', // Provide a fallback value if loggedInEmail is null
    }).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Password reset successful:', response);
        this.router.navigate(['/login']); // Redirect to login page
      },
      error: (error) => {
        this.loading = false;
        console.error('Password reset failed:', error);
        this.errorMessage = 'Failed to reset password. Please try again.';
      },
    });
  }
}