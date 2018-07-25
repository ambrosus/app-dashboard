import {Component, OnInit, ViewEncapsulation, Input} from '@angular/core';

@Component({
  selector: 'app-json-preview',
  templateUrl: './json-preview.component.html',
  styleUrls: ['./json-preview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class JsonPreviewComponent implements OnInit {

  @Input () data;
  @Input () name;

  stringify = JSON.stringify;

  constructor() { }

  ngOnInit() {
  }

  syntaxHighlight() {
    let json = JSON.stringify(this.data, null, 3)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,

      function(match) {
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
    const filename = this.name;
    const copy = [];

console.log(this.data);

    this.data.map(obj => {
      copy.push(JSON.parse(JSON.stringify(obj)));
    });
    copy.map(obj => {
      obj.content.idData.assetId = '{{assetId}}';
      obj.content.idData.createdBy = '{{userAddress}}';
      delete obj.eventId;
      delete obj.metadata;
      delete obj.content.idData.dataHash;
      delete obj.content.signature;
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

}
