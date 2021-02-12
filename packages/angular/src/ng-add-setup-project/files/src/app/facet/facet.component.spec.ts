import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FacetComponent} from './facet.component';

describe('FacetComponent', () => {
  let component: FacetComponent;
  let fixture: ComponentFixture<FacetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FacetComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
