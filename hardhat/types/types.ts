// A TYPE FOR THE SHOWACCOUNTBALANCE TASK
export type ShowAccountBalanceParams = {
    account: string,
    denomination: "wei" | "gwei" | "ether"
}

// A TYPE FOR THE ACCOUNT
export type AccountType = {
    account: string,
    balance: bigint
}

// A TYPE FOR THE EVENT
export type EventType = {
  address: string;
  blockHash: string;
  blockNumber: bigint;
  data: string;
  logIndex: bigint;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: bigint;
  returnValues: unknown;
  event: string;
  signature: string;
  raw: { data: string; topics: string[] };
};