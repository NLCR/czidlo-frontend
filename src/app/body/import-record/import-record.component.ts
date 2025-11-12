import { Component, signal } from '@angular/core';
import { FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormBuilder, FormGroup } from '@angular/forms';
import { ImportRecordService } from '../../services/import-record.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ENTITY_CONFIG } from './entity-config';

@Component({
    selector: 'app-import-record',
    standalone: false,
    templateUrl: './import-record.component.html',
    styleUrl: './import-record.component.scss',
})
export class ImportRecordComponent {
    // assignedRegistars = [];
    assignedRegistars = ['aba001', 'boa001'];
    selectedRegistrar: string = '';
    registrationMode: Array<{ value: string; label: string }> = [];
    selectedMode: string = '';
    intellectualEntities = new FormControl();
    intellectualEntitiesList = signal(<Array<string>>[]);
    selectedEntity: string = '';
    isSidebarOpen = signal(false);
    form!: FormGroup;
    sections: any[] = [];

    constructor(
        private importRecordService: ImportRecordService,
        private translate: TranslateService,
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        console.log('sidebar', this.isSidebarOpen());
        this.translate.get(['import.resolver', 'import.reservation']).subscribe((translations) => {
            this.registrationMode = [
                { value: 'resolver', label: translations['import.resolver'] },
                { value: 'reservation', label: translations['import.reservation'] },
            ];
            this.selectedMode = this.registrationMode[0].value;
            this.selectedRegistrar = this.assignedRegistars[0];
            this.intellectualEntitiesList.set(this.importRecordService.intellectualEntities() || []);
            this.selectedEntity = this.intellectualEntitiesList()[0];
        });

        this.route.url.subscribe((url) => {
            console.log('url changed', url);
            if (url.length > 1) {
                this.isSidebarOpen.set(true);
                this.selectedEntity = url[1].path;
            } else {
                this.isSidebarOpen.set(false);
            }
        });

        const config = ENTITY_CONFIG['IntellectualEntities'][this.selectedEntity];
        console.log('entity config', config);
        const group: any = {};
        // vytvoření formuláře podle konfigurace
        Object.entries(config).forEach(([sectionName, fields]) => {
            if (Array.isArray(fields)) {
                fields.forEach((field) => {
                    group[field.name] = ['', field.required ? [Validators.required] : []];
                });
            }
        });
        console.log('form group', group);
        this.form = this.fb.group(group);
        this.sections = Object.entries(config);
        console.log('sections', this.sections);
    }
    buildEntityFormGroup(fields: any[]): FormGroup {
        const group: any = {};
        fields.forEach((field) => {
            group[field.name] = new FormControl('');
        });
        return new FormGroup(group);
    }
    compareMode(a: string, b: string) {
        return a === b;
    }
    openSidebar() {
        console.log('opening sidebar', this.selectedEntity);
        this.router.navigate(['/import', this.selectedEntity]);
    }

    closeSidebar() {
        this.router.navigate(['/import']);
    }
    onSubmit() {
        console.log(this.form.value);
    }
}
