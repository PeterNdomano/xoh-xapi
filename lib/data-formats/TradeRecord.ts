export default interface TRADE_RECORD {
  close_price?: number;
  close_time?: number;
  close_timeString?: string;
  closed?: boolean;
  cmd?: number;
  comment?: string;
  commission?: number;
  customComment?: string;
  digits?: number;
  expiration?: number;
  expirationString?: string;
  margin_rate?: number;
  offset?: number;
  open_price?: number;
  open_time?: number;
  open_timeString?: string;
  order?: number;
  order2?: number;
  position?: number;
  profit?: number;
  sl?: number;
  storage?: number;
  symbol?: string;
  timestamp?: number;
  tp?: number;
  volume?: number;
}
