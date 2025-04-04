import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
  returnUrl: string = '/'; // Default redirect URL

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get the returnUrl from the query parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  
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
        this.authService.saveLogin(response.token, response.userId); // Save login details
        this.router.navigate([this.returnUrl]); // Redirect to the originally requested URL
      },
      error: (error) => {
        this.loading = false; // Hide spinner
        this.errorMessage = 'Invalid credentials. Please try again.';
      },
    });
  }
}
