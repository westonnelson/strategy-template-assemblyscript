# Steer Protocol Strategy Template - Assemblyscript
AssemblyScript based Strategy Template for the Steer Protocol.

Start building on [Steer Protocol](https://steer.finance) with our AssemblyScript template. Expand your smart contract capabilities with off-chain compute! More info can be found here: [Documentation](https://docs.steer.finance/steer-apps/writing-an-app)

This is a template example of how to make a liquidity provision strategy that acts similarly to a stop loss. The strategist picks a percent and recent candles are passed into the strategy. From the recent price, a position is made with the upper tick set to the current price, and the lower tick at the precent down from the current price, like a stop loss. This would likely not be a great strategy for most assets/situations, be smart if you want to use this strategy.

## Parameters

This strategy only accepts one parameter from the data connectors: any OHLC type object.

## Project Structure
Apps have three external functions that are used by the Steer system. Additional methods, classes, or varaibles can be used in conjunction with these required functions for any desired behavior. For more information please see the app interface. This design means, that as a developer, you only need to implement the methods which are required for the app to work.

Below are the significant files and folders which you will want to get familiar with:

```
├── assembly      // Source code for the app
├── build         // Output of the build process aka `yarn asbuild`
├── coverage      // Coverage report for testing
├── tests         // Test files with a built in test runner
├── asconfig.json // Assemblyscript config
├── index.js      // Javascript entrypoint for the app when running tests
├── package.json  // Dependencies for the app
```

## Project Setup
Once the repository has been cloned, you will need to install the project dependencies. This can be done via the following command:

```yarn install```

INFO
You will notice that there is a post-install script which will compile the ./assembly source folder and populate the ./build folder. This is done to make it easier to run the tests. We will cover this later.

After making chenges to the assemblyscript code, compile and build the wasm files with the command:

```yarn asbuild```

You will find a number of webassembly related files in the ./build folder.

The testing suite can be found the ./tests source folder, unit tests are written in index.test.ts and can be configured there.

To run the testing suite, run:

```yarn test```

For more in depth testing of the strategy and performance try using Steer's backtesting toolkit to simulate realistic conditions.
