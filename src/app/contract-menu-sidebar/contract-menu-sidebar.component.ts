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

  //display loading icon when deploying contract
  deploymentLoading: boolean = false;

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

    // display loading
    this.deploymentLoading = true;

    // make compiler emit event
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

      // fires when new contract got compiled
       this.rawACIsubscription = this.compiler._notifyCompiledAndACI
          .subscribe(item => {console.log("Neue ACI für init ist da !")
            this.initACI = this.compiler.initACI;
            console.log("Hier kommt init aci:", this.initACI);
            this.changeDetectorRef.detectChanges()
      });

      // fires when new contract got deployed
      this.contractDeploymentSubscription = this.compiler._notifyDeployedContract
        .subscribe( async item => {
          // generate the interface for the contract
          this.deploymentLoading = false;
          this.aci = this.compiler.aci;
          this.changeDetectorRef.detectChanges()

          // test calling a value lol:
          //console.log("Active contracts: ", this.compiler.activeContracts);
          //let callresult = await this.compiler.activeContracts[0].methods.read_test_value();
          //console.log("UUUuuund call value ist: ", callresult.decodedResult); 
        })
  }

 
async callFunction(_theFunction: string, _theFunctionIndex: number){

  // activate loader
  this.aci.functions[_theFunctionIndex].loading = true
  //this.changeDetectorRef.detectChanges()
  console.log("Loader ist: ", this.aci.functions[_theFunctionIndex].loading )
  // fetch all entered params
  var params: any[] = [];

  this.aci.functions[_theFunctionIndex].arguments.forEach(oneArg => {
    console.log("Ein arg: ", oneArg.currentInputData)
    params.push(oneArg.currentInputData)
  });


  // "Apply" parameters and call function
  console.log("Called function: ", _theFunction);

  let callresult = await this.compiler.activeContracts[0].methods[_theFunction].apply(null, params);
  console.log("Das call object: ", callresult);
  console.log("Hier kommt callresult: ", callresult.decodedResult);

  //deactivate loader
  this.aci.functions[_theFunctionIndex].loading = false
  //this.changeDetectorRef.detectChanges()

  // set decoded result
  this.aci.functions[_theFunctionIndex].lastReturnData = callresult.decodedResult;
  this.changeDetectorRef.detectChanges()
  console.log("Loader ist: ", this.aci.functions[_theFunctionIndex].loading )
  console.log("Das wurde als callresult geschrieben: ", this.aci.functions[_theFunctionIndex].lastReturnData)
   
}

}
