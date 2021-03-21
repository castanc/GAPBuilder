import { SysLog } from "../backend/SysLog";
import { Utils } from "../backend/Utils";
import { KeyValuePair } from "./KeyValuePair";

export class KVPCollection {
    arr = new Array<KeyValuePair<string, string>>();


    add(key, value) {
        this.arr.push(new KeyValuePair<string, string>(key, value));
    }

    update(key, value, addIfNew = true) {
        let existing = this.arr.filter(x => x.key == key);
        if (existing.length > 0)
            existing[0].value = value;
        else if ( addIfNew)
            this.arr.push(new KeyValuePair<string, string>(key, value));
    }

    remove(key)
    {
        this.arr = this.arr.filter(x=>x.key!=key);
    }

    updateOnly(key, value) {
        let existing = this.arr.filter(x => x.key == key);
        if (existing.length > 0)
            existing[0].value = value;
    }


    get(key): string {
        let existing = this.arr.filter(x => x.key == key);
        if (existing.length > 0)
            return existing[0].value;
        else
            return "";
    }

    getNumber(key): number {
        try
        {
        let existing = this.arr.filter(x => x.key == key);
        if (existing.length > 0)
            return Number(existing[0].value);
        else
            return 0;
        }
        catch(ex)
        {
            return 0;
        }
    }

    initialize(colNames) {
        let c = colNames.split(",");
        for (var i = 0; i < c.length; i++) {
            this.add(c[i], "");
        }
    }

    addRange(data: KVPCollection) {
        for (var i = 0; i < data.arr.length; i++) {
            this.update(data.arr[i].key, data.arr[i].value);
        }
    }

    getColNames():string{

        let cols = "";
        for(var i=0; i< this.arr.length; i++)
        {
            cols = `${cols}${this.arr[i].key},`;
        }
        let index = cols.lastIndexOf(",");
        if ( index >0 )
            cols = cols.substring(0,index);
        return cols;
    }

    getColValues():string{

        let cols = "";
        for(var i=0; i< this.arr.length; i++)
        {
            cols = `${cols}${this.arr[i].value},`;
        }
        let index = cols.lastIndexOf(",");
        if ( index >0 )
            cols = cols.substring(0,index);
        return cols;
    }



}