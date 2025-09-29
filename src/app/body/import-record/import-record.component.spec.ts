import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportRecordComponent } from './import-record.component';

describe('ImportRecordComponent', () => {
  let component: ImportRecordComponent;
  let fixture: ComponentFixture<ImportRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
