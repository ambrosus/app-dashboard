import { StorageService } from 'app/services/storage.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent implements OnInit {
  env = 'dev';

  constructor(private storage: StorageService) {}

  ngOnInit() {
    this.env = this.storage.environment;
  }
}
