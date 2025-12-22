import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RekapComponent } from './rekap.component';

describe('RekapComponent', () => {
  let component: RekapComponent;
  let fixture: ComponentFixture<RekapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RekapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RekapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
