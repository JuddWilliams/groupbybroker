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

  private apiKey = environment.apiKey; // Your API key

  constructor(private http: HttpClient) {}

  getWeatherForecast(): Observable<WeatherForecast[]> {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey, // Add the API key to the headers
    });

    return this.http.get<WeatherForecast[]>(this.apiWeatherUrl, { headers });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  rememberUser(token: string, userId: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
  }
}
