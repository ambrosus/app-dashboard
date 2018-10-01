import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'loopExclude',
  pure: false,
})
export class LoopExcludePipe implements PipeTransform {
  transform(items: any[], filter: Array<any>): any {
    if (!items || !filter) {
      return items;
    }

    return items.filter(item => filter.indexOf(item) < 0);
  }
}
