export class NamedArray {
    name: string = "";
    arr: Array<Array<string>>;
    
    constructor(name:string){
        this.name = name;
        this.arr = new Array<Array<string>>();
    }
}