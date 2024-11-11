export class Contract<T> {
  public contractUID: string = '';
  public code: string;
  public showInTabs: boolean = true;
  public nameInTab: string = 'AECodeName';
  public shareId: string = '';
  public activeTab: boolean = false;
  public errorHighlights: any;
  public sharingHighlighters: any[] = [];
  public latestACI: any;

  constructor(params: { [key: string]: any }) {
    this.contractUID = String(Date.now());
    params._nameInTab != undefined ? (this.nameInTab = params._nameInTab) : true;
    params._shareId != undefined ? (this.shareId = params._shareId) : true;
    params._code != undefined ? (this.code = params._code) : (this.code = `your ae code`);
  }

  //experimental
  public showInTabsOrNot(): boolean {
    return this.showInTabs;
  }
}
