export class Document {
    constructor(
        public id: string,
        public type: 'image' | 'file' | 'other',
        public path: string,
        public priority: number,
        public created_at: string,
    ) { }

    static fromJson(json: any): Document {
        return new Document(
            json.id,
            json.type,
            json.path,
            json.priority,
            json.created_at
        );
    }
}
