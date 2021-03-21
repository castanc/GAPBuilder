import { SysLog } from "../backend/SysLog";

export class RecTypeInfo {
    name = "";
    code = "";
    icon = "";
    textColor = "";
    backgroundColor = "";

    constructor(item: []) {
        //RT	FOOD	Comida	Record Types	fa fa-utensils	brown
        this.code = item[0];
        this.name = item[1];
        this.icon = item[4];
        this.textColor = item[5];
    }
}