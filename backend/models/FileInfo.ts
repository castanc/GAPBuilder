export class FileInfo{
    name:string;
    id: string;
    url: string;
    description:string;
    dateCreated: Date;
    dateModified: Date;
    parentDirs = new Array<string>();
    
    size: number;

    constructor()
    {
    }

    getFirstDir()
    {
        if ( this.parentDirs.length > 0 )
            return this.parentDirs[0];
        else return "";
    }

    setFileInfo(file)
    {
        this.dateModified = file.getLastUpdated();
        this.size = file.getSize();
        this.name = file.getName();
        this.id = file.getId();
        this.url = file.getUrl();

        var folders = file.getParents();
        while ( folders.hasNext())
        {
            var folder = folders.next();
            this.parentDirs.push(folder.getName());
        }

    }
}
