import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  standalone: false,
})
export class RatingComponent {
  @Input() percent = 0; // 0 to 100

  get fillWidths(): number[] {
    // 4 stars, each star is 25%
    const widths = [];
    let remaining = this.percent;
    for (let i = 0; i < 4; i++) {
      widths.push(Math.max(0, Math.min(remaining, 25)) * 4); // 0-100% width per star
      remaining -= 25;
    }
    return widths;
  }
}
