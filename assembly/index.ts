import { getTickFromPrice, getTickSpacing, renderULMResult } from "@steerprotocol/concentrated-liquidity-strategy/assembly";
import { parseCandles, Position, console, trailingStop } from  "@steerprotocol/strategy-utils/assembly";
import { JSON } from "json-as/assembly";

let percent: f64 = 0;
let poolFee: i32 = 0;

@serializable
class Config {
  poolFee: f64 = 0;
  percent: i32 = 0;
}

export function initialize(config: string): void {
  // Parse the config object
  const configJson: Config = JSON.parse<Config>(config);

  // Handle null case
  if (
    configJson.percent == 0 ||
    configJson.poolFee == 0 
  ) {
    throw new Error("Invalid configuration");
  }

  // Assign values to memory
  percent = f64(configJson.percent);
  poolFee = i32(configJson.poolFee);
}

function closestDivisibleNumber(num: number, divisor: number, floor: boolean): number {
  if (floor) return Math.floor(num / divisor) * divisor;
  return Math.ceil(num / divisor) * divisor;
}

export function execute(_prices: string): string {
  // _prices will have the results of the dc, which is only candles here
  const prices = parseCandles(_prices);
  // If we have no candles, skip action
  if (prices.length == 0) {
    return `continue`;
  }

  const lowerLimit = trailingStop(percent, prices);
  const upperLimit = prices[prices.length - 1].close;
  
  const upperTick = closestDivisibleNumber(i32(Math.round(getTickFromPrice(f64(upperLimit)))), getTickSpacing(poolFee), false);
  const lowerTick = closestDivisibleNumber(i32(Math.round(getTickFromPrice(f64(lowerLimit)))), getTickSpacing(poolFee), true);
  
  // Calculate position

  
  const positions = [new Position(i32(lowerTick), i32(upperTick), 100)];

  // Format and return result
  return renderULMResult(positions, 10000);
}

export function config(): string {
  return `{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Strategy Config",
    "type": "object",
    "expectedDataTypes": ["OHLC"],
    "properties": {
      "percent": {
        "type": "number",
        "description": "Percent for trailing stop order (must be greater than pool fee)",
        "default": 5.0
    },
      "poolFee": {
        "description": "Pool fee percent for desired Uniswapv3 pool",
        "enum" : [10000, 3000, 500, 100],
        "enumNames": ["1%", "0.3%", "0.05%", "0.01%"]
      }
    },
    "required": ["percent", "poolFee"]
  }`;
}

export function version(): i32 {
  return 1;
}
