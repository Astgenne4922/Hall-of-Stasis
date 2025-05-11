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

    advancePlayer(event: MouseEvent) {
        this.index++;

        if (this.index >= this.parsedLines()!.length) {
            console.log('FINITO');

            return;
        }
        const dialogs_ctx =
            this.dialogs_canvas().nativeElement.getContext('2d')!;
        const bg_img_ctx = this.bg_img_canvas().nativeElement.getContext('2d')!;
        let line = this.parsedLines()![this.index].parsed;

        console.log(this.parsedLines()![this.index].original);
        console.log(line);

        switch (line.type) {
            case 'background':
                const img = new Image();
                img.src = `${this.BG_URL}/${(line.data as any).image}.png`;
                img.onload = () => {
                    // bg_img_ctx.scale(
                    //     (line.data as any).xScale,
                    //     (line.data as any).yScale
                    // );
                    bg_img_ctx.drawImage(
                        img,
                        (line.data as any).y,
                        (line.data as any).x,
                        1024,
                        576,
                        0,
                        0,
                        1024,
                        576
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
                        // dialogs_ctx.fillText();
                        dialogs_ctx.fillStyle = 'red';
                        dialogs_ctx.fillRect(100, 576 - 70, 170, 20);
                    }
                }

                break;
            default:
                console.log(event);

                (event.target! as any).click();
                break;
        }
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
