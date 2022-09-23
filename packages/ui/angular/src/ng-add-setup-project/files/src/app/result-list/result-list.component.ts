import {Component, OnInit} from '@angular/core';
import {buildResultList, Result, ResultList} from '@coveo/headless';
import {EngineService} from '../engine.service';

@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.scss'],
})
export class ResultListComponent implements OnInit {
  private headlessResultList!: ResultList;

  public constructor(private engineService: EngineService) {}

  public get results(): Result[] {
    return this.headlessResultList.state.results;
  }

  private initializeController() {
    this.headlessResultList = buildResultList(this.engineService.get());
  }

  public ngOnInit(): void {
    this.initializeController();
  }
}
