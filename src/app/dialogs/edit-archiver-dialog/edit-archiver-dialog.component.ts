import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-edit-archiver-dialog',
    standalone: false,
    templateUrl: './edit-archiver-dialog.component.html',
    styleUrl: './edit-archiver-dialog.component.scss',
})
export class EditArchiverDialogComponent {
    dialogRef = inject(MatDialogRef<EditArchiverDialogComponent>);
    data = inject(MAT_DIALOG_DATA);

    name: string = '';
    description: string = '';

    ngOnInit(): void {
        this.name = this.data.name || '';
        this.description = this.data.description || '';
    }

    onConfirm(): void {
        this.dialogRef.close({
            name: this.name,
            description: this.description,
        });
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

}
