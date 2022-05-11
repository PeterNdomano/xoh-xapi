export default interface STREAMING_TRADE_RECORD {
  close_price?:	 number;	//Close price in base currency
  close_time?: number; //null if order is not closed
  closed?:	boolean;	//Closed
  cmd?:	number;	//Operation code
  comment?:	string;	//Comment
  commission?: number;	//Commission in account currency, null if not applicable
  customComment?:	string;	//The value the customer may provide in order to retrieve it later.
  digits?:	number;	//Number of decimal places
  expiration?: number;	//Null if order is not closed
  margin_rate?: number;	//Margin rate
  offset?:	number;	//Trailing offset
  open_price?: number;	//Open price in base currency
  open_time?:	number;	//Open time
  order?:	number;	//Order number for opened transaction
  order2?:	number;	//Transaction id
  position?:	number;	//Position number (if type is 0 and 2) or transaction parameter (if type is 1)
  profit?: number;	//null unless the trade is closed (type=2) or opened (type=0)
  sl?:	number;	//Zero if stop loss is not set (in base currency)
  state?:	string;	//Trade state, should be used for detecting pending order's cancellation
  storage?:	number;	//Storage
  symbol?: string;	//Symbol
  tp?: number;	//Zero if take profit is not set (in base currency)
  type?: number;	//type
  volume?: number	//Volume in lots
}
