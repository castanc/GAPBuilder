import { FileInfo } from "./Models/FileInfo";
import { GSResponse } from "./Models/GSResponse";
import { SysLog } from "./SysLog";
import {GSResult } from "./models/GSResult";

export class Utils {

    static ex;
    static sortCol2 = 9;
    static sortDescending2 = false;
    static getCreateFolder(folderName) {
        var folders = DriveApp.getFoldersByName(folderName);
        var folder = null;
        if (folders.hasNext())
            folder = folders.next();
        else
            folder = DriveApp.createFolder(folderName);
        return folder;
    }

    static getFolder(folderUrl:string)
    {
        let folder = null;
        if ( folderUrl.toLowerCase().startsWith("http"))
        {
            let index = folderUrl.lastIndexOf("/");
            if ( index > 0 )
            {
                let folderId = folderUrl.substr(index+1);
                folder = DriveApp.getFolderById(folderId);
            }

        }
        else 
            folder = this.getCreateFolder(folderUrl);
        return folder;
    }

    

    static ValidateEmail(mail) {
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail))
            return true;
        return false;
    }

    static getTimeStamp(dt: Date = null) {
        if (dt == null)
            dt = new Date();
        return Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyy-MM-dd HH-mm-ss');
    }

    static getDateYMD(dt=null)
    {
        if ( dt == null )
            dt = new Date();

            return Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }

    //https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript

    static isDate(dt)
    {
        let result =true;
        if (Object.prototype.toString.call(dt) === "[object Date]") {
            // it is a date
            if (isNaN(dt.getTime())) {  // d.valueOf() could also work
              // date is not valid
              result = false;
            } else {
              // date is valid
              result = true;
            }
          } else {
            result =false;
          }
        return result;

    }

    static getYMD(dt: Date = null) {
        let sDate = "";
        if (dt == null)
            dt = new Date();

        try {
            sDate = Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        }
        catch (ex) {
        }
        return sDate;
    }

    static getHM(dt: Date = null) {
        let sDate = "";
        if (dt == null)
            dt = new Date();
        try {
            sDate = Utilities.formatDate(dt, Session.getScriptTimeZone(), 'HH:mm');
        }
        catch(ex)
        {

        }
        return sDate;
    }


    static getDocTextByName(fileName): string {
        var text = "";

        try {
            let doc = this.openDoc(fileName);
            if (doc != null)
                text = doc.getBody().getText();
        }
        catch (ex) {
            Logger.log(`getDocTextByName() Exception.fileName: ${fileName} ${ex.message}`);
        }
        return text;
    }

    //https://stackoverflow.com/questions/16840038/easiest-way-to-get-file-id-from-url-on-google-apps-script
    static getIdFromUrl(url) {
        return url.match(/[-\w]{25,}/);
    }

    static getFileInfo(name) {
        let fi = null;
        let id = this.getIdFromUrl(name)
        if (id != null) {
            let file = DriveApp.getFileById(id);
            if (file != undefined) {
                fi = new FileInfo();
                fi.setFileInfo(file);
                fi.nameUrl = name;
            }
        }
        else {
            let fileInfos = Utils.getFilesByName(name);
            if (fileInfos.length > 0) {
                fi = fileInfos[0];
            }
        }
        return fi;
    }


    static openSpreadSheet(ssName, folder=null) {
        let ss = null;
        try {
            if (ssName.toLowerCase().indexOf("http") >= 0) {
                ss = SpreadsheetApp.openByUrl(ssName);
            }
            else {
                if ( folder == null )
                    folder = DriveApp.getRootFolder();

                let files = folder.getFilesByName(ssName);
                let file = null;
                if ( files.hasNext())
                    file = files.next();

                if ( file != null )
                    ss = SpreadsheetApp.openById(file.getId());
            }
        }
        catch (ex) {
            ss = null;
        }
        return ss;
    }


    static openDoc(docName) {
        let ss = null;
        try {
            if (docName.toLowerCase().indexOf("http") >= 0) {
                ss = DocumentApp.openByUrl(docName);
            }
            else {
                let fileInfos = Utils.getFilesByName(docName);
                if (fileInfos.length > 0)
                    ss = DocumentApp.openById(fileInfos[0].id);
                else
                    ss = DocumentApp.openById(docName);
            }
        }
        catch (ex) {
            ss = null;
        }
        return ss;
    }

    static getFilesByName(name: string) {
        let fileInfos = new Array<FileInfo>();
        let files = DriveApp.getFilesByName(name);
        while (files.hasNext()) {
            let file = files.next();
            //if ( !file.isTrashed)
            {
                let fi = new FileInfo();
                fi.setFileInfo(file);
                fileInfos.push(fi);
            }
        }
        return fileInfos;

    }

    static getSpreadSheet(folder, fileName) {
        let spreadSheet = null;

        let file = Utils.getFileFromFolder(fileName, folder);
        if (file != null) {
            spreadSheet = SpreadsheetApp.openById(file.getId());
        }
        return spreadSheet;
    }

    static getCreateSpreadSheet(folder, fileName, tabNames: string = "", result: GSResult) {
        let file = Utils.getFileFromFolder(fileName, folder);
        let tabs = tabNames.split(',');
        let spreadSheet = null;

        if (file == null) {
            result.IsNew = true;
            spreadSheet = SpreadsheetApp.create(fileName);
            if (tabs.length > 0) {
                if (tabs[0].length > 0) {
                    var sh = spreadSheet.getActiveSheet();
                    sh.setName(tabs[0]);
                }

                for (var i = 1; i < tabs.length; i++) {
                    if (tabs[i].length > 0) {
                        let itemsSheet = spreadSheet.insertSheet();
                        itemsSheet.setName(tabs[i]);
                    }
                }

            }

            var copyFile = DriveApp.getFileById(spreadSheet.getId());
            folder.addFile(copyFile);
            DriveApp.getRootFolder().removeFile(copyFile);
            file = Utils.getFileFromFolder(fileName, folder);
        }
        spreadSheet = SpreadsheetApp.openById(file.getId());
        return spreadSheet;
    }

    static getFileByName(fileName) {
        var files = DriveApp.getFilesByName(fileName);
        while (files.hasNext()) {
            var file = files.next();
            return file;
            break;
        }
        return null;
    }

    static getFileFromRoot(name: string) {
        let files: FileIterator;


        files = DriveApp.getFilesByName(name);
        if (files.hasNext()) {
            return files.next();
        }

        return null;
    }

    static getFileFromFolder(name: string, folder) {
        let files: FileIterator;


        files = folder.getFilesByName(name);
        if (files.hasNext()) {
            return files.next();
        }

        return null;
    }

    static getDateFromYMD(dtStr, sep: string = "-") {
        let dt = null;
        let fp = dtStr.split(" ");
        let p;
        try {
            if ( fp.length > 0 )
                p = fp[0].split(sep);
            else 
                p = dtStr.split(sep);
                
            if (p.length > 2) 
            {
                if ( fp.length > 1 )
                {
                    let h = fp[1].split(":");
                    if ( h.length > 1 )
                        dt = new Date(Number(p[0]), Number(p[1] - 1), Number(p[2]),
                        Number(h[0]),Number(h[1]));
                    else
                        dt = new Date(Number(p[0]), Number(p[1] - 1), Number(p[2]));
                }
                else dt = new Date(Number(p[0]), Number(p[1] - 1), Number(p[2]));
            }

            
            
        }
        catch (ex) {
            
        }
        return dt;
    }

    static getDateFromDMY(dtStr, sep: string = "-") {
        let dt = null;
        let p;
        try {
            p = dtStr.split(sep);
            if (p.length > 2) {
                dt = new Date(Number(p[2]), Number(p[1] - 1), Number(p[0]));
            }
        }
        catch (ex) {

        }
        return dt;
    }

    static getHourFromDMY(dateString)
    {
        let sHour = "";
        let p = dateString.split(" ");
        if ( p.length > 1)
            sHour = p[1].trim();
        return sHour;
    }

    static getDateYMDFromDMY(dtStr, sep: string = "-") {
        let dt = null;
        let p = [];
        let f = [];
        let hr = [];
        try {
            f = dtStr.split(" ");
            if (f.length > 0) {
                p = f[0].split(sep);
                if ( f.length > 1 )
                    hr = f[1].split(":");

                if ( p.length > 2)
                {
                    if ( hr.length > 1 )
                        dt = new Date(Number(p[2]), Number(p[1] - 1), Number(p[0]),
                        Number(hr[0]),Number(hr[1]));
                    else
                        dt = new Date(Number(p[2]), Number(p[1] - 1), Number(p[0]));
                }
            }
        }
        catch (ex) {
            SysLog.logException(ex,"getDateYMDFromDMY()",`dtStr:${dtStr} sep:${sep}`,`${f.length} ${p.length}`)
        }
        return dt;
    }


    static getDays(dt: Date, startDate: Date = new Date(1900, 1, 1)) {
        let dif = dt.getTime() - startDate.getTime();
        dif = dif / (1000 * 60 * 60 * 24);
        return dif;

    }

    static getMinutes(time: string): number {
        let minutes = 0;
        let p = time.split(":");
        try {
            let h = Number(p[0]);
            let m = Number(p[1]);

            minutes = h * 60 + m;
        }
        catch (ex) {

        }

        return minutes;
    }

    static sortFunction2(a, b) {
        if (a[this.sortCol2] == b[this.sortCol2]) {
            return 0;
        }
        else {
            if (this.sortDescending2)
                return (a[this.sortCol2] > b[this.sortCol2]) ? -1 : 1;
            else
                return (a[this.sortCol2] < b[this.sortCol2]) ? -1 : 1;
        }
    }

    static getSelect(arr, name, idCol, valueCol, 
        title = "", selectedValue = "",classes = "", multiple = "", required = "",  sortDir = "A") {
        let options = "";
        let onChange = `onchange="onchange_${name}(this.options[this.selectedIndex].value)"`;

        if (sortDir == "A" || sortDir == "D") {
            this.sortCol2 = valueCol;
            this.sortDescending2 = sortDir == "D";
            arr = arr.sort(this.sortFunction2);
            SysLog.log(0,"arr",`getSelect() name: ${name} idCol:${idCol} valueCol:${valueCol}`,JSON.stringify(arr));
        }

        if ( classes != "" )
            classes = `class="${classes}"`;

        if (title.length == 0)
            title = "Select...";

        if ( selectedValue = "")
            options = `<option value="" selected>${title}</option>`;
        else
            options = `<option value="">${title}</option>`;


        for (var i = 0; i < arr.length; i++) {
            if (selectedValue != "" && arr[i][idCol] == selectedValue)
                options = `${options}<option value="${arr[i][idCol]}" selected>${arr[i][valueCol]}</option>`
            else
                options = `${options}<option value="${arr[i][idCol]}">${arr[i][valueCol]}</option>`
        }

        let html = `<select name="SELECT_${name}" id="SELECT_${name}" ${required} ${multiple} 
            ${onChange} 
            ${classes}>
        ${options}</select>`

        //console.log(`getHtml(): startRow:${startRow}`,arr,html);
        return html;

    }



    static getSeconds(time: string, sep: string = ":"): number {
        let minutes = 0;
        let seconds = 0;
        let p = time.split(sep);
        let h = 0;
        let m = 0;
        let s = 0;
        try {
            if (p.length > 1) {
                h = Number(p[0]);
                m = Number(p[1]);
                s = 0;
                if (p.length > 2)
                    s = Number(p[2]);
            }
            else {
                h = Number(time.substring(0, 2));
                m = Number(time.substring(2, 2));
                s = Number(time.substring(4, 2));
            }
        }
        catch (ex) {
            h = 0;
            m = 0;
            s = 0;
        }
        minutes = h * 60 + m;
        seconds = minutes * 60 + s;

        return seconds;
    }

    static getSeconds2(dt:string, sep = ":"):number{
        let seconds = 0;
        let p;
        try
        {
            if (sep==""  )
            {
                seconds = Number(dt.substr(0,2)) +
                    Number (dt.substr(2,2)) + 
                    Number (dt.substr(4,2));
            }
            else
            {
                p = dt.split(sep);
                if ( p.length == 2 )
                {
                    seconds = Number(p[0])*60 + Number(p[1]);
                }
                else if ( p.length >= 3 )
                {
                    seconds = Number(p[0])*60*60 + Number(p[1])*60 + Number(p[2]);
                }
            }
        }
        catch(ex)
        {

        }
        return seconds;
    }



    static getRange(ss, sheetName: string, range: string = "") {
        //todo: enable gettign specific range
        let sheet = ss.getSheetByName(sheetName);
        return sheet.getDataRange();
    }

    static getData(ss, sheetName: string = "", sort = null ): [][] {
        let sheet;
        if (sheetName == "")
            sheet = ss.getActiveSheet();
        else
            sheet = ss.getSheetByName(sheetName);

        var rangeData = sheet.getDataRange();
        if ( sort != null )
        {
            rangeData.sort(sort);
        }
        //var lastColumn = rangeData.getLastColumn();
        //var lastRow = rangeData.getLastRow();
        let grid = rangeData.getValues();
        return grid;
    }

    static getData2(ss, sheetName: string = "", sort = null ): [[]] {
        let sheet;
        if (sheetName == "")
            sheet = ss.getActiveSheet();
        else
            sheet = ss.getSheetByName(sheetName);

        var rangeData = sheet.getDataRange();
        // if ( sort != null )
        // {
        //     let bs = rangeData.getValues();
        //     rangeData = rangeData.sort(sort);
        //     let as = rangeData.getValues();
        //     SysLog.log(0,"before sort 4,5","getData(2)",JSON.stringify(bs));
        //     SysLog.log(0,"after sort","getData(2)",JSON.stringify(as));
        // }
        //var lastColumn = rangeData.getLastColumn();
        //var lastRow = rangeData.getLastRow();
        let grid = rangeData.getValues();
        return grid;
    }

    static getUrl(fileName, folder = null) {
        let files;
        if (folder == null)
            files = DriveApp.getFilesByName(fileName);
        else
            files = folder.getFilesByName(fileName);

        if (files.hasNext()) {
            let file = files.next();
            return file.getUrl();
        }
        return "";
    }

    static getHtmlFromArray(name: string, caption: string = "", list: Array<string>, required: boolean = false): string {
        let onChange = "";
        let requiredText = "";

        if (required)
            requiredText = "required";

        name = name.trim();

        if (caption.length == 0)
            caption = "None";

        var options = `< option value = "-1" selected > ${caption} < /option>`;
        for (var i = 0; i < list.length; i++) {
            options = options + `<option value="${i}">${list[i]}</option>`;
        }
        onChange = `onChange="onChange_${name}('${name}',this.options[this.selectedIndex].value)"`;
        return `<select id="SELECTID" name="SELECTID" ${onChange} ${required}>${options}</select>`;

    }

    static replace(text: string, value: string, newValue: string): string {
        try {
            while (text.indexOf(value) >= 0)
                text = text.replace(value, newValue);
        }
        catch (ex) {
            console.log("eplace()", "error", ex);
        }
        return text;
    }

    static extract(text: string, start: string, end: string): string {
        let word = "";
        try {
            let index = text.indexOf(start);
            let index2 = 0;
            while (index >= 0) {
                index += start.length;
                index2 = text.indexOf(end, index);
                if (index2 > index) {
                    word = text.substr(index, index2 - index);
                }
                index = text.indexOf(start, index2 + end.length);
            }
        }
        catch (ex) {
        }
        return word;
    }


    static moveFiles(sourceFileId, targetFolderId) {
        try {
            let file = DriveApp.getFileById(sourceFileId);
            let folder = DriveApp.getFolderById(targetFolderId);
            file.moveTo(folder);
        }
        catch (ex) {
            Logger.log("Exception moving file.");
        }
    }

    static sendMail(to, subject, body) {
        let result = 0;
        let mails = to.split('\n');
        let mailsList = "";

        if (mails.length == 0)
            mailsList = to;
        else
            for (var i = 0; i < mails.length; i++) {
                mails[i] = mails[i].trim();
                if (mails[i].length > 0) {
                    if (mailsList.length == 0)
                        mailsList = mails[i];
                    else
                        mailsList = `${mailsList},${mails[i]}`;
                }
            }
        Logger.log("SendMail to " + mailsList);

        try {
            body = Utils.replace(body, "\\n", "</br>");
            MailApp.sendEmail({
                to: mailsList,
                subject: subject,
                htmlBody: body
            });
            result = 0;
        }
        catch (ex) {
            Utils.ex = ex;
            Logger.log(`Exception sending mail to [${mailsList}]\n${ex.message}\n${ex.stacktrace}`);
            result = -1;
        }
        return result;

    }

    static deleteFiles(fileName: string, folder = null) {
        let files;
        if (folder == null)
            files = DriveApp.getFilesByName(fileName);
        else
            files = folder.getFilesByName(fileName);

        while (files.hasNext()) {
            let file = files.next();
            file.setTrashed(true);
        }
    }

    static async removeFileByName(fileName) {
        var files = DriveApp.getFilesByName(fileName);
        if (files.hasNext()) {
            var file = files.next();
            file.setTrashed(true);
        }
    }

    static getTextFile(fileName: string, folder = null) {
        let file;
        if (folder == null) {
            let files = DriveApp.getFilesByName(fileName);
            if (files.hasNext())
                file = files.next()
        }
        else {
            file = Utils.getFileFromFolder(folder, fileName)

            if (file != null)
                return file.getBlob().getDataAsString();
            return "";
        }
    }

    static getTextFileFromFolder(folder, fileName: string) {
        let file = Utils.getFileFromFolder(folder, fileName)
        if (file != null)
            return file.getBlob().getDataAsString();
        return "";
    }

    static writeTextFile(fileName: string, text: string, folder = null) {
        var existing;
        if (folder == null)
            existing = DriveApp.getFilesByName(fileName);
        else
            existing = folder.getFilesByName(fileName);

        // Does file exist? if (existing.hasNext()) {

        var file = null;
        if (existing.hasNext()) {
            file = existing.next();
            file.setTrashed(true);
        }
        folder.createFile(fileName, text, MimeType.PLAIN_TEXT);
    }


}
