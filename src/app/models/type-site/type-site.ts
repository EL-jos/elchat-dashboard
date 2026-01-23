export class TypeSite {
    constructor(
        public id: string,
        public name: string,
        public description: string,
    ) { }

    static fromJson(json: any): TypeSite {
        return new TypeSite(
            json.id,
            json.name,
            json.description
        );
    }
}
