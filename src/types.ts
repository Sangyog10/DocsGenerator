
export interface DocumentationOptions {
    includeExamples: boolean;
    filePath: string;
}

export interface DocumentationData {
    overview: string;
    functions: FunctionDoc[];
    classes: ClassDoc[];
    interfaces: InterfaceDoc[];
    constants: ConstantDoc[];
    types: TypeDoc[];
    fileName: string;
}

export interface FunctionDoc {
    name: string;
    description: string;
    parameters: ParameterDoc[];
    returnType: string;
    returnDescription: string;
    examples: string[];
    complexity: string;
}

export interface ClassDoc {
    name: string;
    description: string;
    constructor: ConstructorDoc;
    methods: FunctionDoc[];
    properties: PropertyDoc[];
    inheritance: string[];
}

export interface InterfaceDoc {
    name: string;
    description: string;
    properties: PropertyDoc[];
    methods: FunctionDoc[];
}

export interface ParameterDoc {
    name: string;
    type: string;
    description: string;
    optional: boolean;
    defaultValue?: string;
}

export interface PropertyDoc {
    name: string;
    type: string;
    description: string;
    access: 'public' | 'private' | 'protected';
    readonly: boolean;
}

export interface ConstructorDoc {
    parameters: ParameterDoc[];
    description: string;
    examples: string[];
}

export interface ConstantDoc {
    name: string;
    type: string;
    value: string;
    description: string;
}

export interface TypeDoc {
    name: string;
    definition: string;
    description: string;
    examples: string[];
}