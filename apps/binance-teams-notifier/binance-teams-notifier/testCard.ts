import { sendCard } from "./sendCard";
// import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import * as cat from "./http-cat.json";
// import * as template from "./binance-card.json";
import * as stonks from "./stonks.json";

import { binanceCard } from "./binanceCard";

// const card = AdaptiveCards.declare(template);
// const rendered = card.render(stonks);

const manual = binanceCard(stonks);

async function test(card) {
  console.log(JSON.stringify(card, null, 2));
  const result = await sendCard(card);
  console.log(result.data);
}

test(manual);
