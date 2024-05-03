// A GENERIC TO MAKE ALL KEYS IN AN OBJECT OPTIONAL
export type OptionalGenerator<ObjectType extends object> = { [key in keyof ObjectType]?: ObjectType[key] }