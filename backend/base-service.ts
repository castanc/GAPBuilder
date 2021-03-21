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


export class BaseService {


    constructor() {
        cache = CacheService.getScriptCache();
        userCache = CacheService.getUserCache();
        BaseFolderId = cache.get("BaseFolderId");
        dbId = cache.get("dbId");
        App = cache.get("App");
        if (BaseFolderId == undefined)
            BaseFolderId = "";
        else {
            BaseFolder = DriveApp.getFolderById(BaseFolderId);
            db = Utils.getSpreadSheet(BaseFolder, "database");
            dbId = db.getId();
            cache.put("dbId",dbId);
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
        let sheet = this.db.getSheetByName(tabName);
        let rangeData = sheet.getRange(1, 1, 1, 1);
        let cell = rangeData.getCell(1, 1).getValue();
        if (cell == null)
            cell = 0;

        id = cell + 1;  //Number(cell);
        rangeData.getCell(1, 1).setValue(id);
        return id;
    }

    initDB()
    {
        db = Utils.getCreateSpreadSheet(BaseFolder, "database", "Items,Parameters,Users,Roles,Applications");
        dbId = db.getId();
        let row = ["GroupId","MasterId","Id","Value"];
        let sheet = db.getSheetByName("Parameters");
        row = `"Id",2`.split(",");
        sheet.appendRow(row);

        sheet = db.getSheetByName("Roles");
        row = "Id,RoleName,View,Read,Write,BulkWrite,Delete,BulkDelete,Drop".split(",");
        sheet.appendRow(row);
        row = "0,admin,1,1,1,1,1".split(",");
        sheet.appendRow(row);

        sheet = db.getSheetByName("Users");
        row = "Id,Email,Name,Phone".split(",");
        sheet.appendRow(row);

        row = `1,${Session.getActiveUser().getEmail()},"",""`.split(",");
        sheet.appendRow(row);

        cache.put("dbId", dbId);

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
        this.initDB();
        response = this.getForm("NewApp", "sectionNew");
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