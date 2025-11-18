import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-edit-dl-catalog-dialog',
    standalone: false,
    templateUrl: './edit-dl-catalog-dialog.component.html',
    styleUrl: './edit-dl-catalog-dialog.component.scss',
})
export class EditDlCatalogDialogComponent {
    dialogRef = inject(MatDialogRef<EditDlCatalogDialogComponent>);
    data = inject(MAT_DIALOG_DATA);

    context: string = this.data.context;
    name: string = this.data.name;
    url: string = this.data.url;
    urlPrefix: string = this.data.urlPrefix;
    description: string = this.data.description;

    urlControl = new FormControl(this.context === 'dl' ? this.url : this.urlPrefix, [Validators.required, Validators.pattern(/^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/)]);
    nameControl = new FormControl(this.name, [Validators.required]);

    closeDialog(): void {
        // Logic to close the dialog
        this.dialogRef.close();
    }

    onConfirm(): void {
        // Logic to handle confirmation (e.g., save changes)
        let result = {name: '', description: '', url: '', urlPrefix: ''};
        if (this.context === 'dl') {
            result.name = this.nameControl.value as string;
            result.description = this.description;
            result.url = this.urlControl.value as string;
        }
        if (this.context === 'catalogue') {
            result.name = this.nameControl.value as string;
            result.description = this.description;
            result.urlPrefix = this.urlControl.value as string;
        }
        this.dialogRef.close(result);
    }
}
