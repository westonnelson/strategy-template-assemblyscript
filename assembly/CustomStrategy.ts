import { BandsResult, UniswapV3LiquidityStrategy } from "@steerprotocol/concentrated-liquidity-strategy";
import { Price } from "@steerprotocol/strategy-utils";

export class CustomStrategy extends UniswapV3LiquidityStrategy {
  private result: BandsResult = [];

  public percent: f32 = 0;

  constructor(binWidth: f32, percent: f32) {
    // Setup bin widths for liquidity buckets
    // because we are extending the UniswapV3LiquidityStrategy
    super(binWidth);
    this.percent = percent;
  }

  trailingStop(prices: Price[]): f32 {
    // Get the current price of the asset pair
    const currentPrice = prices[prices.length - 1];
  
    // Calculate the trailing stop price
    const trailingStopPrice = currentPrice.close - (currentPrice.close * (this.percent / 100));
  
    // Return the trailing stop price
    return trailingStopPrice;
  }
}