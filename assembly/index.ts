import { parsePrices, console } from "@steerprotocol/strategy-utils";
import { JSON } from "assemblyscript-json";
import { CustomStrategy } from "./CustomStrategy";

// This is the main entry point for the bundle. It is called when the bundle is loaded by the worker.
// Strategy is always exported verbatim so that the worker can find the proper reference.
export class Strategy {
  // Local instance of the strategy
  customStrategy: CustomStrategy;

  // Parse the input strings into proper types and initialize the strategy.
  constructor(config: string) {
    // Parse config object JSON string
    const parsedConfig = <JSON.Obj>JSON.parse(config.toString());

    // Parse input config object
    let percentJSON = parsedConfig.getInteger("percent");
    let binWidthJSON = parsedConfig.getInteger("binWidth");

    // Validate the config object
    if (percentJSON == null) {
      throw new Error("Percent must be a provided");
    }
    
    if (!binWidthJSON) {
      throw new Error("Bin Width must be a provided");
    }

    // Parse config values from the JSON class
    const percent = f32(percentJSON.valueOf());
    const binWidth = f32(binWidthJSON.valueOf());
    
    // Set the strategy
    this.customStrategy = new CustomStrategy(
      binWidth,
      percent
    );
  }

  // After instantiation, this is called once per epoch.
  public execute(_prices: string): string {
    // Parse the input string into an array of Price objects
    const prices = parsePrices(_prices);

    // First let's get the trailing stop price from the customer strategy class we built
    const trailingLimit = this.customStrategy.trailingStop(prices)

    // Next we'll create the smallest possible position by providing the trailing stop price
    // ass the upper and lower price for the liquidity position
    const positions = this.customStrategy.getPositions(trailingLimit, trailingLimit);

    // Once we have our positions we will use a helper function from the UniswapV3LiquidityStrategy
    // to render the result which is needed for on-chain execution.
    const result = this.customStrategy.renderResult(positions)

    console.log(result);

    return result;
  }

  // Renders the config object in JSON Schema format, which is used
  // by the frontend to display input value options and validate user input.
  static config(): string {
    return `{
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Strategy Config",
      "type": "object",
      "properties": {
        "percent": {
            "type": "number",
            "description": "Percent for trailing stop order"
        },
        "binWidth": {
            "type": "number",
            "description": "Width for liquidity buckets"
        }
      },
      "required": ["percent", "binWidth"]
    }`;
  }
}
