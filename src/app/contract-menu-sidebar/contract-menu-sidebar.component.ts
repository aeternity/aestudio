import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CompilerService } from '../compiler.service'
import { Subscription } from 'rxjs';
import { ContractBase } from '../question/contract-base';
import { FormGroup }        from '@angular/forms';
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

@Component({
  selector: 'contract-menu-sidebar',
  templateUrl: './contract-menu-sidebar.component.html',
  styleUrls: ['./contract-menu-sidebar.component.css']/* ,
  providers: [ CompilerService ] */
})


export class ContractMenuSidebarComponent implements OnInit {

  //Fires when a raw ACI is available (for gnerating init()'s interface
  rawACIsubscription: Subscription;

  // when a contract is deployed: 
  contractDeploymentSubscription: Subscription;

  aci: ContractBase<any>;
  initACI: ContractBase<any>;

  // mess around:
  temp: any;

  logTemp(input: any){
    console.log(input);
  }

  constructor(private compiler: CompilerService, private changeDetectorRef: ChangeDetectorRef) { }
 
  buildAContract() {
    // make compiler emit event

    // @parm: Maybe use param for editor identification later
    this.compiler.makeCompilerAskForCode(1);

  } 

  deployContract() {
    // make compiler emit event

    // @parm: Maybe use param for editor identification later
    //this.compiler.makeCompilerAskForCode(1);

    // take the ACI/ContractBase the compiler stores
    this.compiler.compileAndDeploy();
    
/*     setTimeout(() => {
      console.log("Hier kommts:");
      this.aci = this.compiler.aci;
      console.log(this.aci);
    }, 10000); */
     
    
  } 

  ngOnInit() {
      this.buildAContract();
    
    /*  this.subscription = this.compiler._fetchActiveCode
       .subscribe(item => console.log("Event in sidebar angekommen"));
 */
       this.rawACIsubscription = this.compiler._notifyCompiledAndACI
          .subscribe(item => {console.log("Neue ACI für init ist da !")
            this.initACI = this.compiler.initACI;
            console.log("Hier kommt init aci:", this.initACI);
            this.changeDetectorRef.detectChanges()
      });

      this.contractDeploymentSubscription = this.compiler._notifyDeployedContract
        .subscribe( async item => {
          // generate the interface for the contract
          this.aci = this.compiler.aci;
          this.changeDetectorRef.detectChanges()

          // test calling a value lol:
          //console.log("Active contracts: ", this.compiler.activeContracts);
          //let callresult = await this.compiler.activeContracts[0].methods.read_test_value();
          //console.log("UUUuuund call value ist: ", callresult.decodedResult); 
        })
  }

 
async callFunction(_theFunction: string, _theFunctionIndex: number){

  // fetch all entered params
  var params: any[] = [];


// TODO: Apply parameters

  console.log("Called function: ", _theFunction);
  //console.log(this.compiler.activeContracts[0].methods[_theFunction]);
  let callresult = await this.compiler.activeContracts[0].methods[_theFunction]();

  console.log("Hier kommt callresult: ", callresult.decodedResult);

  // set decoded result
  this.aci.functions[_theFunctionIndex].lastReturnData = callresult.decodedResult;
  this.changeDetectorRef.detectChanges()

  console.log("Das wurde geschrieben: ", this.aci.functions[_theFunctionIndex].lastReturnData)
}

}
