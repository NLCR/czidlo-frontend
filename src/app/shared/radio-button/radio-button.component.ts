import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-radio-button',
  standalone: false,
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],
})
export class RadioButtonComponent {
  @Input() label = '';
  @Input() name = '';
  @Input() value: any;
  @Input() checked = false;
  @Input() disabled = false;

  @Output() changed = new EventEmitter<any>();

  onSelect(): void {
    if (this.disabled) return;
    this.changed.emit(this.value);
  }
}
