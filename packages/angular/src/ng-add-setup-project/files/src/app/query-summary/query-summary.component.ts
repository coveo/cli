import {Component, OnInit} from '@angular/core';
import {
  buildQuerySummary,
  QuerySummary,
  QuerySummaryState,
} from '@coveo/headless';
import {engine} from '../engine';

@Component({
  selector: 'app-query-summary',
  templateUrl: './query-summary.component.html',
  styleUrls: ['./query-summary.component.scss'],
})
export class QuerySummaryComponent implements OnInit {
  private headlessQuerySummary: QuerySummary;
  // state: QuerySummaryState;

  constructor() {}

  // private updateState() {
  //   this.state = this.headlessQuerySummary.state;
  // }

  get state(): QuerySummaryState {
    return this.headlessQuerySummary.state;
  }

  ngOnInit(): void {
    this.headlessQuerySummary = buildQuerySummary(engine);
    // this.headlessQuerySummary.subscribe(() => this.updateState());
  }
}
