import axios from "axios";

const webhookurl = "https://microsoft.webhook.office.com/webhookb2/d71619a2-07f7-4363-96c0-6fc3fac03214@72f988bf-86f1-41af-91ab-2d7cd011db47/IncomingWebhook/688eb71d2cd645359dcc3cd2c224f027/36ff5f38-6aef-4a01-940e-be3807b1466c";

export async function sendCard(card) {
  return axios.post(webhookurl, {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: card,
      },
    ],
  });
}