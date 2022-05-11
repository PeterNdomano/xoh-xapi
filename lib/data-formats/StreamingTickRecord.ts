export default interface STREAMING_TICK_RECORD {
  ask?: number	//Ask price in base currency
  askVolume?:	number;	//Number of available lots to buy at given price or null if not applicable
  bid?: number;	//Bid price in base currency
  bidVolume?:	number;	//Number of available lots to buy at given price or null if not applicable
  high?: number;	//The highest price of the day in base currency
  level?:	number;	//Price level
  low?:	number;	//The lowest price of the day in base currency
  quoteId?:	number;	//Source of price, detailed description below
  spreadRaw?:	number;	//The difference between raw ask and bid prices
  spreadTable?: number;	//Spread representation
  symbol?:	string;	//Symbol
  timestamp?: number;	//Timestamp
}
