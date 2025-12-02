import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-checkbox',
    standalone: false,
    templateUrl: './checkbox.component.html',
    styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
    @Input() checked = false;
    @Input() label?: string;
    @Input() disabled = false;

    @Output() checkedChange = new EventEmitter<boolean>();

    toggle(): void {
        if (this.disabled) return;
        this.checked = !this.checked;
        this.checkedChange.emit(this.checked);
    }
}
