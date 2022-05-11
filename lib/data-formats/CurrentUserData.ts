export default interface CURRENT_USER_DATA {
  companyUnit?:	number;	//Unit the account is assigned to.
  currency?:	string;	//account currency
  group?:	string;	//group
  ibAccount?:	boolean;	//Indicates whether this account is an IB account.
  leverage?:	number;	//This field should not be used. It is inactive and its value is always 1.
  leverageMultiplier?: number;	//The factor used for margin calculations. The actual value of leverage can be calculated by dividing this value by 100.
  spreadType?:	string;	//spreadType, null if not applicable
  trailingStop?:	boolean;	//Indicates whether this account is enabled to use trailing stop
}
