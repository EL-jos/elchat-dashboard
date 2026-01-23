import { Chunk } from '../chunk/chunk';

export class Page {
    public chunks: Chunk[] = [];

    constructor(
        public id: string,
        public site_id: string,
        public url: string,
        public title: string,
        public content: string,
        public is_indexed: boolean,
        public created_at: string,
    ) { }

    static fromJson(json: any): Page {
        return new Page(
            json.id,
            json.site_id,
            json.url,
            json.title,
            json.content,
            json.is_indexed,
            json.created_at
        );
    }
}
