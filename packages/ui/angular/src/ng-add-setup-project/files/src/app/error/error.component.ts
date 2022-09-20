import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
  public constructor() {}

  public ngOnInit(): void {}

  public get errorMessage() {
    return history.state.errorMessage || '';
  }
}
