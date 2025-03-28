import { Component } from '@angular/core';


import { environment } from 'src/environments/environment';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(public authService: AuthService) {
       
  }

  onLogout() {
    this.authService.logout(); // Call the logout method from AuthService
  }
}

