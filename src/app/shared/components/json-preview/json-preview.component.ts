/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-json-preview',
  templateUrl: './json-preview.component.html',
  styleUrls: ['./json-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JsonPreviewComponent implements OnInit {
  @Input() data;
  @Input() name;

  stringify = JSON.stringify;

  constructor(private dialogRef: MatDialogRef<JsonPreviewComponent>) { }
  ngOnInit() { }

  syntaxHighlight() {
    const json = JSON.stringify(this.data, null, 3)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,

      match => {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }

  downloadJSON() {
    const filename = this.name || new Date();
    const copy = JSON.parse(JSON.stringify(this.data));

    copy.map(obj => {
      obj.content.idData.assetId = '{{ assetId }}';
      obj.content.idData.createdBy = '{{ userAddress }}';

      delete obj.eventId;
      delete obj.metadata;
      delete obj.content.idData.dataHash;
      delete obj.content.signature;

      obj.content.data.map(eventObj => {

        ['timestamp', 'author', 'action', 'eventId', 'createdBy'].forEach(e => delete eventObj[e]);

        const type = eventObj.type.split('.').pop();
        if (type !== 'location') { delete eventObj.location; }
      });
    });
    const data = this.stringify(copy, null, 3);
    const blob = new Blob([data], { type: 'application/json' });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }

  closeDialog() { this.dialogRef.close(); }
}
