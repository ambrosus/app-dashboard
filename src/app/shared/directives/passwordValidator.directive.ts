import { Directive, ElementRef, Renderer2, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appPasswordValidator]',
  exportAs: 'flagArray'
})
export class PasswordValidatorDirective {

  private symbool: object = {
    'isit': 'false'
  };
  private nucbool: object = {
    'isit': 'false'
  };
  private numbool: object = {
    'isit': 'false'
  };
  value: String;
  strengthObj = {};
  public width = 1;
  public colors: any = [
    '#D9534F', '#DF6A4F', '#E5804F', '#EA974E', '#F0AD4E', '#D2AF51',
    '#B5B154', '#97B456', '#7AB659', '#5CB85C', '#5CB85C'];
  public color = '#D9534F';
  flags = [];
  p: string;
  div = document.createElement('div');
  pvEl: any;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.pvEl = [];
    this.pvEl[0] = this.el.nativeElement.parentNode.parentNode;
  }

  @HostListener('keyup', ['$event'])
  calculateStrength(event: KeyboardEvent) {
    this.p = this.el.nativeElement.value;

    let _force = 0;
    const _regex = /[$-/:-?{-~!"^_`\[\]]/g; // "
    const _lowerLetters = /[a-z]+/.test(this.p);
    const _upperLetters = /[A-Z]+/.test(this.p);
    const _numbers = /[0-9]+/.test(this.p);
    const _symbols = _regex.test(this.p);
    const _length = this.p.length >= 8 ? true : false;

    const _flags = [_lowerLetters, _upperLetters, _numbers, _symbols, _length];

    let _passedMatches = 0;
    for (const _flag of _flags) {
      _passedMatches += _flag === true ? 1 : 0;
    }

    _force += 4 * this.p.length + ((this.p.length >= 10) ? 1 : 0);
    _force += _passedMatches * 10;

    // penality (short password)
    _force = (this.p.length <= 6) ? Math.min(_force, 10) : _force;

    // penality (poor variety of characters)
    _force = (_passedMatches === 1) ? Math.min(_force, 25) : _force;
    _force = (_passedMatches === 2) ? Math.min(_force, 60) : _force;
    _force = (_passedMatches === 3) ? Math.min(_force, 100) : _force;

    this.flags = _flags;

    const i = Math.round(_force / 10);
    this.color = i > this.colors.length - 1 ? this.colors[this.colors.length - 1] : this.colors[i];

    this.strengthObj['color'] = this.color;

    const b = document.createElement('div');
    b.classList.add('progress_bar');
    b.style.width = _force + '%';
    b.style.background = this.color;

    const c = document.createElement('div');
    c.innerHTML = '<p>Your strong password must: </p>';
    c.style.paddingTop = '10px';

    const d = document.createElement('div');
    const dCheck = document.createElement('div');
    const dPara = document.createElement('p');
    if (_flags[0]) {
      dCheck.classList.add('pwdcheck-checked');
    } else {
      dCheck.classList.add('pwdcheck-unchecked');
    }
    dPara.innerHTML = 'Contain a lowercase letter';
    dPara.style.display = 'inline';

    d.appendChild(dCheck);
    d.appendChild(dPara);

    const e = document.createElement('div');
    const eCheck = document.createElement('div');
    const ePara = document.createElement('p');
    if (_flags[1]) {
      eCheck.classList.add('pwdcheck-checked');
    } else {
      eCheck.classList.add('pwdcheck-unchecked');
    }
    ePara.innerHTML = 'Contain a capital letter';
    ePara.style.display = 'inline';

    e.appendChild(eCheck);
    e.appendChild(ePara);

    const f = document.createElement('div');
    const fCheck = document.createElement('div');
    const fPara = document.createElement('p');
    if (_flags[2]) {
      fCheck.classList.add('pwdcheck-checked');
    } else {
      fCheck.classList.add('pwdcheck-unchecked');
    }
    fPara.innerHTML = 'Contain a number';
    fPara.style.display = 'inline';

    f.appendChild(fCheck);
    f.appendChild(fPara);

    const g = document.createElement('div');
    const gCheck = document.createElement('div');
    const gPara = document.createElement('p');
    if (_flags[3]) {
      gCheck.classList.add('pwdcheck-checked');
    } else {
      gCheck.classList.add('pwdcheck-unchecked');
    }
    gPara.innerHTML = 'Contain special character';
    gPara.style.display = 'inline';

    g.appendChild(gCheck);
    g.appendChild(gPara);

    const h = document.createElement('div');
    const hCheck = document.createElement('div');
    const hPara = document.createElement('p');
    if (_flags[4]) {
      hCheck.classList.add('pwdcheck-checked');
    } else {
      hCheck.classList.add('pwdcheck-unchecked');
    }
    hPara.innerHTML = 'Be atleast 8 characters';
    hPara.style.display = 'inline';

    h.appendChild(hCheck);
    h.appendChild(hPara);

    const finalDiv = document.createElement('div');
    finalDiv.style.paddingBottom = '20px';
    finalDiv.appendChild(b);
    finalDiv.appendChild(c);
    finalDiv.appendChild(d);
    finalDiv.appendChild(e);
    finalDiv.appendChild(f);
    finalDiv.appendChild(g);
    finalDiv.appendChild(h);

    if (this.pvEl[0].childElementCount > 1) {
      this.pvEl[0].removeChild(this.pvEl[0].lastChild);
    }
    this.pvEl[0].insertBefore(finalDiv, this.pvEl.firstChild);
  }

  getFlags() {
    return this.flags;
  }

}
