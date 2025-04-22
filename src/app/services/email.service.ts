import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'https://groupbuyology-api-h4eve4dmgkafbbbt.eastus2-01.azurewebsites.net/api/email';  
  //private apiUrl = 'https://localhost:7005/api/email';
  
  private apiKey = environment.apiKey; // Your API key

  constructor(private http: HttpClient) { }

  sendEmail(to: string, subject: string, content: string): Observable<any> {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey, // Add API key to headers
      'Content-Type': 'application/json', // Specify JSON content type
    });

    const body = {
      to,
      subject,
      content,
    };

    console.log('Sending email with body:', body); // Debugging line

    return this.http.post(`${this.apiUrl}/sendEmail`, body, { headers });
  }
}

