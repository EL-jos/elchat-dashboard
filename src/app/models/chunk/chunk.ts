export class Chunk {
    constructor(
        public id: string,
        public text: string,
        public source_type: string,
        public priority: number,
        public metadata: any,
        public created_at: string,
    ) { }

    static fromJson(json: any): Chunk {
        return new Chunk(
            json.id,
            json.text,
            json.source_type,
            json.priority,
            json.metadata,
            json.created_at
        );
    }
}
