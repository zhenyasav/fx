import * as stonks from "./stonks.json";
import { format } from "date-fns";

export type BinanceCardData = typeof stonks;
export type Stonk = typeof stonks.stocks[0];

const price = (n) => Number(n).toFixed(6);
const percent = (n) =>
  Math.round(Number(n) < 1 ? Number(n) * 100 : Number(n)) + "%";
const sortBy = (asc: boolean, p) => (a, b) => asc ? p(b) - p(a) : p(a) - p(b);
const sort = (a: Stonk) => Number(a.priceChangePercent);
const filterStonks = (stonks: Stonk[]) => {
  const N = 3;
  const sorted = stonks.sort(sortBy(true, sort));
  const top = sorted.slice(0, N);
  const bottom = sorted.slice(stonks.length - N);
  return [...top, ...bottom];
};

export function binanceCard(data: BinanceCardData) {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.3",
    body: [
      {
        type: "Container",
        spacing: "None",
        items: [
          {
            type: "TextBlock",
            text: "Top and bottom movers in the last 24hr:"
          },
          ...filterStonks(data.stocks).map((stock) => ({
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: `${stock.symbol} `,
                    size: "ExtraLarge",
                    wrap: true,
                  },
                ],
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: `${price(stock.lastPrice)} `,
                    size: "ExtraLarge",
                    wrap: true,
                  },
                  {
                    type: "TextBlock",
                    text: `${
                      Number(stock.priceChange) >= 0 ? "▲" : "▼"
                    } ${price(stock.priceChange)} (${percent(
                      stock.priceChangePercent
                    )})`,
                    color:
                      Number(stock.priceChange) >= 0 ? "good" : "attention",
                    spacing: "None",
                    wrap: true,
                  },
                ],
              },
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "FactSet",
                    facts: [
                      {
                        title: "Open",
                        value: price(stock.openPrice),
                      },
                      {
                        title: "High",
                        value: price(stock.highPrice),
                      },
                      {
                        title: "Low",
                        value: price(stock.lowPrice),
                      },
                    ],
                  },
                ],
              },
            ],
          })),
        ],
      },
    ],
  };
}
