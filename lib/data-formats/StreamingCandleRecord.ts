export default interface STREAMING_CANDLE_RECORD {
  close?: number;	//Close price in base currency
  ctm?: number;	//Candle start time in CET time zone (Central European Time)
  ctmString?:	number;	//String representation of the ctm field
  high?: number;	//Highest value in the given period in base currency
  low?:	number;	//Lowest value in the given period in base currency
  open?: number;	//Open price in base currency
  quoteId?:	number;	//Source of price
  symbol?: string	//Symbol
  vol?: number	//Volume in lots
}
