import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    // const name = (req.query.name || (req.body && req.body.name));
    
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: { ok: 1 }
    };

};

export default httpTrigger;