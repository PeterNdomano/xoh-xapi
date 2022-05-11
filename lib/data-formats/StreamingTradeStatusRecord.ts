export default interface STREAMING_TRADE_STATUS_RECORD {
  customComment?:	string;	//The value the customer may provide in order to retrieve it later.
  message?:	string;	//Can be null
  order?:	number;	//Unique order number
  price?: number;	//Price in base currency
  requestStatus?:	number;	//Request status code, described below
}
