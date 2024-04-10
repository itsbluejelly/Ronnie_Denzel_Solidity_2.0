// A GENERIC TO CREATE AN OBJECT FROM AN UNION TYPE
export type ObjectGenerator<UnionType extends string | number, CommonType> = {
    [key in UnionType]: CommonType
}