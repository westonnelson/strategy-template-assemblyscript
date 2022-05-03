import { BandsResult, BinsResult, BinStyle, UniswapV3LiquidityStrategy } from "@steerprotocol/concentrated-liquidity-strategy";
import { EMA, getAverageTrueRange, Price } from "@steerprotocol/strategy-utils";


export class CustomStrategy extends UniswapV3LiquidityStrategy {
  private readonly EMA: EMA;
  private prices: Price[] = [];
  private result: BandsResult = [];

  public interval: i32 = 1;
  public deviationMultiplier: i32 = 3;

  constructor(interval: i32, deviationMultiplier: i32, binWidth: f32) {
    // Setup bin widths for liquidity buckets
    // because we are extending the UniswapV3LiquidityStrategy
    super(binWidth);

    // Setup instance variables
    this.interval = interval;
    this.deviationMultiplier = deviationMultiplier;

    // Create new EMA to build the moving average
    this.EMA = new EMA(this.interval, this.deviationMultiplier);
  }

  // Check if enough data exists  for
  // the EMA can be created
  private isStable(): boolean {
    return this.prices.length >= this.interval;
  }

  public getResult(): BandsResult {
    if (!this.result || !this.isStable()) {
      throw new Error("Not enough data");
    }

    return this.result;
  }

  // This is used to calculate the EMA on the next incoming value
  // It uses the previous ema to calculate the next ema
  // it also manages the length  of the EMA
  public update(_price: Price): void {
    // Push new candle to the historical data array
    this.prices.push(_price);

    // Calculate and update the EMA value
    this.EMA.update(_price.close);

    // If the prices are larger than the interval
    // then the first value is removed
    while (this.prices.length > this.interval) {
      this.prices.shift();
    }

    // If after all the calculations and updates
    // we still are not stable then return nothing
    // if (!this.isStable()) {
    //   return;
    // }

    // After we call update on the EMA, we can call getResult to
    // retrieve the current EMA value
    const avg = this.EMA.getResult();
    // Logger.log('avg'+avg.toString());
    // Calculate the average true range
    const atr = getAverageTrueRange(this.prices, this.interval);
    // Logger.log('atr'+atr.toString());
    //Returning the lowerbound as the middle bound to fit the getString method in the tests
    this.result = [
      f32(avg + atr * f32(this.deviationMultiplier)),
      f32(avg - atr * f32(this.deviationMultiplier)),
    ];
  }

  // This getter is in the keltner channels
  // strategy, because this is where the
  // prices array is stored
  public getBins(style: BinStyle): BinsResult {
    if (!this.result) {
      throw new Error("Not enough data");
    }

    // Depending on the style of liquidity curve, 
    // we chose and return the proper result
    switch (style) {
      case BinStyle.ABSOLUTE:
        return this.calculateBins(this.result[0], this.result[1]);
      case BinStyle.NORMALIZED:
        return this.calculateNormalizedBins(
          this.prices,
          this.result[0],
          this.result[1]
        );
      default:
        throw new Error("Invalid style");
    }
  }
}