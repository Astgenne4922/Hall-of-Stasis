import { Injectable } from '@angular/core';
import { Command } from './command.model';

@Injectable({
    providedIn: 'root',
})
export class ScriptParserService {
    parseScriptLine(line: string): Command {
        let match = line.match(/^\[(\w+)(?:\((.*)\))?\](?:\s*(.+))?$/);

        if (match) {
            return {
                command: match[1].toLowerCase(),
                parameters: [...(match[2]?.matchAll(/(\w+)\s*=\s*(?:"([^"]*)"|([^",\s]*))/g) ?? [])].reduce(
                    (acc: any, m) => ({ ...(acc ?? {}), [m[1]]: m[2] ?? m[3] }),
                    null,
                ),
                content: match[3] ?? null,
            };
        }

        match = line.match(/^\[name="(.*?)"\](.+)$/);
        return {
            command: 'dialog',
            parameters: match?.[1] ? { name: match?.[1] } : null,
            content: match?.[2] ?? line,
        };
    }

    parseRichText(text: string) {
        text = text.replaceAll('\\n', '\n');

        const styles: {
            [key: number | string]: { [key: number | string]: any };
        } = { 0: {} };
        let parsedText = '';
        let parsedLineIndex = 0;
        let parsedCharIndex = 0;

        let isColorOpen = false;
        let isItalicOpen = false;
        let isBoldOpen = false;
        let color = '';

        for (let i = 0; i < text.length; i++) {
            if (text[i] === '<') {
                i++;
                const isClosing = text[i] === '/';
                if (isClosing) i++;

                if (text[i] === 'i') isItalicOpen = !isClosing;
                else if (text[i] === 'b') isBoldOpen = !isClosing;
                else {
                    const close = text.slice(i).indexOf('>') + i;
                    i += 4;

                    if (isClosing) {
                        isColorOpen = false;
                    } else {
                        i += 2;
                        color = text.slice(i, i + 7);
                        i += 6;

                        isColorOpen = true;
                    }
                }

                i++;
            } else {
                parsedText += text[i];

                if (text[i] === '\n') {
                    parsedLineIndex++;
                    styles[parsedLineIndex] = {};
                    parsedCharIndex = 0;
                } else {
                    if (isBoldOpen || isItalicOpen || isColorOpen) styles[parsedLineIndex][parsedCharIndex] = {};
                    if (isBoldOpen) styles[parsedLineIndex][parsedCharIndex]['fontWeight'] = 'bold';
                    if (isItalicOpen) styles[parsedLineIndex][parsedCharIndex]['fontStyle'] = 'italic';
                    if (isColorOpen) styles[parsedLineIndex][parsedCharIndex]['fill'] = color;

                    parsedCharIndex++;
                }
            }
        }

        return { text: parsedText, styles: styles };
    }
}
