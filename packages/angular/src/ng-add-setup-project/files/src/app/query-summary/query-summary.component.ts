import {Component, OnInit} from '@angular/core';
import {
  buildQuerySummary,
  QuerySummary,
  QuerySummaryState,
} from '@coveo/headless';
import {EngineService} from '../engine.service';

@Component({
  selector: 'app-query-summary',
  templateUrl: './query-summary.component.html',
  styleUrls: ['./query-summary.component.scss'],
})
export class QuerySummaryComponent implements OnInit {
  private headlessQuerySummary: QuerySummary;

  constructor(private engine: EngineService) {}

  get state(): QuerySummaryState {
    return this.headlessQuerySummary.state;
  }

  ngOnInit(): void {
    this.headlessQuerySummary = buildQuerySummary(this.engine.get());
  }
}
