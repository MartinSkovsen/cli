import yargs, { CommandModule } from "yargs";
import { readFromPrunerFile } from "../io";
import { allProviders } from "../providers";
import { run } from "../runner";

type Args = {
    provider: string
}

export default {
    command: "run <provider>",
    describe: "Run tests in .NET.",
    builder: yargs => yargs
        .positional("provider", {
            choices: allProviders.map(x => x.providerName)
        }),
    handler: async (args: Args) => {
        const Provider = allProviders.find(x => x.providerName === args.provider);
        await run(Provider);
    }
} as CommandModule<typeof yargs, Args>;