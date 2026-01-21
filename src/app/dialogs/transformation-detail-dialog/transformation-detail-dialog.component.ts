import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-transformation-detail-dialog',
  standalone: false,
  templateUrl: './transformation-detail-dialog.component.html',
  styleUrl: './transformation-detail-dialog.component.scss'
})
export class TransformationDetailDialogComponent {
    dialogRef = inject(MatDialogRef<TransformationDetailDialogComponent>);
    data = inject(MAT_DIALOG_DATA);

    closeDialog(): void {
        // Logic to close the dialog
        this.dialogRef.close();
    }

}
