/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
