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
        // Nedovol potvrzení, pokud předchůdce neprojde validací práv.
        if (this.predecessorError()) {
            return;
        }
        // Close the dialog, return true
        if (this.data?.reason !== undefined) {
            console.log('Reason provided:', this.data.reason);
            this.dialogRef.close({ confirmed: true, reason: this.data.reason, predecessor: this.data.predecessor });
        } else {
            this.dialogRef.close(true);
        }
    }
    onCancel(): void {
        // Close the dialog, return false
        this.dialogRef.close(false);
    }

    /** Vytáhne kód registrátora z urn:nbn (urn:nbn:cz:<kód>-<dokument>), jinak null. */
    predecessorRegistrarCode(): string | null {
        const match = /^urn:nbn:cz:([^-\s]+)-\S+$/i.exec((this.data?.predecessor ?? '').trim());
        return match ? match[1] : null;
    }

    /**
     * Vrátí i18n klíč chyby pro pole předchůdce, nebo null když je to v pořádku.
     * Validace je aktivní jen když volající předá `predecessorRegistrarValidator`.
     */
    predecessorError(): string | null {
        const validator = this.data?.predecessorRegistrarValidator;
        if (typeof validator !== 'function') {
            return null;
        }
        const code = this.predecessorRegistrarCode();
        if (!code) {
            return 'search.predecessor-invalid';
        }
        return validator(code) ? null : 'search.predecessor-no-rights';
    }
}
