import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.page.html',
  styleUrls: ['./create-user.page.scss'],
  standalone: false,
})
export class CreateUserPage {
  nickName = '';
  email = ''; 
  password = '';
  errorMessage = '';

  // List of U.S. states
  states: string[] = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  constructor(private authService: AuthService, private router: Router) {}

  onCreateUser(): void {
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return; // Stop execution if the email is invalid
    }

    const hashedPassword = bcrypt.hashSync(this.password, 10); // Cost factor of 10
    
    const userData = {
      nickName: this.nickName,
      email: this.email,            
      password: hashedPassword, 
    };

    console.log('User data before sending to API:', userData); // Debugging line

    this.authService.createUser(userData).subscribe({
      next: (response) => {
        console.log('User created successfully:', response); // Debugging line
        // Automatically log in the user after successful registration
        this.authService.saveLogin(response.token, response.userId);
        this.router.navigate(['/tabs/tabSearch']); // Redirect to the dashboard or another page
      },
      error: (error) => {
        console.log('Failed to create user. Please try again: ', error); // Debugging line
        this.errorMessage = 'Failed to create user. Please try again.';
      },
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}