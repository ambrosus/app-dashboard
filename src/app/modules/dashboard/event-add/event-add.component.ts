import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "app/services/auth.service";

@Component({
  selector: 'app-event-add',
  templateUrl: './event-add.component.html',
  styleUrls: ['./event-add.component.scss']
})
export class EventAddComponent implements OnInit {
  eventForm: FormGroup;
  error: boolean = false;
  spinner: boolean = false;

  constructor(private auth: AuthService) {
    this.eventForm = new FormGroup({
      'input1': new FormControl(null, [Validators.required]),
      'input2': new FormControl(null, [Validators.required]),
      'input3': new FormControl(null, [Validators.required]),
      'input4': new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() {
  }

  onSave() {
    const i1 = this.eventForm.get('input1').value;
    const i2 = this.eventForm.get('input2').value;
    const i3 = this.eventForm.get('input3').value;
    const i4 = this.eventForm.get('input4').value;

    if (!this.eventForm.valid) {
      this.error = true;
    } else {
      this.error = false;
    }

    if (!this.error) {
      this.spinner = true;
      // Get the token
      console.log(i1, i2, i3, i4);
      setTimeout(() => {
        this.spinner = false;
        this.eventForm.reset();
        this.auth.cleanForm.next(true);
      }, 2000);
    }
  }
}
