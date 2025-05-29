import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replace' })
export class ReplacePipe implements PipeTransform {
  transform(value: string, strToReplace: string, replacementStr: string): string {
    if (!value || !strToReplace || !replacementStr) {
      return value;
    }

    return value.replace(new RegExp(strToReplace, 'g'), replacementStr);
  }
}

@Pipe({ name: 'jsonTryCatchReturndata' })
export class ReturndataPipe implements PipeTransform {
  transform(value) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return 'Could not decode return data, please find it in the log console and create an issue on Github at https://github.com/aeternity/fire-editor, thank you!';
    }
  }
}
