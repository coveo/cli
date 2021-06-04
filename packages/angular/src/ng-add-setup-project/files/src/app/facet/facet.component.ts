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
  @Input()
  public field!: string;
  @Input()
  public title!: string;

  private headlessFacet!: Facet;

  public constructor(private engineService: EngineService) {}

  public selectionChange(change: MatSelectionListChange) {
    change.options.forEach((option) => {
      this.headlessFacet.toggleSelect(option.value);
    });
  }

  public showMore() {
    this.headlessFacet.showMoreValues();
  }

  public showLess() {
    this.headlessFacet.showLessValues();
  }

  public canShowLess() {
    return this.headlessFacet.state.canShowLessValues;
  }

  public canShowMore() {
    return this.headlessFacet.state.canShowMoreValues;
  }

  public isFacetValueSelected(value: FacetValue): boolean {
    return this.headlessFacet.isValueSelected(value);
  }

  public get facetValues(): FacetValue[] {
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

  public ngOnInit(): void {
    this.initializeController();
  }
}
