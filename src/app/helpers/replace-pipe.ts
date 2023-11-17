import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'replace'})
export class ReplacePipe implements PipeTransform {
  transform(value: string, strToReplace: string, replacementStr: string): string {

    if(!value || ! strToReplace || ! replacementStr)
    {
      return value;
    }

 return value.replace(new RegExp(strToReplace, 'g'), replacementStr);
  }
}

@Pipe({name: 'jsonTryCatchReturndata'})
export class ReturndataPipe implements PipeTransform {
  
  transform(value) {
    
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      debugger  
      if(typeof value === "bigint") { return value.toString() } 
      else {
        return "(empty response)";
      }
    }
}
}
