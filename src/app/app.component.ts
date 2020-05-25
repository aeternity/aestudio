import { Component } from '@angular/core';
//import { ContractControlService } from "./contract-control.service";
import { Meta } from '@angular/platform-browser'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  //providers: [ContractControlService]
})
export class AppComponent {
  title = 'fire-editor';
  
  questions: any[];

  constructor(private meta: Meta){

    meta.addTag({name:"og:title",       content:"Sophia Fire Editor"})
    meta.addTag({name:"og:site_name",   content:"Nikita Fuchs"})
    meta.addTag({name:"og:url",         content:"http://fireeditor.nikitafuchs.de"})
    meta.addTag({name:"og:description", content:"Contract editor that does the work for you, not the other way round."})
    meta.addTag({name:"og:type",        content:"product"})
    meta.addTag({name:"og:image",       content:"assets/preview.png"})

  }
}
