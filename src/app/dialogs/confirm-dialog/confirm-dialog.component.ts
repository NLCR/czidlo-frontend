import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
    data = inject(MAT_DIALOG_DATA);
    dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

    onConfirm(): void {
        // Close the dialog, return true
        this.dialogRef.close(true);
    }
    onCancel(): void {
        // Close the dialog, return false
        this.dialogRef.close(false);
    }
}
