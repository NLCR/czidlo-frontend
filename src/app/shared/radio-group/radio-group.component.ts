import {
    Component,
    ContentChildren,
    QueryList,
    AfterContentInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    AfterViewInit,
    SimpleChanges,
} from '@angular/core';
import { RadioButtonComponent } from '../radio-button/radio-button.component';

@Component({
    selector: 'app-radio-group',
    standalone: false,
    templateUrl: './radio-group.component.html',
    styleUrls: ['./radio-group.component.scss'],
})
export class RadioGroupComponent implements AfterContentInit, AfterViewInit {
    @Input() value: any;
    @Output() valueChange = new EventEmitter<any>();
    @Input() orientation: 'horizontal' | 'vertical' = 'vertical';
    @Input() gap = 12; // px

    @ContentChildren(RadioButtonComponent) radios!: QueryList<RadioButtonComponent>;

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value']) {
            // když rodič změní selectedState, přepni radios
            this.updateCheckedStates();
            // někdy pomůže dotlačit změnu do UI
            this.cdr.detectChanges();
        }
    }

    ngAfterContentInit(): void {
        this.bindRadios();
    }

    ngAfterViewInit(): void {
        // aktualizace proběhne AŽ po prvním renderu
        Promise.resolve().then(() => {
            this.updateCheckedStates();
            this.cdr.detectChanges();
        });
    }

    private bindRadios(): void {
        this.radios.forEach((radio) => {
            radio.changed.subscribe((val) => {
                this.value = val;
                this.updateCheckedStates();
                this.valueChange.emit(val);
            });
        });
    }

    private updateCheckedStates(): void {
        if (!this.radios) return;
        this.radios.forEach((radio) => {
            radio.checked = radio.value === this.value;
        });
    }
}
