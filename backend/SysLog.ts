import { Utils } from "./Utils";

export class SysLog {
    static folder;
    static ssLog;
    static level = 0;

    constructor() {
        SysLog.initialize();
    }

    static initialize() {
        if (this.ssLog == undefined) {
            SysLog.folder = Utils.getCreateFolder("SysLog");
            SysLog.ssLog = Utils.getCreateSpreadSheet(SysLog.folder, "SysLogs.txt");
            let sheet = this.ssLog.getActiveSheet();
            var range = sheet.getDataRange();
            range.clearContent();
        }
    }

    static log(level, msg, method = "", additional = "", data ="") {
        if (this.level == level || level == 9999)
        {
            SysLog.initialize();
            let ts = Utils.getTimeStamp();
            let row = [ts, "INFO", method, msg, additional,data];
            this.ssLog.appendRow(row);
            Logger.log(row);
        }
    }

    static logException(ex, method = "", additional = "", add2 ="") {
        SysLog.initialize();
        let ts = Utils.getTimeStamp();
        let row = [ts, "EXCEPTION", ex.messaage, method, additional, ex.stack, add2];
        //ex.prototype.fileName,ex.prototype.lineNumber,ex.prototype.columnNumber
        this.ssLog.appendRow(row);

        Logger.log(JSON.stringify(row));
    }

}
