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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://groupbuyology-api-h4eve4dmgkafbbbt.eastus2-01.azurewebsites.net/WeatherForecast';
  private apiKey = environment.apiKey; // Your API key

  constructor(private http: HttpClient) {}

  getWeatherForecast(): Observable<WeatherForecast[]> {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey, // Add the API key to the headers
    });

    return this.http.get<WeatherForecast[]>(this.apiUrl, { headers });
  }
}
