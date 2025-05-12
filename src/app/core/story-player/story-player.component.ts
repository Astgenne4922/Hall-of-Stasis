import { httpResource } from '@angular/common/http';
import {
    Component,
    computed,
    effect,
    ElementRef,
    input,
    viewChild,
} from '@angular/core';

@Component({
    selector: 'app-story-player',
    templateUrl: './story-player.component.html',
    styleUrls: ['./story-player.component.scss'],
})
export class StoryPlayerComponent {
    BG_URL =
        'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/avg/backgrounds';
    CHAR_URL =
        'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/avg/characters';

    dialogs_canvas =
        viewChild.required<ElementRef<HTMLCanvasElement>>('dialogs');
    char_canvas =
        viewChild.required<ElementRef<HTMLCanvasElement>>('characters');
    bg_img_canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('bg_img');

    storyUrl = input.required<string>();

    storyTxt = httpResource.text(() => this.storyUrl());
    parsedLines = computed(() => {
        return this.storyTxt
            .value()
            ?.split('\n')
            .map((line) => {
                return { original: line, parsed: this.parseScriptLine(line) };
            });
    });
    index = 0;
    isTyping = false;

    advancePlayer(event: MouseEvent) {
        if (!this.isTyping) this.index++;

        if (this.index >= this.parsedLines()!.length) {
            console.log('FINITO');

            return;
        }
        const dialogs_ctx =
            this.dialogs_canvas().nativeElement.getContext('2d')!;
        const bg_img_ctx = this.bg_img_canvas().nativeElement.getContext('2d')!;
        const char_ctx = this.char_canvas().nativeElement.getContext('2d')!;

        let line: any = this.parsedLines()![this.index].parsed;

        console.log(this.parsedLines()![this.index].original);
        console.log(line);

        switch (line.type) {
            case 'background':
                const img = new Image();
                img.src = `${this.BG_URL}/${line.data.image}.png`;
                img.onload = () => {
                    bg_img_ctx.drawImage(
                        img,
                        line.data.x -
                            (1024 - 1024 / (line.data.xScale + 0.2)) / 2,
                        line.data.y -
                            (576 - 576 / (line.data.yScale + 0.2)) / 2,
                        1024 * (line.data.xScale + 0.2),
                        576 * (line.data.yScale + 0.2)
                    );
                };

                break;
            case 'dialog':
                dialogs_ctx.clearRect(0, 0, 1024, 576);

                if (line.data.text) {
                    const grad = dialogs_ctx.createLinearGradient(
                        1024 / 2,
                        576 - 200,
                        1024 / 2,
                        576
                    );
                    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
                    grad.addColorStop(1, 'rgba(0, 0, 0, 1)');

                    const grad2 = dialogs_ctx.createLinearGradient(
                        1024 / 2,
                        0,
                        1024 / 2,
                        100
                    );
                    grad2.addColorStop(0, 'rgba(0, 0, 0, 1)');
                    grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    dialogs_ctx.fillStyle = grad;
                    dialogs_ctx.fillRect(0, 576 - 200, 1024, 200);
                    dialogs_ctx.fillStyle = grad2;
                    dialogs_ctx.fillRect(0, 0, 1024, 100);

                    if (line.data.speaker) {
                        dialogs_ctx.font = '20px Arial, Helvetica, sans-serif';
                        dialogs_ctx.fillStyle = '#7B7B7B';
                        dialogs_ctx.textAlign = 'right';
                        dialogs_ctx.fillText(line.data.speaker, 260, 576 - 55);
                    }

                    if (line.data.text) {
                        dialogs_ctx.font = '18px Arial, Helvetica, sans-serif';
                        dialogs_ctx.fillStyle = 'white';
                        dialogs_ctx.textAlign = 'left';
                        const lines = this.wrapText(
                            line.data.text,
                            dialogs_ctx
                        );
                        const metrics = dialogs_ctx.measureText(line.data.text);
                        const lineHeight =
                            metrics.fontBoundingBoxAscent +
                            metrics.fontBoundingBoxDescent;

                        if (!this.isTyping) {
                            const typewriter = (lineIdx = 0, i = 0) => {
                                const cursorX =
                                    dialogs_ctx.measureText(
                                        lines[lineIdx].slice(0, i + 1)
                                    ).width -
                                    dialogs_ctx.measureText(lines[lineIdx][i])
                                        .width;
                                dialogs_ctx.fillText(
                                    lines[lineIdx][i],
                                    300 + cursorX,
                                    576 - 55 + lineHeight * lineIdx
                                );
                                if (this.isTyping) {
                                    if (i + 1 < lines[lineIdx].length)
                                        setTimeout(
                                            () => typewriter(lineIdx, i + 1),
                                            25
                                        );
                                    else if (lineIdx + 1 < lines.length)
                                        setTimeout(
                                            () => typewriter(lineIdx + 1, 0),
                                            25
                                        );
                                    else this.isTyping = false;
                                }
                            };
                            this.isTyping = true;
                            typewriter();
                        } else {
                            this.isTyping = false;
                            for (let i = 0; i < lines.length; i++) {
                                dialogs_ctx.fillText(
                                    lines[i],
                                    300,
                                    576 - 55 + lineHeight * i
                                );
                            }
                        }
                    }
                }

                break;
            case 'character':
                char_ctx.clearRect(0, 0, 1024, 576);

                if (line.data.name) {
                    if (line.data.name2) {
                    } else {
                        const img = new Image();
                        if (line.data.name.split('_').length > 3)
                            img.src = `${
                                this.CHAR_URL
                            }/${line.data.name.replace(
                                /#\d$/,
                                ''
                            )}/${line.data.name.replace(/\d#/, '')}.png`;
                        else img.src = `${this.CHAR_URL}/${line.data.name}.png`;
                        img.onload = () => {
                            char_ctx.drawImage(img, 62, 20, 900, 900);
                            char_ctx.strokeRect(62, 20, 900, 900);
                        };
                    }
                }
                break;
            default:
                break;
        }
    }

    wrapText(text: string, ctx: CanvasRenderingContext2D) {
        const lines: string[] = [''];
        let i = 0;

        for (const word of text.trim().split(' ')) {
            if (ctx.measureText(`${lines[i]} ${word}`).width < 1024 - 300)
                lines[i] = `${lines[i]} ${word}`.trim();
            else {
                lines.push(word);
                i++;
            }
        }

        return lines;
    }

    parseScriptLine(line: string) {
        const eventMatch = line.match(/^\[(\w+)(?:\((.*)\))?\]$/i);
        if (eventMatch) {
            const eventType = eventMatch[1].toLowerCase();
            const rawParams = eventMatch[2] || '';

            let parsedParams = {};
            if (rawParams) parsedParams = this.parseEventParams(rawParams);

            return {
                type: eventType,
                data: {
                    ...parsedParams,
                },
            };
        }

        const eventMatch2 = line.match(/^\[(\w+)(?:\((.*)\))?\]\s*(.+)$/);
        if (eventMatch2) {
            const eventType = eventMatch2[1].toLowerCase();
            const rawParams = eventMatch2[2] || '';
            const content = eventMatch2[3] || '';

            let parsedParams = {};
            if (rawParams) parsedParams = this.parseEventParams(rawParams);

            return {
                type: eventType,
                data: {
                    content,
                    ...parsedParams,
                },
            };
        }

        const dialogMatch = line.match(/^\[name="(.*?)"\](.+)$/);
        if (dialogMatch) {
            return {
                type: 'dialog',
                data: {
                    speaker: dialogMatch[1],
                    text: dialogMatch[2],
                },
            };
        }

        return {
            type: 'narration',
            data: {
                text: line,
            },
        };
    }

    parseEventParams(params: string) {
        const result: { [key: string]: any } = {};

        const regex = /(\w+)\s*=\s*(?:"([^"]*)"|([^",\s]+))/g;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(params)) !== null) {
            const key = match[1];
            const value = match[2] !== undefined ? match[2] : match[3];

            if (value === 'true') {
                result[key] = true;
            } else if (value === 'false') {
                result[key] = false;
            } else if (!isNaN(parseInt(value)) && value.trim() !== '') {
                result[key] = Number(value);
            } else {
                result[key] = value;
            }
        }

        return result;
    }
}
