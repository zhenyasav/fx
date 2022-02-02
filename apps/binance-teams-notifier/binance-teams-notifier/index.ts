import { AzureFunction, Context } from "@azure/functions";
import { notify } from "./notify";

const timerTrigger: AzureFunction = async function (
  context: Context,
  myTimer: any
): Promise<void> {
  console.log('posting...');
  const data = await notify();
  console.log('posted.', data);
};

export default timerTrigger;
