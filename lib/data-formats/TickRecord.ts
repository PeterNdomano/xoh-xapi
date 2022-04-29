export default interface TICK_RECORD {
  ask?: number;
  askVolume?: number;
  bid?: number;
  bidVolume?: number;
  high?: number;
  level?: number;
  low?: number;
  spreadRaw?: number;
  spreadTable?: number;
  symbol?: string;
  timestamp?: number;
}
