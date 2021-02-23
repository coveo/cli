import {Component, OnInit} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {
  buildPager,
  buildResultsPerPage,
  Pager,
  PagerState,
  ResultsPerPage,
  ResultsPerPageState,
} from '@coveo/headless';
import {EngineService} from '../engine.service';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.scss'],
})
export class PagerComponent implements OnInit {
  private headlessPager: Pager;
  private headlessResultPerPage: ResultsPerPage;

  constructor(private engineService: EngineService) {}

  get pager(): PagerState {
    return this.headlessPager.state;
  }

  get resultPerPage(): ResultsPerPageState {
    return this.headlessResultPerPage.state;
  }

  onPageEvent(event: PageEvent) {
    if (!this.headlessResultPerPage.isSetTo(event.pageSize)) {
      // If page size change
      this.headlessResultPerPage.set(event.pageSize);
      this;
    } else {
      this.headlessPager.selectPage(event.pageIndex + 1);
    }
  }

  get pageSize() {
    return this.resultPerPage.numberOfResults;
  }

  get pageCount() {
    return this.pager.maxPage;
  }

  get pageIndex() {
    return this.pager.currentPage - 1;
  }

  private initializeControllers() {
    this.headlessPager = buildPager(this.engineService.get(), {
      options: {numberOfPages: 3},
    });

    this.headlessResultPerPage = buildResultsPerPage(this.engineService.get(), {
      initialState: {numberOfResults: 10},
    });
  }

  ngOnInit(): void {
    this.initializeControllers();
  }
}
