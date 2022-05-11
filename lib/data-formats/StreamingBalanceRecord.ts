export default interface STREAMING_BALANCE_RECORD {
  balance?:	number;	//balance in account currency
  credit?: number;	//credit in account currency
  equity?: number;	//sum of balance and all profits in account currency
  margin?: number;	//margin requirements
  marginFree?: number;	//free margin
  marginLevel?:  number;	//margin level percentage
}
