import { prices } from "./utils";

// We use untouched so that we can run the un-optimized version of the wasm which will provide better stacktraces
const myModule = require("../untouchLoader");

describe("WASM Module", () => {
  describe("Custom Strategy", () => {
    test("can render config", async () => {
      // Call the config function on the strategy bundle
      const result = myModule.Strategy.config();

      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(myModule.__getString(result));

      // The result should match the given config
      expect(parsedResult).toStrictEqual(
        JSON.parse(`
        {
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
        }`)
      );
    });
    
    test("can run execute", async () => {
      let paramsMemoryRef = myModule.__pin(
        myModule.__newString(
          JSON.stringify({
            percent: 5.0,
            binWidth: 120
          })
        )
      );

      // The actual strategy instantiation and execution
      const strategy = myModule.Strategy(paramsMemoryRef);

      // Here we pin the array to the WASM memory
      let priceMemoryRef = myModule.__pin(
        myModule.__newString(JSON.stringify(prices))
      );
      
      // Call the config function on the strategy bundle
      const result = strategy.execute(priceMemoryRef);

      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(myModule.__getString(result));

      // The result should match the given config
      expect(parsedResult).toStrictEqual(
        JSON.parse(`{ 
          "bins": [
            {
              "lowerBound": "103800.0",
              "upperBound": "103920.0",
              "weight": "65534.0"
            }
          ]
        }`)
      );
    });
  });
});
