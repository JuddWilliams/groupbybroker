import { Component, OnInit } from '@angular/core';
import { AuthService, WeatherForecast } from '../services/auth.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
  }
}