import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-detail-dialog',
  standalone: false,
  templateUrl: './detail-dialog.component.html',
  styleUrl: './detail-dialog.component.scss'
})
export class DetailDialogComponent {
    dialogRef = inject(MatDialogRef<DetailDialogComponent>);
    data = inject(MAT_DIALOG_DATA);

    closeDialog(): void {
        // Logic to close the dialog
        this.dialogRef.close();
    }

}
