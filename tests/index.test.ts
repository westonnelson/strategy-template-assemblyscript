const myModule = require("../untouchLoader");

describe("WASM Module", () => {
  describe("keltnerChannels", () => {
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
                "period": {
                    "type": "number",
                    "description": "Number of candles per period"
                },
                "standardDeviation": {
                    "type": "number",
                    "description": "Width multiplier for the channel"
                },
                "binWidth": {
                    "description": "Width of the bin in ticks, should be a multiple of pool size, i.e. 10, 60, 200",
                    "type": "number"
                }
            },
            "required": ["period", "standardDeviation", "binWidth"]
        }`)
      );
    });
  });
});
