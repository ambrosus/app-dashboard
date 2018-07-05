export class PasswordService {

  private symbool: object = {
    'isit': 'false'
  };
  private nucbool: object = {
    'isit': 'false'
  };
  private numbool: object = {
    'isit': 'false'
  };
  width: Number;
  value: String;
  constructor() {}

  strengthCalculator(input) {
    this.value = input;
    // Additions :-D
    const noc = this.value.length; // Number of Characters
    const nuc = this.value.replace(/[^A-Z]/g, '').length; // Uppercase Letters
    const nlc = this.value.replace(/[^a-z]/g, '').length; // Lowercase Letters
    const num = this.value.replace(/[^0-9]/g, '').length; // Numbers
    let symr: number;
    const sym = this.value.match(/[ !@#$£%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g); // Symbols
    if (!sym) {
      symr = 0;
    } else {
      symr = sym.length;
    }

    // Deductions :-(
    let aucr: number; // Letters Only Resolver
    const auc = this.value === this.value.toUpperCase();
    if (auc === false) {
      aucr = noc;
    } else {
      aucr = 0;
    } // Letters Only
    let anvr: number; // Number Only Resolver
    const anv = +this.value;
    if (anv !== NaN || anv !== 0) {
      anvr = noc;
    } else {
      anvr = 0;
    } // Numbers Only
    let cons: number; // Repeat Characters Resolver
    if (this.value.match(/(.)\1\1/)) {
      cons = noc * noc;
    } else {
      cons = 0;
    } // Repeat Characters
    // The MF math
    const additions = ((noc * 4) + ((noc - nuc) * 2) + ((nlc - nuc) * 2) + (num * 4) + ((symr) * 6));
    const deductions = ((aucr) + (anvr) + cons);
    const total = additions - deductions;
    if (sym == null) {
      this.symbool['isit'] = false;
    } else {
      this.symbool['isit'] = true;
    }
    if (nuc === 0) {
      this.nucbool['isit'] = false;
    } else {
      this.nucbool['isit'] = true;
    }
    if (num === 0) {
      this.numbool['isit'] = false;
    } else {
      this.numbool['isit'] = true;
    }
    if (total < 101) {
      if (total < 0) {
        return this.width = 1;
      } else {
        return this.width = total;
      }
    } else {
      return this.width = 100;
    }
  }

}
