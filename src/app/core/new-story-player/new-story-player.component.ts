import {
    AfterViewInit,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    viewChild,
} from '@angular/core';
import { ScriptParserService } from '../story-player/services/script-parser.service';
import { StoryPlayerService } from '../story-player/services/story-player.service';
import { httpResource } from '@angular/common/http';
import { genericCommand } from '../story-player/services/command.model';

const BG_URL =
    'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/avg/backgrounds';

@Component({
    selector: 'app-new-story-player',
    templateUrl: './new-story-player.component.html',
    styleUrls: ['./new-story-player.component.scss'],
})
export class NewStoryPlayerComponent implements AfterViewInit {
    playerService = inject(StoryPlayerService);
    parserService = inject(ScriptParserService);

    canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('player');
    canvas_ctx = computed(() => this.canvas().nativeElement.getContext('2d')!);

    WIDTH = 1280;
    HEIGHT = 720;

    storyUrl = input.required<string>();

    storyTxt = httpResource.text(() => this.storyUrl());
    parsedLines = computed(() => {
        return this.storyTxt
            .value()
            ?.split('\n')
            .map((line) => {
                return {
                    original: line,
                    parsed: this.parserService.parseScriptLine(line),
                };
            });
    });
    backgroundImages: { [key: string]: HTMLImageElement } = {};

    index = 0;

    background: HTMLImageElement | null = null;

    currentSpeaker: string | null = null;
    currentDialog: string | null = null;

    typewriterInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        effect(() => {
            if (this.storyTxt.hasValue()) this.reset();
        });
    }

    ngAfterViewInit(): void {
        this.drawLoop();
    }

    drawLoop() {
        requestAnimationFrame(() => this.drawLoop());

        this.canvas_ctx().reset();
        this.canvas_ctx().clearRect(0, 0, this.WIDTH, this.HEIGHT);

        if (this.background)
            this.canvas_ctx().drawImage(
                this.background!,
                0,
                0,
                this.WIDTH,
                this.HEIGHT,
            );

        if (this.currentDialog) this.drawDialog();
    }

    advancePlayer(event: MouseEvent) {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
            this.currentDialog =
                this.parsedLines()![this.index].parsed.content!;
            return;
        }

        this.index++;

        if (this.index >= this.parsedLines()!.length) {
            console.log('FINITO');
            this.reset();
            return;
        }

        const line = this.parsedLines()![this.index].parsed;

        console.log(this.parsedLines()![this.index].original);
        console.log(line);

        switch (line.command) {
            case 'background':
                if (line.parameters)
                    this.background =
                        this.backgroundImages[line.parameters!['image']];
                else this.background = null;

                this.click();
                break;
            case 'dialog':
                if (line.parameters?.speaker)
                    this.currentSpeaker = line.parameters?.speaker;
                if (line.content) {
                    let letterIdx = 0;
                    this.typewriterInterval = setInterval(() => {
                        this.currentDialog = line.content!.slice(0, letterIdx);
                        letterIdx++;
                        if (letterIdx > line.content!.length) {
                            clearInterval(this.typewriterInterval!);
                            this.typewriterInterval = null;
                        }
                    }, 25);
                } else this.currentDialog = null;
                break;
            default:
                this.click();
                break;
        }
    }

    private drawDialog() {
        const grad = this.canvas_ctx().createLinearGradient(
            this.WIDTH / 2,
            this.HEIGHT - 200,
            this.WIDTH / 2,
            this.HEIGHT,
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 1)');

        const grad2 = this.canvas_ctx().createLinearGradient(
            this.WIDTH / 2,
            0,
            this.WIDTH / 2,
            100,
        );
        grad2.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.canvas_ctx().fillStyle = grad;
        this.canvas_ctx().fillRect(0, this.HEIGHT - 200, this.WIDTH, 200);
        this.canvas_ctx().fillStyle = grad2;
        this.canvas_ctx().fillRect(0, 0, this.WIDTH, 100);

        if (this.currentSpeaker) {
            this.canvas_ctx().font = '24px Arial, Helvetica, sans-serif';
            this.canvas_ctx().fillStyle = '#7B7B7B';
            this.canvas_ctx().textAlign = 'right';
            this.canvas_ctx().fillText(
                this.currentSpeaker,
                330,
                this.HEIGHT - 70,
            );
        }

        this.canvas_ctx().font = '22px Arial, Helvetica, sans-serif';
        this.canvas_ctx().fillStyle = 'white';
        this.canvas_ctx().textAlign = 'left';
        const lines = this.wrapText(this.currentDialog!, this.canvas_ctx());
        const metrics = this.canvas_ctx().measureText(this.currentDialog!);
        const lineHeight =
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

        for (let i = 0; i < lines.length; i++) {
            this.canvas_ctx().fillText(
                lines[i],
                390,
                this.HEIGHT - 70 + lineHeight * i,
            );
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

    private click() {
        this.canvas().nativeElement.dispatchEvent(
            new Event('click', { bubbles: true, cancelable: false }),
        );
    }

    private reset() {
        this.index = 0;
        this.loadImages();
    }

    private loadImages() {
        this.backgroundImages =
            this.parsedLines()?.reduce(
                (acc: { [key: string]: HTMLImageElement }, e) => {
                    const bg = (e.parsed as genericCommand).parameters?.[
                        'image'
                    ];
                    if (e.parsed.command === 'background' && bg && !acc[bg]) {
                        acc[e.parsed.parameters!['image']] = new Image();
                        acc[e.parsed.parameters!['image']].src =
                            `${BG_URL}/${e.parsed.parameters!['image']}.png`;
                    }

                    return acc;
                },
                {},
            ) ?? {};
    }
}
