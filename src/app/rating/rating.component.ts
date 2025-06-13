import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  standalone: false,
})
export class RatingComponent {
  @Input() percent = 0; // 0 to 100
  totalStars = 4;

  get fillWidths(): number[] {
    // Each star is 25%
    const widths = [];
    let remaining = this.percent;
    for (let i = 0; i < this.totalStars; i++) {
      const fill = Math.max(0, Math.min(remaining, 100 / this.totalStars));
      widths.push((fill / (100 / this.totalStars)) * 100); // percent of this star
      remaining -= 100 / this.totalStars;
    }
    return widths;
  }
}
