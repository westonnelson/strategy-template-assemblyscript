import { JSON } from "assemblyscript-json";
import { UniswapV3LiquidityStrategy } from "@steerprotocol/concentrated-liquidity-strategy";
import { parsePrices } from "@steerprotocol/strategy-utils";
import { CustomStrategy } from "./CustomStrategy";

export const Float32Array_ID = idof<Float32Array>();

export type StrategyResult = Array<f32>;

// This is the main entry point for the bundle. It is called when the bundle is loaded by the worker.
export class Strategy extends UniswapV3LiquidityStrategy {
  
  // Local instance of the strategy
  customStrategy: CustomStrategy;

  // Parse the input strings into proper types and intitalize the strategy.
  constructor(config: string) {    
    
    // Parse config object JSON string
    const parsedConfig = <JSON.Obj>JSON.parse(config.toString());

    // Parse input config object
    let periodRaw = parsedConfig.getInteger("period");
    let standardDeviationRaw = parsedConfig.getInteger("standardDeviation");
    let binWidthRaw = parsedConfig.getInteger("binWidth");

    // Validate the config object
    if (!binWidthRaw) {
      throw new Error("binWidth must be a number");
    }

    if(!(periodRaw && standardDeviationRaw)) {
      throw new Error("Invalid config");  
    }

    // Parse config values
    const period = i32(periodRaw.valueOf())
    const standardDeviation = i32(standardDeviationRaw.valueOf())
    const binWidth = f32(binWidthRaw.valueOf())
    
    // Because we exent the UniswapV3LiquidityStrategy class, we need to call the super constructor
    // it requires the binWidth parameter
    super(binWidth);    
    
    // Set the strategy
    this.customStrategy = new CustomStrategy(period, standardDeviation, f32(binWidth));
  }

  // After instantiation, this is called once per epoch.
  execute(_prices: string): string {
    const prices = parsePrices(_prices);

    return this.renderResult(
      []
    );
  }

  // Renders the config object in JSON Schema format, which is used
  // by the frontend to display input value options and validate user input.
  static config(): string {
    return `{
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Strategy Config",
      "type": "object",
      "properties": {
        "period": {
          "type": "number",
          "description": "Number of candles per period"
        },
        "standardDeviation": {
          "type": "number",
          "description": "Width multiplier for the channel"
        },
        "binWidth": {
          "type": "number",
          "description": "Width of the bin in ticks, should be a multiple of pool size, i.e. 10, 60, 200"
        }
      },
      "required": ["period", "standardDeviation", "binWidth"]
    }`;
  }
}