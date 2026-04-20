import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { id } from '@swimlane/ngx-charts';

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
    // fileName: string = '';
    xsltFileName: string = '';
    xsltContent: string = '';

    onConfirm() {
        console.log('Přidat XSL stylesheet:', this.data);
        let newTransformation = {
            id: this.data.id || id(),
            name: this.data.name,
            description: this.data.description,
            file: this.xsltContent,
            filename: this.xsltFileName,
            created: new Date(),
        };
        this.data = newTransformation;
        this.dialogRef.close(this.data);
    }

    onCancel() {
        this.dialogRef.close(null);
    }

    // onFileSelected(event: any) {
    //     const file: File = event.target.files[0];
    //     this.fileName = file ? file.name : '';
    //     if (file) {
    //         this.data.selectedFile = file;
    //     }
    // }

    async onXsltSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        this.xsltFileName = file.name;

        // nejjednodušší: přečti obsah souboru jako text
        this.xsltContent = await file.text();

        // pokud chceš: validace že to vypadá jako XSLT
        if (!this.xsltContent.includes('<xsl:stylesheet') && !this.xsltContent.includes('<xsl:transform')) {
            console.warn('Soubor nevypadá jako XSLT.');
        }

        // důležité: když vybereš stejný soubor znovu, change se někdy nespustí
        input.value = '';
    }
}
