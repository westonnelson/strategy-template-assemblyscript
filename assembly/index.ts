import { JSON } from "assemblyscript-json";
import {Position, parsePrices, getTickFromPrice, trailingStop, renderULMResult, getTickSpacing} from "@steerprotocol/strategy-utils";


let width: i32 = 600;
let percent: f32 = 0;
let poolFee: i32 = 0;

export function initialize(config: string): void {
  // Parse the config object
  const configJson = <JSON.Obj>JSON.parse(config);
  // Get our config variables
  const _width = configJson.getInteger("binWidth");
  const _poolFee = configJson.getInteger("poolFee");
  const _percent = configJson.getValue("percent");
  // Handle null case
  if (_width == null || _percent == null || _poolFee == null) {
    throw new Error("Invalid configuration");
  }

  // Handle int percents
  if (_percent.isFloat) {
    const f_percent = <JSON.Num>_percent
    percent = f32(f_percent._num);
  }
  if (_percent.isInteger) {
    const i_percent = <JSON.Integer>_percent
    percent = f32(i_percent._num);
  }
  // Assign values to memory
  width = i32(_width._num);
  poolFee = i32(_poolFee._num);
}

export function execute(_prices: string): string {
  // _prices will be a nested array with the OHLC data in the deeper array,
  const prices = parsePrices(_prices);
  // If we have no candles 
  if (prices.length == 0) {return `skip tend, no candles`}
  // Get Trailing stop price
  const trailingLimit = trailingStop(percent, prices)
  // Calculate position
  const positions = calculateBin(trailingLimit);
  // Format and return result
  return renderULMResult(positions);
}


function calculateBin(upper: f32): Position[] {

  // Calculate the upper tick based on the start of the stop
  const upperTick: i32 = i32(Math.round(getTickFromPrice(upper)));

  // Get the spacing
  const tickSpacing = getTickSpacing(poolFee);

  // Step down ticks until we reach an initializable tick
  let _startTick: i32 = upperTick;
  while (_startTick % tickSpacing !== 0) {
    _startTick--;
  }

  const positions: Array<Position> = [];
  const position = new Position(_startTick - width, _startTick, 1);
  positions.push(position);

  return positions
}

export function config(): string{
  return `{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Strategy Config",
    "type": "object",
    "properties": {
      "percent": {
          "type": "number",
          "description": "Percent for trailing stop order"
      },
      "poolFee": {
        "type": "number",
        "description": "expanded pool fee percent for Uniswapv3 pool"
      },
      "binWidth": {
          "type": "number",
          "description": "Width for liquidity position, must be a multiple of pool tick spacing"
      }
    },
    "required": ["percent", "binWidth", "poolFee"]
  }`;
}

