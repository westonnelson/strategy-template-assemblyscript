import { config, prices, config_payload, prices2 } from "./utils";
import fs from 'fs';
import { WasmModule, loadWasm } from "@steerprotocol/app-loader";

// We use untouched so that we can run the un-optimized version of the wasm which will provide better stacktraces
// const myModule = require("../untouchLoader");

interface DataModel {
  open: number;
  high: number;
  close: number;
  low: number;
}

// function generateRandomData(amount: number): DataModel[] {
//   const data: DataModel[] = [];

//   for (let i = 0; i < amount; i++) {
//     const open = Math.random() * 1000
//     const high = Math.random() * 1000
//     const close = Math.random() * 1000
//     const low = Math.random() * 1000

//     data.push({ open, high, close, low });
//   }

//   return data;
// }



describe("WASM Module", () => {
  let myModule: WasmModule;
  
  beforeEach(async () => {
    myModule = await loadWasm(fs.readFileSync(__dirname + "/../build/debug.wasm"), {})
  });
  describe("Custom Strategy", () => {
    test("can render config", async () => {
      // Call the config function on the strategy bundle
      const result = myModule.config();
      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(result);

      // The result should match the given config
      expect(parsedResult).toStrictEqual(JSON.parse(config));
    });

    test("can run execute", async () => {


        
      // The actual strategy instantiation and execution
      myModule.initialize(config_payload);
      // Here we pin the array to the WASM memory
      // let priceMemoryRef = myModule.__pin(
      //   myModule.__newString(JSON.stringify(prices))
      // );

      // Call the config function on the strategy bundle
      const result = myModule.execute(JSON.stringify(prices2));

      // console.log(result)
      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(result);

      // The result should match the given config
      expect(JSON.stringify(parsedResult)).toStrictEqual(
        `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[492120],[492720],[100]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
      );
    });
  });
});

// `{"bins":[{"lowerBound":"-276330","upperBound":"-276320","weight":"1"}]}`
