export interface User {
  uid: string;
  email: string;
  displayName?: string;
  myCustomData?: string;
  testnetKeys?: object[];
}
