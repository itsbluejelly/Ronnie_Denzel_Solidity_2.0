// A TYPE FOR THE SHOWACCOUNTBALANCE TASK
export type ShowAccountBalanceParams = {
    account: string,
    denomination: "wei" | "gwei" | "ether"
}