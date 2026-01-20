import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-add-xsl-stylesheet',
    standalone: false,
    templateUrl: './add-xsl-stylesheet.component.html',
    styleUrl: './add-xsl-stylesheet.component.scss',
})
export class AddXslStylesheetComponent {
    dialogRef = inject(MatDialogRef<AddXslStylesheetComponent>);
    data = inject(MAT_DIALOG_DATA);
    _snackBar = inject(MatSnackBar);
    translate = inject(TranslateService);
    fileName: string = '';

    onConfirm() {
        console.log('Přidat XSL stylesheet:', this.data);
        this.dialogRef.close(this.data);
    }

    onCancel() {
        this.dialogRef.close(null);
    }

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        this.fileName = file ? file.name : '';
        if (file) {
            this.data.selectedFile = file;
        }
    }
}
