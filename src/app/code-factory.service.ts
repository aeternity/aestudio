import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import generate from './helpers/generate-nodejs';

@Injectable({
  providedIn: 'root',
})
export class CodeFactoryService {
  contract$ = new BehaviorSubject<null | {
    sourceCode: string;
    deployParams: unknown[];
    entrypointName: string;
    entrypointParams: unknown[];
  }>(null);

  addSdkSetup$ = new BehaviorSubject(true);

  addDeploy$ = new BehaviorSubject(true);

  addCall$ = new BehaviorSubject(true);

  code$ = combineLatest([this.contract$, this.addSdkSetup$, this.addDeploy$, this.addCall$]).pipe(
    map(([contract, addSdkSetup, addDeploy, addCall]) => {
      if (contract == null) return null;

      console.log('Generate in sidebar getriggert');
      console.log('Als parameter wurden übergeben:');
      console.log('_thefunctionName:', contract.entrypointName);
      console.log('the params:', contract.entrypointParams);
      console.log('the init params:', contract.deployParams);

      return generate({
        sdkSetup: addSdkSetup,
        sourceCode: addDeploy ? contract.sourceCode : null,
        deployParams: addDeploy ? contract.deployParams : null,
        entrypointName: addCall ? contract.entrypointName : null,
        entrypointParams: addCall ? contract.entrypointParams : null,
      });
    }),
  );
}
