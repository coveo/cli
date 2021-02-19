import {Component, AfterViewInit} from '@angular/core';
import {AnalyticsActions, SearchActions} from '@coveo/headless';
import {EngineService} from '../engine.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent implements AfterViewInit {
  constructor(private engine: EngineService) {}

  executeSearch() {
    const {dispatch} = this.engine.get();
    const action = SearchActions.executeSearch(
      AnalyticsActions.logInterfaceLoad()
    );
    dispatch(action);
  }

  ngAfterViewInit(): void {
    this.executeSearch();
  }
}
