import {Component, OnInit} from '@angular/core';
import {
  buildDateSortCriterion,
  buildRelevanceSortCriterion,
  buildSort,
  Sort,
  SortByDate,
  SortByRelevancy,
  SortOrder,
  SortState,
} from '@coveo/headless';
import {engine} from '../engine';

@Component({
  selector: 'app-sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss'],
})
export class SortComponent implements OnInit {
  private headlessSort: Sort;
  state: SortState;
  relevanceSortCriterion: SortByRelevancy = buildRelevanceSortCriterion();
  dateDescendingSortCriterion: SortByDate = buildDateSortCriterion(
    SortOrder.Descending
  );
  dateAscendingSortCriterion: SortByDate = buildDateSortCriterion(
    SortOrder.Ascending
  );

  constructor() {}

  ngOnInit(): void {
    this.headlessSort = buildSort(engine, {
      initialState: {
        criterion: this.relevanceSortCriterion,
      },
    });
  }
}
