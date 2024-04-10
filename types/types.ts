// IMPORTING NECESSARY GENERICS
import { ObjectGenerator } from "./generics";

// EXPORTING THE PERSON TYPE
export type PersonType = ObjectGenerator<"name"| "favouriteNumber", string>