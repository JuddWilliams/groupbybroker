import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContractorListingsService {

    private apiUrl = environment.apiUrl;  
    //private apiUrl = 'https://localhost:7005/api/email';
    
    private apiKey = environment.apiKey; // Your API key
  
    constructor(private http: HttpClient) { }
  
    ContractorListings(city?: string, state?: string, postalCode?: string, type?: string,  option?:string[]): Observable<any> {
      const headers = new HttpHeaders({
        'x-api-key': this.apiKey, // Add API key to headers
        'Content-Type': 'application/json', // Specify JSON content type
      });
    
      // Build query parameters dynamically
      const queryParams: string[] = [];
      if (city) queryParams.push(`city=${encodeURIComponent(city)}`);
      if (state) queryParams.push(`state=${encodeURIComponent(state)}`);
      if (postalCode) queryParams.push(`postalCode=${encodeURIComponent(postalCode)}`);
      if (type) queryParams.push(`type=${encodeURIComponent(type)}`);
      //if (option) queryParams.push(`option=${encodeURIComponent(option)}`);
      if (option && option.length) {
        option.forEach(opt => queryParams.push(`option=${encodeURIComponent(opt)}`));
}
    
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    
      // Make the HTTP request
      return this.http.get(`${this.apiUrl}/ContractorListings${queryString}`, { headers });
    }
}


