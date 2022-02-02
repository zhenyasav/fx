import axios from "axios";
import { Stonk } from "../binanceCard";

// https://github.com/binance/binance-api-swagger
// https://github.com/binance/binance-spot-api-docs
// https://mixedanalytics.com/blog/list-actually-free-open-no-auth-needed-apis/

const url = 'https://api.binance.com/api/v3/ticker/24hr';

export async function getStocks(): Promise<Stonk[]> {
  const result = await axios.get(url);
  return result.data as Stonk[];
}