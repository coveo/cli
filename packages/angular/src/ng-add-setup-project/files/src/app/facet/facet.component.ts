import {Component, Input, OnInit} from '@angular/core';
import {buildFacet, Facet, FacetValue} from '@coveo/headless';
import {engine} from '../engine';

@Component({
  selector: 'app-facet',
  templateUrl: './facet.component.html',
  styleUrls: ['./facet.component.css'],
})
export class FacetComponent implements OnInit {
  @Input() field: string;
  @Input() title: string;

  private headlessFacet: Facet;

  constructor() {}

  toggleSelect(value: FacetValue) {
    // TODO:
    // this.headlessFacet.toggleSelect(value);
  }

  showMore() {
    // TODO:
    // this.headlessFacet.showMoreValues();
  }

  showLess() {
    // TODO:
    // this.headlessFacet.showLessValues();
  }

  get facetValues(): FacetValue[] {
    return this.headlessFacet.state.values;
  }

  private initializeController() {
    this.headlessFacet = buildFacet(engine, {
      options: {
        numberOfValues: 5,
        field: this.field,
      },
    });
  }

  ngOnInit(): void {
    this.initializeController();
    // this.facet.subscribe(() => this.updateState());
  }
}
