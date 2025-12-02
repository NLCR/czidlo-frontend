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
        if (this.data?.reason !== undefined) {
            console.log('Reason provided:', this.data.reason);
            this.dialogRef.close({ confirmed: true, reason: this.data.reason });
        } else {
            this.dialogRef.close(true);
        }
    }
    onCancel(): void {
        // Close the dialog, return false
        this.dialogRef.close(false);
    }
}
