import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {
    isActive = 'registered';

    constructor(private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {
        this.route.url.subscribe((url) => {
            if (url.length > 0) {
                this.isActive = url[1].path;
                console.log('Statistics route changed:', this.isActive);
            }
        });
    }

}
