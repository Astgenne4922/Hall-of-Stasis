import { Injectable } from '@angular/core';

export type genericCommand = {
    command: string;
    parameters: {
        [key: string]: string;
    } | null;
    content: string | null;
};

export type dialogCommand = {
    command: 'dialog';
    parameters: {
        speaker: string | null;
    };
    content: string;
};

@Injectable({
    providedIn: 'root',
})
export class ScriptParserService {
    parseScriptLine(line: string): genericCommand | dialogCommand {
        let match = line.match(/^\[(\w+)(?:\((.*)\))?\](?:\s*(.+))?$/);

        if (match) {
            return {
                command: match[1].toLowerCase(),
                parameters: [
                    ...(match[2]?.matchAll(/(\w+)\s*=\s*"?([^",\s]*)"?/g) ??
                        []),
                ].reduce(
                    (acc: any, m) => ({ ...(acc ?? {}), [m[1]]: m[2] }),
                    null,
                ),
                content: match[3] ?? null,
            };
        }

        match = line.match(/^\[name="(.*?)"\](.+)$/);
        return {
            command: 'dialog',
            parameters: { speaker: match?.[1] ?? null },
            content: match?.[2] ?? line,
        };
    }
}
