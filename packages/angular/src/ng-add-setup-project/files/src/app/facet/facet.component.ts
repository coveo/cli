import {Component, Input, OnInit} from '@angular/core';
import {MatSelectionListChange} from '@angular/material/list';
import {buildFacet, Facet, FacetValue} from '@coveo/headless';
import {EngineService} from '../engine.service';

@Component({
  selector: 'app-facet',
  templateUrl: './facet.component.html',
  styleUrls: ['./facet.component.scss'],
})
export class FacetComponent implements OnInit {
  @Input() field: string;
  @Input() title: string;

  private headlessFacet: Facet;

  constructor(private engineService: EngineService) {}

  selectionChange(change: MatSelectionListChange) {
    change.options.forEach((option) => {
      this.headlessFacet.toggleSelect(option.value);
    });
  }

  showMore() {
    this.headlessFacet.showMoreValues();
  }

  showLess() {
    this.headlessFacet.showLessValues();
  }

  canShowLess() {
    return this.headlessFacet.state.canShowLessValues;
  }

  canShowMore() {
    return this.headlessFacet.state.canShowMoreValues;
  }

  isFacetValueSelected(value: FacetValue): boolean {
    return this.headlessFacet.isValueSelected(value);
  }

  get facetValues(): FacetValue[] {
    return this.headlessFacet.state.values;
  }

  private initializeController() {
    this.headlessFacet = buildFacet(this.engineService.get(), {
      options: {
        numberOfValues: 5,
        field: this.field,
      },
    });
  }

  ngOnInit(): void {
    this.initializeController();
  }
}
