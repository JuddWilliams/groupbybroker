import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false,
})
export class ResetPasswordPage {
  email = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) {}

  onResetPassword(): void {
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.authService.resetPassword(this.email).subscribe({
      next: () => {
        this.successMessage = 'A password reset link has been sent to your email.';
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'Failed to send reset link. Please try again.';
        this.successMessage = '';
      },
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
