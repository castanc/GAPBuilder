import { Utils } from "../backend/Utils";

export class GlucLevel {
    min=0;
    max=0;
    backgroundColor="";
    textColor="";
    count=0;
    acumulado=0;

    // constructor(text:string){
    //     //`0,59,"blueviolet
    //     let arr = text.split(",");
    //     this.min = Number(arr[0]);
    //     this.max = Number(arr[1]);
    //     this.backgroundColor = Utils.replace(arr[2],'"','');
    // }

    constructor(row: [])
    {
        this.min = row[1];
        this.max = row[2];
        this.backgroundColor = row[3];

    }
}