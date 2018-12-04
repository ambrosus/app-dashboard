/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, ViewEncapsulation, AfterContentInit, QueryList, ContentChildren, Input } from '@angular/core';

@Component({
  selector: 'app-tab',
  template: '<div class="tabs__tab" [hidden]="!active"><ng-content></ng-content></div>',
  encapsulation: ViewEncapsulation.None,
})
export class TabComponent {
  @Input() label: string;
  @Input() active = false;
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

  constructor() { }
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TabsComponent implements AfterContentInit {

  @ContentChildren(TabComponent) tabList: QueryList<TabComponent>;
  currentTab: TabComponent;

  ngAfterContentInit() {
    const activeTab = this.tabList.toArray().find(tab => tab.active);
    // if there is no active tab set, activate the first
    if (!activeTab) {
      this.selectTab(this.tabList.first);
    }
  }

  selectTab(tab: TabComponent) {
    this.tabList.forEach(_tab => (_tab.active = false));
    tab.active = true;
  }

  isSelected(tab: TabComponent) {
    return this.currentTab.label === tab.label;
  }

}
