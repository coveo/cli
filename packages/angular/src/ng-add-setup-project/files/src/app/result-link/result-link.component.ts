import {Component, Input, OnInit} from '@angular/core';
import {
  buildInteractiveResult,
  InteractiveResult,
  Result,
} from '@coveo/headless';
import {EngineService} from '../engine.service';

@Component({
  selector: 'app-result-link',
  templateUrl: './result-link.component.html',
  styleUrls: ['./result-link.component.scss'],
})
export class ResultLinkComponent implements OnInit {
  private headlessInteractiveResult!: InteractiveResult;
  @Input() public result!: Result;

  public constructor(private engineService: EngineService) {}

  private initializeController() {
    this.headlessInteractiveResult = buildInteractiveResult(
      this.engineService.get(),
      {options: {result: this.result}}
    );
  }

  public ngOnInit(): void {
    this.initializeController();
  }

  public get filteredUri() {
    const uri = this.result.clickUri;
    // Filters out dangerous URIs that can create XSS attacks such as `javascript:`.
    const isAbsolute = /^(https?|ftp|file|mailto|tel):/i.test(uri);
    const isRelative = /^(\/|\.\/|\.\.\/)/.test(uri);
    return isAbsolute || isRelative ? uri : '';
  }

  public select() {
    this.headlessInteractiveResult.select();
  }

  public beginDelayedSelect() {
    this.headlessInteractiveResult.beginDelayedSelect();
  }

  public cancelPendingSelect() {
    this.headlessInteractiveResult.cancelPendingSelect();
  }
}
