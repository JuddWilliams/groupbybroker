import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecordService {
  constructor(private http: HttpClient) {}

  addRecord(record: any) {
    // Adjust the URL and payload as needed for your backend
    console.log('RecordService - Adding record:', record);
    //return this.http.post(`${environment.apiUrl}/records`, record);

    return of(record);
  }
}
