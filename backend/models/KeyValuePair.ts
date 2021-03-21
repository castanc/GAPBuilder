export class KeyValuePair<T,V>{
    key: T;
    value: V;

    constructor(key,value)
    {
        this.key = key;
        this.value = value;
    }
}