export class Product {
    constructor(
        public document_id: string|null = null,
        public product_index: number|null = null,
        public identifier: string|null = null,
        public global_text: string|null = null,
        public fields: Record<string, any> | null = null,
    ) { }

    static fromJson(json: any): Product {

        return new Product(
            json.document_id,
            json.product_index,
            json.identifier,
            json.global_text,
            json.fields ?? {}
        );
        
    }

    // Retourne la valeur d'un champ ou vide si null
    getField(key: string): any {
        return this.fields?.[key] ?? null;
    }
}