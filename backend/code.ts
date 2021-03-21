import { GSResponse } from "../Models/GSResponse";
import { RecordItem } from "../models/RecordItem";
import { BaseService } from "./base-service";
import { G } from "./G";
import { Service } from "./service";
import { SysLog } from "./SysLog";
import { Utils } from "./Utils";

function testCreateBaseFolder(){

    let result = CreateBaseFolder("GAPBase");
    Logger.log(result);
}

function testGetHtmlSelect(){
    let sv = new Service();
    let result = sv.getHtmlSelect("Items","RT");
}
function testReport()
{
    let data= `{"arr":[{"key":"FECHA_DESDE","value":"2020-11-01"},{"key":"FECHA_HASTA","value":"2021-02-28"},{"key":"HORA_DESDE","value":"00:00"},{"value":"11:59","key":"HORA_HASTA"}]}`;
    let Data = JSON.parse(data);
    let sv = new Service();
    let response = sv.report(Data);
}

function testGetItems()
{
    let sv = new Service();
    let result = sv.getItems();
}


function testImportBatchGLUC()
{
    let url = "https://docs.google.com/spreadsheets/d/1OCGqqg9grfL462qSsk1hULrX6zDcrFVHSqiojLpW6zQ/edit#gid=0";
    try
    {
    let sv = new Service();
    let result = sv.importBatchGluc(url);
    SysLog.log(9999,"fpi","testImportBatchGLUC()",JSON.stringify(result));
    }
    catch(ex)
    {
        SysLog.logException(ex,"test");
    }

}




function testImportLegacy()
{
    try
    {
    let sv = new Service();
    let result = sv.importBatchLegacy("https://docs.google.com/spreadsheets/d/1p6R1hKee7tp8OWwkSIvlgmHP2yz2jVMymBbmRKCZd3M/edit#gid=0");
    }
    catch(ex)
    {
        SysLog.logException(ex,"test");
    }
}

function testGetId()
{
    let sv = new Service();
    let result = sv.getId("Id");
}


function CreateBaseFolder(baseFolder){
    let sv = new BaseService();
    let response = new GSResponse();
    try{
        response = sv.CreateBaseFolder(baseFolder);
    }
    catch(ex)
    {
        handleException(ex, CreateBaseFolder.name, baseFolder);
    }
    return JSON.stringify(response);
}

function log(msg, data)
{
    SysLog.log(0,msg,"code.ts log()",data);
}

function edit(year)
{
    
    let sv = new Service();
    let response = new GSResponse();
    try{
        response = sv.edit(year);
    }
    catch(ex)
    {
        handleException(ex,"edit()", year.toString());
    }
    return JSON.stringify(response);
}

function GetApp(baseFolder="", appFolder = "" ){
    let sv = new BaseService();
    let response = new GSResponse();
    try{
        response = sv.GetApp(baseFolder,appFolder);
    }
    catch(ex)
    {
        handleException(ex, response, GetApp.name );
    }
    return JSON.stringify(response);
}

function ProcessForm(formId:string, controlId: string, form)
{
    let sv = new BaseService();
    let response = new GSResponse();
    try{
        response = sv.ProcessForm(formId, controlId, form)
    }
    catch(ex)
    {
        handleException(ex, response, ProcessForm.name );
    }
    return JSON.stringify(response);

}

function getDataDeclarations(names):string
{
    let sv = new Service();
    return sv.getDataDeclarations(names);
}

/* @Include JavaScript and CSS Files */
function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent(); 303
}

function doGet(e) {
    return  HtmlService.createTemplateFromFile('frontend/index3').evaluate();
}

function getSportTypes()
{
    let sv = new Service();
    let html = sv.getHtmlSelectFiltered("Items","SP","Select Sport","",true);
    return html;

}

function getEvents()
{
    let sv = new Service();
    let html = sv.getHtmlSelectFiltered("Items","EV","Select Event","",true);
    return html;

}

function getDrugItems()
{
    let sv = new Service();
    let response = new GSResponse();
    let json = "";
    try
    {
        json = sv.getDrugItems();
        SysLog.log(0,"DrugItems","code.ts getDrugItems()",json);
        response.addData("DrugItems",json)
    }
    catch(ex)
    {
        handleException(ex,response,"code.ts getFoodItems()")
    }
    return json;    //JSON.stringify(response);
}



function getExeItems()
{
    let sv = new Service();
    let response = new GSResponse();
    let json = "";
    try
    {
        json = sv.getExeItems();
        response.addData("ExeItems",json)
    }
    catch(ex)
    {
        handleException(ex,response,"code.ts getExeItems()")
    }
    return json;    //JSON.stringify(response);
}



function getHtmlSelect(tabName,filter)
    {
        let sv = new Service();
        return sv.getHtmlSelect(tabName,filter);
    }

function getRecTypes()
{
    let sv = new Service();
    return sv.getRecTypes();
}

function getFoodItems()
{
    let sv = new Service();
    let response = new GSResponse();
    let json = "";
    try
    {
        json = sv.getFoodItems();
        SysLog.log(0,"FoodItems","code.ts getFoodItems()",json);
        response.addData("FoodItems",json)
    }
    catch(ex)
    {
        handleException(ex,response,"code.ts getFoodItems()")
    }
    return json;    //JSON.stringify(response);
}




function getPageArr(){
    return "";
}

function report(Data)
{
    SysLog.log(0,"report","code.ts report()", "Data" ,JSON.stringify(Data));
    let sv = new Service();
    let response = new GSResponse();
    try{
        response =sv.report(Data);
    }
    catch(ex)
    {
        handleException(ex,"edit()");
    }
    return JSON.stringify(response);

}




function processForm(Data, records, colSep = "\t", lineSep = "\n") {

    let sv = new Service();
    let html = "";
    let result = new GSResponse();
    try {
        result = sv.processForm(Data, records,colSep,lineSep);
        if ( result.id >= 0 )
        {
            result.domainResult = 0;
            result.messages.push(`Record was added with id: ${result.id}`);
        }
        else
        {
            result.domainResult = -1;
            result.id = -1;
        }
    }
    catch (ex) {
        SysLog.logException(ex,"processForm()");
        result.addError("error", ex.message);
        result.messages.push(ex.message);
        result.messages.push(ex.stack);
        result.showModal = false;
    }
    SysLog.log(9999,"esponse","processFOrm()",JSON.stringify(result));
    return JSON.stringify(result);
}


function getSelectArr(){
    return "";
}



function getItems()
{
    let sv = new Service();
    return sv.getItems();
}

function handleException(ex, response, method ="", additional = "" )
{
    try
    {
    response.result = 500;
    response.addError("Exception",ex.message);
    response.addError("StackTrace",ex.stackTrace);
    response.addError("method", method);
    response.addError("additional",additional);
    }
    catch(ex)
    {
        Logger.log("handleException exception",ex);
    }

    SysLog.logException(ex,method,additional)
}

function getLocalData(){
    var response = new GSResponse();

    try
    {
        let sv = new Service();
        response =  sv.getLocalData();
    }
    catch(ex)
    {
       handleException(ex,response,"code.ts getLocalData()")
    }
    return JSON.stringify(response);
    
}

function getForm(formId, divId:string):string{
    var response = new GSResponse();

    response.formId = formId;
    
    try
    {
        let sv = new Service();
        response =  sv.getForm(formId,divId);
    }
    catch(ex)
    {
       handleException(ex,response,"code.ts getForm()")
    }
    return JSON.stringify(response);
}




