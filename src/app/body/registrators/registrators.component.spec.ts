import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistratorsComponent } from './registrators.component';

describe('RegistratorsComponent', () => {
  let component: RegistratorsComponent;
  let fixture: ComponentFixture<RegistratorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistratorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
