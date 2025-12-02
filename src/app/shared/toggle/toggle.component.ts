import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-toggle',
    standalone: false,
    templateUrl: './toggle.component.html',
    styleUrl: './toggle.component.scss',
})
export class ToggleComponent {
    @Input() checked = false;
    @Input() size: 's' | 'l' = 's';
    @Input() disabled = false;
}
