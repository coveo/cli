import {Component, AfterViewInit} from '@angular/core';
import {EngineService} from '../engine.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent implements AfterViewInit {
  public constructor(private engineService: EngineService) {}

  public executeSearch() {
    this.engineService.get().executeFirstSearch();
  }

  public ngAfterViewInit(): void {
    this.executeSearch();
  }
}
