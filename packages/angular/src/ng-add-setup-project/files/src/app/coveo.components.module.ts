import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatListModule} from '@angular/material/list';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {ErrorComponent} from './error/error.component';
import {FacetListComponent} from './facet-list/facet-list.component';
import {FacetComponent} from './facet/facet.component';
import {PagerComponent} from './pager/pager.component';
import {QuerySummaryComponent} from './query-summary/query-summary.component';
import {ResultListComponent} from './result-list/result-list.component';
import {SearchBoxComponent} from './search-box/search-box.component';
import {SearchPageComponent} from './search-page/search-page.component';
import {SortComponent} from './sort/sort.component';
import {HeroComponent} from './hero/hero.component';
import {HomeComponent} from './home/home.component';
import {InitProvider} from './init.service';

@NgModule({
  declarations: [
    ErrorComponent,
    FacetComponent,
    FacetListComponent,
    PagerComponent,
    QuerySummaryComponent,
    ResultListComponent,
    SearchBoxComponent,
    SearchPageComponent,
    SortComponent,
    HeroComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatSelectModule,
    MatButtonModule,
  ],
  providers: [InitProvider],
})
export class CoveoComponentsModule {}
