import {Component, AfterViewInit} from '@angular/core';
import {AnalyticsActions, SearchActions} from '@coveo/headless';
import {EngineService} from '../engine.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent implements AfterViewInit {
  constructor(private engineService: EngineService) {}

  executeSearch() {
    const {dispatch} = this.engineService.get();
    const action = SearchActions.executeSearch(
      AnalyticsActions.logInterfaceLoad()
    );
    dispatch(action);
  }

  ngAfterViewInit(): void {
    this.executeSearch();
  }
}
