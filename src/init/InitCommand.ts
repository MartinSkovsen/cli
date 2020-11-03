import yargs, { CommandModule } from "yargs";
import { getGitTopDirectory } from "../git";
import { writeToFile } from "../io";
import { join } from "path";

type Args = {}

export default {
    command: "init",
    describe: "Set up Pruner for this project.",
    builder: yargs => yargs,
    handler: async () => {
        const topDirectoryPath = await getGitTopDirectory();
        if(!topDirectoryPath) {
            console.error("Pruner requires that the current directory is in GIT.");
            return;
        }

        await writeToFile(
            join(topDirectoryPath, ".pruner", "settings.json"), 
            JSON.stringify({}));

        console.log("Pruner has been initialized!");
    }
} as CommandModule<typeof yargs, Args>;