// IMPORTING NECESSARY GENERICS
import { OptionalGenerator } from "./generics"

// A TYPE FOR THE SHOW_ACCOUNTS TASK PARAMETER
export type ShowAccountsParam = OptionalGenerator<{
    number: number,
    order: "asc" | "desc" | "ascending" | "descending"
}>

// A TYPE FOR THE ACCOUNTS
export type AccountType = {
    account: string,
    balance: bigint | `${string} ETH`
}