import { Injectable } from '@angular/core';
import { dialogCommand, genericCommand } from './command.model';

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
                    ...(match[2]?.matchAll(
                        /(\w+)\s*=\s*(?:"([^"]*)"|([^",\s]*))/g,
                    ) ?? []),
                ].reduce(
                    (acc: any, m) => ({ ...(acc ?? {}), [m[1]]: m[2] ?? m[3] }),
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
