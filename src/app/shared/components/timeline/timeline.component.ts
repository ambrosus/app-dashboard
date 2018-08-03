import { Component, OnInit, Input } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {
  events;
  perPage = 25;
  resultCount;
  currentPage;
  totalPages;
  pagination = [];

  @Input() data;
  @Input() assetId;

  constructor(private assets: AssetsService) {}

  ngOnInit() {
    this.events = this.data.events || [];
    this.currentPage = 1;
    this.resultCount = this.data.resultCount;
    this.totalPages = Math.ceil(this.resultCount / this.perPage);
    this.pagination = this.paginationGenerate(this.currentPage, this.totalPages);
  }

  paginationGenerate(currentPage, pageCount) {
    const delta = 2,
      left = currentPage - delta,
      right = currentPage + delta + 1;
    let result = [];

    result = Array.from({ length: pageCount }, (v, k) => k + 1).filter(i => i && i >= left && i < right);

    if (result.length > 1) {
      // Add first page and dots
      if (result[0] > 1) {
        if (result[0] > 2) {
          result.unshift('...');
        }
        result.unshift(1);
      }

      // Add dots and last page
      if (result[result.length - 1] < pageCount) {
        if (result[result.length - 1] !== pageCount - 1) {
          result.push('...');
        }
        result.push(pageCount);
      }
    }

    return result;
  }

  loadEvents(page) {
    this.assets
      .loadEvents(this.assetId, page)
      .then((resp: any) => {
        this.events = resp.events;
        this.currentPage = page + 1;
        this.resultCount = this.data.resultCount;
        this.totalPages = Math.ceil(this.resultCount / this.perPage);
        this.pagination = this.paginationGenerate(this.currentPage, this.totalPages);
      })
      .catch(err => {
        console.log('Load events error: ', err);
      });
  }
}
