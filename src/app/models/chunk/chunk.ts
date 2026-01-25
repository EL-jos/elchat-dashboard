import { Document } from "../document/document";
import { Page } from "../page/page";

export class Chunk {
    public page: Page | null = null;
    public document: Document | null = null;
    constructor(
        public id: string,
        public text: string,
        public source_type: string,
        public priority: number,
        public metadata: any,
        public created_at: string,
    ) { }

    static fromJson(json: any): Chunk {
        const chunk = new Chunk(
            json.id,
            json.text,
            json.source_type,
            json.priority,
            json.metadata,
            json.created_at
        );

        if (json.page) {
            chunk.page = Page.fromJson(json.page);
        }

        if (json.document) {
            chunk.document = Document.fromJson(json.document);
        }

        return chunk;
    }
}
