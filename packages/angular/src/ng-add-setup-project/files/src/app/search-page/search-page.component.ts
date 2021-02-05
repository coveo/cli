import {Component, AfterViewInit} from '@angular/core';
import {AnalyticsActions, SearchActions} from '@coveo/headless';
import {engine} from '../engine';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css'],
})
export class SearchPageComponent implements AfterViewInit {
  constructor() {}

  executeSearch() {
    const {dispatch} = engine;
    const action = SearchActions.executeSearch(
      AnalyticsActions.logInterfaceLoad()
    );
    dispatch(action);
  }

  ngAfterViewInit(): void {
    this.executeSearch();
  }
}
