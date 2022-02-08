import ngrok from "ngrok";

async function main() {
  console.log('connecting...');
  const url = await ngrok.connect();
  console.log('started', url);
}

main()