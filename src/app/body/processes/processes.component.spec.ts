import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessesComponent } from './processes.component';

describe('ProcessesComponent', () => {
  let component: ProcessesComponent;
  let fixture: ComponentFixture<ProcessesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
