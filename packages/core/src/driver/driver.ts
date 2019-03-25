import { JsonMap } from "@salesforce/ts-types";
import { SteedosQueryOptions } from "../types/query";
import { SteedosIDType } from "../types";


export interface SteedosDriver {
    
    //constructor(url:string): any;
    find(tableName: string, query: SteedosQueryOptions): any;
    findOne(tableName: string, id: SteedosIDType, query: SteedosQueryOptions): any;
    insert(tableName: string, doc: JsonMap): any;
    update(tableName: string, id: SteedosIDType, doc: JsonMap): any;
    delete(tableName: string, id: SteedosIDType): any;

}

