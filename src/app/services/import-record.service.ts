import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImportRecordService {
    public registrators = signal<Array<string>>(['aba001', 'aba004', 'aba006', 'aba007']);
    public intellectualEntities = signal<Array<string>>([
        'MONOGRAPH',
        'MONOGRAPH_VOLUME',
        'PERIODICAL',
        'PERIODICAL_VOLUME',
        'PERIODICAL_ISSUE',
        'ANALYTICAL',
        'THESIS',
        'OTHER',
        'SOUND_COLLECTION'
    ]);
}
