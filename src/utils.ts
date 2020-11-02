import { glob as internalGlob } from 'glob';
import { lstat, mkdir, writeFile } from "fs/promises";
import { dirname } from 'path';

export async function glob(workingDirectory: string, pattern: string): Promise<string[]> {
    return new Promise(resolve => 
        internalGlob(
            pattern, 
            {
                cwd: workingDirectory
            }, 
            (_, matches) => resolve(matches)));
}

export async function doesPathExist(path: string) {
    const stat = await lstat(path);
    return stat.isFile() || stat.isDirectory();
}

export async function writeToFile(path: string, contents: string) {
    const fileStat = await lstat(path);
    if(!fileStat.isFile()) {
        const folderPath = dirname(path);
        const folderStat = await lstat(folderPath);
        if(!folderStat.isDirectory()) {
            await mkdir(folderPath, {
                recursive: true
            });
        }
    }

    await writeFile(path, contents);
}