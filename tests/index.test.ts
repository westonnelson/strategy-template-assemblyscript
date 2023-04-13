import { config, config_payload, prices2 } from "./utils";
import fs from 'fs';
import { WasmModule, loadWasm } from "@steerprotocol/app-loader";

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
      // Call the config function on the strategy bundle
      const result = myModule["execute(param_1: string)"](JSON.stringify(prices2));
      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(result);
      // The result should match the given config
      expect(JSON.stringify(parsedResult)).toStrictEqual(
        `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[492180],[492780],[100]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
      );
    });
  });
});

