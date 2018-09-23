import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-json-form',
  templateUrl: './json-form.component.html',
  styleUrls: ['./json-form.component.scss']
})
export class JsonFormComponent implements OnInit {
  error;
  success;
  spinner = false;
  textArea: any = '';

  @Input() prefill;
  @Input() assetId: String[];
  @Input() for = 'asset';

  constructor() { }

  ngOnInit() {
  }

  validJSON(input) {
    try {
      JSON.parse(input.value);
      this.error = false;
    } catch (error) {
      this.error = true;
    }
  }

  uploadJSON(event) {
    const file = event.target.files[0];
    const that = this;

    const reader = new FileReader();

    reader.onload = function (e) {
      const text = reader.result;
      that.textArea = text;
    };
    reader.readAsText(file);
  }

  insertTab(e, jsonInput) {
    if (e.keyCode === 9) {
      const start = jsonInput.selectionStart;
      const end = jsonInput.selectionEnd;

      const value = jsonInput.value;

      // set textarea value to: text before caret + tab + text after caret
      jsonInput.value = `${value.substring(0, start)}\t${value.substring(end)}`;

      // put caret at right position again (add one for the tab)
      jsonInput.selectionStart = jsonInput.selectionEnd = start + 1;

      // prevent the focus lose
      e.preventDefault();
    }
  }



  onJSONSave(input) {
    const json = input.value;
    if (json) {
      this.error = false;
      let data;

      try {
        data = JSON.parse(json);
      } catch (e) {
        this.invalidJSON = true;
        return;
      }

      this.spinner = true;

      this.assetService.createAsset(data).subscribe(
        (resp: any) => {
          console.log('Asset and events created: ', resp);
          this.success = true;
          setTimeout(() => {
            this.success = false;
          }, 3000);
          this.spinner = false;
        },
        error => {
          console.log('Asset and event creation failed: ', error);
          this.errorResponse = true;
          this.spinner = false;
        }
      );
    } else {
      this.error = true;
    }
  }
}
