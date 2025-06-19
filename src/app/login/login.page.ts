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

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

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

    // while the api is down for submscription reasons..mocking response.
    //
    //

    const mockResponse = {
      // userid: {
      //   id: 1,
      //   name: 'Judd Williams',
      //   email: 'juddsurfs@gmail.com',
      // },
      userId: 'juddsurfs@gmail.com',
      nickName: 'Judd',
      token: 'mock-jwt-token',
    };

    // Simulate what you would do on a successful login
    this.loading = false; // Hide spinner
    console.log('Login successful:', mockResponse);
    const isContractor = true; // Default to false, can be set based on your logic
    const contractorName = 'JnW Lawn Care'; // Default contractor name, can be set based on your logic
    this.authService.saveLogin(mockResponse.token, mockResponse.userId, mockResponse.nickName, isContractor, contractorName); // Save login details
    this.router.navigate([this.returnUrl]); // Redirect to the originally requested URL

    // working code. uncomment once backend is subscribed to
    //

    // this.authService.login(this.email, this.password).subscribe({
    //   next: (response) => {
    //     this.loading = false; // Hide spinner
    //     console.log('Login successful:', response);
    //     this.authService.saveLogin(response.token, response.userId, response.nickName); // Save login details
    //     this.router.navigate([this.returnUrl]); // Redirect to the originally requested URL
    //   },
    //   error: (error) => {
    //     this.loading = false; // Hide spinner
    //     this.errorMessage = error.error;//'Invalid credentials. Please try again.';
    //     console.error('Login error:', error);
    //   },
    // });
  }
}
