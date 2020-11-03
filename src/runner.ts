import * as ora from "ora";
import { readFromPrunerFile, writeToPrunerFile } from "./io";
import {Provider} from "./providers";
import { useSpinner } from "./misc";
import { getCurrentDiffText } from "./git";
import parseGitDiff, { Line } from 'git-diff-parser';
import _ from "lodash";
import chalk from "chalk";

export async function run(provider: Provider<any>) {
    await useSpinner("Running tests", async () => {
        const stateFileName = `${provider.name}.json`;
        const previousState = JSON.parse(await readFromPrunerFile(stateFileName));

        const gitDiff = parseGitDiff(await getCurrentDiffText());

        const changedLines = gitDiff
            .commits
            .flatMap(x => x.files)
            .flatMap(x => ({
                lineNumbers: _.chain(x.lines)
                    .filter(line => 
                        line.type === "added" ||
                        line.type === "deleted")
                    .flatMap(y => [y.ln1, y.ln2])
                    .filter(y => !!y)
                    .uniq()
                    .value(),
                name: x.name || x.oldName
            }))
            .filter(x => !!x.name && x.lineNumbers.length > 0);

        const result = await provider.run(previousState, changedLines);
        if(result.exitCode !== 0) {
            console.error(chalk.red("Could not run tests.") + "\n" + chalk.yellow(result.stdout) + "\n" + chalk.red(result.stderr));
            return;
        }

        console.log(chalk.green("Tests ran successfully:"));
        console.log(chalk.white(result.stdout));
        
        const state = await provider.gatherState();
        const mergedState = await provider.mergeState(previousState, state);
        await writeToPrunerFile(`${provider.name}.json`, JSON.stringify(mergedState, null, ' '));
    });
}