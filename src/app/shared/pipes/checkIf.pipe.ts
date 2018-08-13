import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkIf',
  pure: false
})
export class CheckIfPipe implements PipeTransform {
  transform(obj: any[], filter: string): any {
    const args = filter.split('.').splice(1);
    for (let i = 0; i < args.length; i++) {
        if (!obj || !obj.hasOwnProperty(args[i])) {
          return false;
        }
        obj = obj[args[i]];
    }
    return true;
  }
}
