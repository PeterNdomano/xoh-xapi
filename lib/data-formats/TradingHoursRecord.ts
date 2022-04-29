import QUOTES_RECORD from './QuotesRecord';
import TRADING_RECORD from './TradingRecord';

export default interface TRADING_HOURS_RECORD {
  quotes?: Array<QUOTES_RECORD>;
  symbol?: string;
  trading?: Array<TRADING_RECORD>;
}
