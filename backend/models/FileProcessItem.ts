import { FileInfo } from "./FileInfo";

export class FileProcessItem {
    fi: FileInfo;
    totalRows = 0;
    okRows =0;
    failRows = 0;
    failRow = 0;
    error = "";
    duplicates = 0;
    id;

    setFileInfo(fi)
    {
        this.fi = fi;
    }
}