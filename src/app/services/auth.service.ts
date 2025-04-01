import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

export interface LoginResponse {
  userId: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiWeatherUrl = 'https://groupbuyology-api-h4eve4dmgkafbbbt.eastus2-01.azurewebsites.net/WeatherForecast';
  private apiUrl = 'https://groupbuyology-api-h4eve4dmgkafbbbt.eastus2-01.azurewebsites.net/api/Auth';   
  //private apiUrl = 'https://localhost:7005/api/auth';


  private apiKey = environment.apiKey; // Your API key
  private loggedInEmail: string | null = null; // Store the logged-in user's email

  constructor(private http: HttpClient) {}

  getWeatherForecast(): Observable<WeatherForecast[]> {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey, // Add the API key to the headers
    });

    return this.http.get<WeatherForecast[]>(this.apiWeatherUrl, { headers });
  }

  createUser(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey,
    });

    return this.http.post(`${this.apiUrl}/createUser`, userData, { headers });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey,
    });

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }, { headers });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.loggedInEmail = null; // Clear the email
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // Check if the user is logged in
  }

  saveLogin(token: string, userId: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);    
    this.loggedInEmail = userId; // Save the email
  }

  getLoggedInEmail(): string | null {
    if (!this.loggedInEmail) {
      this.loggedInEmail = localStorage.getItem('userId'); // Retrieve email from localStorage
    }
    return this.loggedInEmail; // Return the logged-in email
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email });
  }


}
