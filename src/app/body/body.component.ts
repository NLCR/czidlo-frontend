import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-body',
    standalone: false,
    templateUrl: './body.component.html',
    styleUrl: './body.component.scss',
})
export class BodyComponent {
    constructor(private route: ActivatedRoute, private router: Router) {}
    ngOnInit(): void {
        this.route.url.subscribe((url) => {
            if (url.length === 0) {
                this.router.navigate(['/information']);
            }
        });
    }
}
