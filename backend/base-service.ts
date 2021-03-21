import { DomainResponse } from "./models/DomainResponse";
import { FileInfo } from "./Models/FileInfo";
import { FileProcessItem } from "./models/FileProcessItem";
import { GlucLevel } from "./models/GlucLevel";
import { GSResponse } from "./Models/GSResponse";
import { KVPCollection } from "./models/KVPCollection";
import { NamedArray } from "./models/NamedAray";
import { RecordItem } from "./models/RecordItem";
import { RecordItemBase } from "./models/RecordItemBase";
import { RecTypeInfo } from "./models/RecTypeInfo";
import { G } from "./G";
import { SysLog } from "./SysLog";
import { Utils } from "./utils";
import { LocalData } from './models/LocalData'
import { GSResult } from "./models/GSResult";

let sortCol = 0;
let sortDescending = false;

let sortCol2 = 0;
let sortDescending2 = false;
let db;
let AppFolder;
let BaseFolder;
let AppFolderId = "";
let BaseFolderId = "";
let dbId = "";
let result = 0;
let message = "";
let ex;
let cache;
let userCache;
let App = null;
let resultObj;


export class BaseService {


    constructor() {
        resultObj = new GSResult();
        cache = CacheService.getScriptCache();
        userCache = CacheService.getUserCache();
        BaseFolderId = cache.get("BaseFolderId");
        dbId = cache.get("dbId");
        App = cache.get("App");
        if (BaseFolderId == undefined)
            BaseFolderId = "";
        else {
            BaseFolder = DriveApp.getFolderById(BaseFolderId);
            if (BaseFolder != null && BaseFolder != undefined) {
                db = Utils.getSpreadSheet(BaseFolder, "database");
                if (db != null && db != undefined) {
                    dbId = db.getId();
                    cache.put("dbId", dbId);
                }
                else db = null;
            }
            else BaseFolder = null;
        }
        SysLog.log(0, "BaseService", "Constructor()", `BaseFolder:${BaseFolder} App: ${JSON.stringify(App)}`);
    }

    getForm(formId: string, divId: string): GSResponse {
        let html = "";
        let response = new GSResponse();
        response.formName = formId;
        response.controlId = divId;

        html = HtmlService.createTemplateFromFile(`frontend/html/${formId}`).evaluate().getContent();
        if (html.length > 0) {
            response.addHtml(divId, html);
        }
        else {
            result = -1;
            message = `form ${formId} not found`;
        }

        return response;
    }


    GetApp(baseFolder: string = "", appFolder: string = ""): GSResponse {
        if (App == null || baseFolder == "") {
            let result = this.getForm("configuration", "Settings");
            result.formId = `form${result.controlId}`;
            result.NeedsConfirmation = true;
            return result;
        }
        else {
            appFolder = Utils.getFolder(appFolder);
            if (appFolder != null) {
                db = Utils.getCreateSpreadSheet(appFolder, "database", "Items", "Group,Parent,Child,Descr,Parameters")

            }
            else {
                throw `appFolder ${appFolder} not found`
            }
        }
    }

    getId(tabName): number {
        let id = 0;
        let sheet = db.getSheetByName(tabName);
        let rangeData = sheet.getRange(1, 1, 1, 1);
        let cell = rangeData.getCell(1, 1).getValue();
        if (cell == null)
            cell = 0;

        id = cell + 1;  //Number(cell);
        rangeData.getCell(1, 1).setValue(id);
        return id;
    }

    addRow(id, db, sheetName: string, row): Number {
        let sheet = db.getSheetByName(sheetName);
        sheet.appendRow(row);
        id++;
        return id;
    }

    getRowById(ss, sheetName: string, id: number, idCol: number = 0): [] {
        let grid = Utils.getData(ss, sheetName);
        let row = grid.filter(x => x[idCol] == id);
        if (row.length > 0)
            return row[0];
        else
            return null;
    }

    getObjectById(ss, sheetName: string, id: number, idCol: number = 0): {} {
        let grid = Utils.getData(ss, sheetName);
        let row = grid.filter(x => x[idCol] == id);
        if (row.length > 0) {
            let ob = {};
            for (var i = 0; i < grid[0].length; i++) {
                ob[`${grid[0][i]}`] = row[i];
            }
            return ob;
        }
        else
            return null;
    }

    getObjectByColName(ss, sheetName: string, colName: string, colValue: string): {} {
        let grid = Utils.getData(ss, sheetName);
        let found = false;
        colName = colName.trim().toLowerCase();
        if (grid.length > 0) {
            let idCol = 0;
            for (var i = 0; i < grid[0].length; i++) {
                if (grid[0][i].trim().toLowerCase() == colName) {
                    idCol = i;
                    found = true;
                    break;
                }
            }
            if (found) {
                let row = grid.filter(x => x[idCol] == colValue);
                if (row.length > 0) {
                    let ob = {};
                    for (var i = 0; i < grid[0].length; i++) {
                        ob[`${grid[0][i]}`] = row[i];
                    }
                    return ob;
                }
            }
        }
        return null;
    }

    getValueByColName(ss, sheetName: string, colName: string, colValue: string, colResult: string) {
        let grid = Utils.getData(ss, sheetName);
        let found = false;
        colName = colName.trim().toLowerCase();
        colResult = colResult.trim().toLowerCase();
        if (grid.length > 0) {
            let idCol = 0;
            let idResult = 0;
            for (var i = 0; i < grid[0].length; i++) {
                if (grid[0][i].trim().toLowerCase() == colName) {
                    idCol = i;
                    found = true;
                    break;
                }
            }
            if (found) {
                found = false;
                for (var i = 0; i < grid[0].length; i++) {
                    if (grid[0][i].trim().toLowerCase() == colResult) {
                        idResult = i;
                        found = true;
                        break;
                    }
                }
                if (found) {
                    let row = grid.filter(x => x[idCol] == colValue);
                    if (row.length > 0) {
                        return row[0][idResult];
                    }
                }
            }
        }
        return "";
    }



    initDB(db, BaseFolder) {
        dbId = db.getId();


        let id = this.addRow(0, db, "Items", ["Id", "GroupId", "ItemId", "Value"])


        id = this.addRow(id, db, "Roles", "Id,RoleName,Read,Write,BulkWrite,Delete,BulkDelete,Drop".split(","));
        id = this.addRow(id, db, "Roles", `${id},anonymous,1,0,0,0,0,0`.split(","));
        id = this.addRow(id, db, "Roles", `${id},admin,1,1,1,1,1,1`.split(","));
        let roleId = id;

        id = this.addRow(id, db, "Users", "Id,RoleId,Email,Name,Phone".split(","));
        id = this.addRow(id, db, "Users", `${id},${roleId},${Session.getActiveUser().getEmail()},"",""`.split(","));

        let form = HtmlService.createTemplateFromFile("frontend/formio/NewApp_formio").evaluate().getContent();
        form = form.replace("<script>", "");
        form = form.replace("</script>", "");
        form = Utils.replace(form, "\t", "");
        form = Utils.replace(form, "\n", "");
        //Utils.writeTextFile("form_NewAppJ.json",form,BaseFolder);

        id = this.addRow(id, db, "Forms", "Id,Name,Type,Data".split(","));
        id = this.addRow(id, db, "Forms", [id, "NewAppJ", "J", form]);

        id = this.addRow(id, db, "Applications", "Id,Code,FolderId,Description,Author".split(","));

        id = this.addRow(id, db, "DataSources", "Id,Name,dbId,Description".split(","));
        id = this.addRow(id, db, "DataSources", [id, "GAPDatabase", db.getId(), "GAP Database"]);

        id = this.addRow(id, db, "Parameters", [id, "IdProvider", id])

        return db;

    }

    getConfiguration(response: GSResponse, form): GSResponse {
        BaseFolder = Utils.getFolder(form.BASE_FOLDER);
        if (BaseFolder == null) {
            BaseFolder = DriveApp.getFolderById(form.BASE_FOLDER);
            if (BaseFolder == null || BaseFolder == undefined) {
                BaseFolder = Utils.getCreateFolder(form.BASE_FOLDER);
            }
        }
        BaseFolderId = BaseFolder.getId();
        cache.put("BaseFolderId", BaseFolderId);
        this.initDB(db, BaseFolder);
        dbId = db.GETiD();
        cache.put("dbId", dbId);

        return response;
    }

    CreateBaseFolder(baseFolder: string): GSResponse {
        let response = new GSResponse();
        BaseFolder = Utils.getFolder(baseFolder);
        BaseFolderId = BaseFolder.getId();
        cache.put("BaseFolderId", BaseFolderId);
        if (db == null) {
            db = Utils.getCreateSpreadSheet(BaseFolder, "GAPdatabase", "Items,Parameters,Users,Roles,DataSources,Applications,Forms", resultObj);
            cache.put("dbId", db.getId());
            if (resultObj.IsNew)
                db = this.initDB(db, BaseFolder);
        }
        dbId = db.getId();
        cache.put("dbId", dbId);


        let json = this.getValueByColName(db, "Forms", "Name", "NewAppJ", "Data");
        try {
            let formio = JSON.parse(json);
            response.addObject("formio", formio);
        }
        catch (ex) {
            Logger.log("json", ex, json);
        }
        return response;
    }

    ProcessForm(formId: string, controlId: string, form): GSResponse {
        SysLog.log(0, "", "ProcessForm()", `formId:${formId} controlId:${controlId} form:${JSON.stringify(form)}`);
        let response = new GSResponse();
        response.formId = formId;
        switch (formId) {
            case "configuration":
                {
                    response = this.getConfiguration(response, form);
                    break;
                }
            default:
                break;
        }
        return response;
    }
}