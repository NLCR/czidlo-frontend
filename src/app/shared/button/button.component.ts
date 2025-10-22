import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-button',
    standalone: false,
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
})
export class ButtonComponent {
    @Input() variant: 'primary' | 'secondary' | 'tertiary' = 'primary';
    @Input() size: 's' | 'm' | 'l' = 'm';
    @Input() icon: boolean = false; // Jen ikonka bez textu
    @Input() iconLeft?: string; // Název ikonky pro levý ikon
    @Input() iconRight?: string; // Název ikonky pro pravý ikon
    @Input() disabled: boolean = false;
    @Input() warning: boolean = false;
}
