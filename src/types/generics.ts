// A GENERIC TO GENERATE AN OBJECT FROM KEYS
export type ObjectGenerator<KeyType extends string | number, ValueType extends object> = {
    [key in KeyType]: ValueType
}