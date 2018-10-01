import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'loopInclude',
  pure: false,
})
export class LoopIncludePipe implements PipeTransform {
  transform(items: any[], filter: Array<any>): any {
    if (!items || !filter) {
      return items;
    }

    return items.filter(item => filter.indexOf(item) > -1);
  }
}
