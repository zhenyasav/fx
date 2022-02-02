import { getStocks } from "./binance-api";
import { sendCard } from "./sendCard";
import { binanceCard } from "./binanceCard";

export async function notify() {
  const stocks = await getStocks();
  const card = binanceCard({ stocks });
  const result = await sendCard(card);
  return result.data;
}