
import { PartyCollection } from './PartyCollection';

export class Party{
  public uid: string;
  public partOf?: PartyCollection;
  constructor(uid: string){
    this.uid = uid;
  }
  
}