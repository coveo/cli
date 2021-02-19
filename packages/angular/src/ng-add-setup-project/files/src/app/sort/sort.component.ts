import {Component, OnInit} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {
  buildDateSortCriterion,
  buildRelevanceSortCriterion,
  buildSort,
  Sort,
  SortOrder,
} from '@coveo/headless';
import {EngineService} from '../engine.service';

@Component({
  selector: 'app-sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss'],
})
export class SortComponent implements OnInit {
  private headlessSort: Sort;
  sortCriterias: {caption: string; criterion: any}[];

  constructor(private engine: EngineService) {}

  selectionChange(change: MatSelectChange) {
    this.headlessSort.sortBy(change.value);
  }

  ngOnInit(): void {
    this.sortCriterias = [
      {
        caption: 'Relevance',
        criterion: buildRelevanceSortCriterion(),
      },
      {
        caption: 'Date Descending',
        criterion: buildDateSortCriterion(SortOrder.Descending),
      },
      {
        caption: 'Date Ascending',
        criterion: buildDateSortCriterion(SortOrder.Ascending),
      },
    ];

    this.headlessSort = buildSort(this.engine.get(), {
      initialState: {
        criterion: this.sortCriterias[0].criterion,
      },
    });
  }
}
