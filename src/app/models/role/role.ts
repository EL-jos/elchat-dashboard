export class Role {
    constructor(
        public id: string,
        public name: 'admin' | 'visitor'
    ) { }

    static fromJson(json: any): Role {
        return new Role(json.id, json.name);
    }
}
