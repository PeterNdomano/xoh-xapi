export default interface SYMBOL_RECORD{
  ask?: number; //Ask Price in base currency
  bid?: number; //Bid Price in base currency
  categoryName?: string; //Category Name
  contractSize?: number; //size of 1 lot
  currency?: string; //Currency
  currencyPair?: boolean; //Currency
  currencyProfit?: string;
  description?: string;
  expiration?: number;
  groupName?: string;
  high?: number;
  initialMargin?: number;
  instantMaxVolume?: number;
  leverage?: number;
  longOnly?: boolean;
  lotMax?: number;
  lotMin?: number;
  lotStep?: number;
  low?: number;
  marginHedged?: number;
  marginHedgedStrong?: boolean;
  marginMaintenance?: number;
  marginMode?: number;
  percentage?: number;
  pipsPrecision?: number;
  precision?: number;
  profitMode?: number;
  quoteId?: number;
  shortSelling?: boolean;
  spreadRaw?: number;
  spreadTable?: number;
  starting?: number;
  stepRuleId?: number;
  stopsLevel?: number;
  swap_rollover3days?: number;
  swapEnable?: boolean;
  swapLong?: number;
  swapShort?: number;
  swapType?: number;
  symbol?: string;
  tickSize?: number;
  tickValue?: number;
  time?: number;
  timeString?: string;
  trailingEnabled?: boolean;
  type?: number;
}
