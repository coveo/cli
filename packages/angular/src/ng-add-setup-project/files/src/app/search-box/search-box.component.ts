import {Component, OnInit} from '@angular/core';
import {buildSearchBox, SearchBox, SearchBoxOptions} from '@coveo/headless';
import {FormControl} from '@angular/forms';
import {EngineService} from '../engine.service';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
})
export class SearchBoxComponent implements OnInit {
  public headlessSearchBox!: SearchBox;
  public myControl = new FormControl();
  public suggestions: {
    highlightedValue: string;
    rawValue: string;
  }[] = [];

  public constructor(private engineService: EngineService) {}

  public updateState() {
    this.suggestions = this.headlessSearchBox.state.suggestions;
  }

  public onSelect(value: string) {
    this.headlessSearchBox.selectSuggestion(value);
  }

  public onInput() {
    this.headlessSearchBox.updateText(this.myControl.value);
  }

  public search() {
    if (!this.headlessSearchBox.state.isLoading) {
      this.headlessSearchBox.submit();
      this.headlessSearchBox.hideSuggestions();
    }
  }

  private initializeController() {
    const options: SearchBoxOptions = {
      numberOfSuggestions: 3,
    };

    this.headlessSearchBox = buildSearchBox(this.engineService.get(), {
      options,
    });
  }

  public ngOnInit() {
    this.initializeController();
    this.headlessSearchBox.subscribe(() => this.updateState());
  }
}
