import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KaryawanComponent } from './karyawan.component';

describe('KaryawanComponent', () => {
  let component: KaryawanComponent;
  let fixture: ComponentFixture<KaryawanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KaryawanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KaryawanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
