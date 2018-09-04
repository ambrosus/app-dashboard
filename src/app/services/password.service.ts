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
  strengthObj = {};
  constructor() {}

  strengthCalculator(p: string) {
    let _force = 0;
    const _regex = /[$-/:-?{-~!"^_`\[\]]/g; // "
    const _lowerLetters = /[a-z]+/.test(p);
    const _upperLetters = /[A-Z]+/.test(p);
    const _numbers = /[0-9]+/.test(p);
    const _symbols = _regex.test(p);

    const _flags = [_lowerLetters, _upperLetters, _numbers, _symbols];

    let _passedMatches = 0;
    for (const _flag of _flags) {
      _passedMatches += _flag === true ? 1 : 0;
    }

    _force += 4 * p.length + ((p.length >= 10) ? 1 : 0);
    _force += _passedMatches * 10;

    // penality (short password)
    _force = (p.length <= 6) ? Math.min(_force, 10) : _force;

    // penality (poor variety of characters)
    _force = (_passedMatches === 1) ? Math.min(_force, 25) : _force;
    _force = (_passedMatches === 2) ? Math.min(_force, 60) : _force;
    _force = (_passedMatches === 3) ? Math.min(_force, 100) : _force;

    this.strengthObj['flags'] = _flags;
    this.strengthObj['width'] = _force;
    return this.strengthObj;
  }

}
