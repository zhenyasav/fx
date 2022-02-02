import { getStocks } from "./index";

async function main() {
  console.log('fetching...');
  const stocks = await getStocks();
  console.log(stocks);
}

main();