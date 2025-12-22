import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlienComponent } from './klien.component';

describe('KlienComponent', () => {
  let component: KlienComponent;
  let fixture: ComponentFixture<KlienComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlienComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KlienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
