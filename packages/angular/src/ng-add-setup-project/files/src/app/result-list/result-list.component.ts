import {Component, OnInit} from '@angular/core';
import {buildResultList, Result, ResultList} from '@coveo/headless';
import {engine} from '../engine';

@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.css'],
})
export class ResultListComponent implements OnInit {
  private headlessResultList: ResultList;

  constructor() {}

  get results(): Result[] {
    return this.headlessResultList.state.results;
  }

  private initializeController() {
    this.headlessResultList = buildResultList(engine);
  }

  ngOnInit(): void {
    this.initializeController();
  }
}
