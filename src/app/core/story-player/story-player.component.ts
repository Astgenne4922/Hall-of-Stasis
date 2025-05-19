import { httpResource } from '@angular/common/http';
import {
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    viewChild,
} from '@angular/core';
import { StoryPlayerService } from './services/story-player.service';
import { ScriptParserService } from './services/script-parser.service';
import { dialogCommand } from './services/command.model';

@Component({
    selector: 'app-story-player',
    templateUrl: './story-player.component.html',
    styleUrls: ['./story-player.component.scss'],
})
export class StoryPlayerComponent {
    playerService = inject(StoryPlayerService);
    parserService = inject(ScriptParserService);

    CHAR_URL =
        'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/avg/characters';

    decision_canvas =
        viewChild.required<ElementRef<HTMLCanvasElement>>('decision');
    decision_ctx = computed(
        () => this.decision_canvas().nativeElement.getContext('2d')!,
    );

    dialogs_canvas =
        viewChild.required<ElementRef<HTMLCanvasElement>>('dialogs');
    dialogs_ctx = computed(
        () => this.dialogs_canvas().nativeElement.getContext('2d')!,
    );

    overlay_canvas =
        viewChild.required<ElementRef<HTMLCanvasElement>>('overlay');
    overlay_ctx = computed(
        () => this.overlay_canvas().nativeElement.getContext('2d')!,
    );

    image_canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('image');
    image_ctx = computed(
        () => this.image_canvas().nativeElement.getContext('2d')!,
    );

    char_canvas =
        viewChild.required<ElementRef<HTMLCanvasElement>>('characters');
    char_ctx = computed(
        () => this.char_canvas().nativeElement.getContext('2d')!,
    );

    bg_img_canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('bg_img');
    bg_img_ctx = computed(
        () => this.bg_img_canvas().nativeElement.getContext('2d')!,
    );

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
    index = 0;
    isInDelay = false;
    isInDecision = false;
    choiceNumber = 0;
    choosenAnswer = 0;
    typewriterInterval: ReturnType<typeof setInterval> | null = null;
    currentImage!: string;

    constructor() {
        effect(() => {
            if (this.storyTxt.hasValue()) this.reset();
        });
    }

    advancePlayer(event: MouseEvent) {
        if (this.isInDelay) return;
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.playerService.drawDialog(
                this.parsedLines()![this.index].parsed as dialogCommand,
                this.dialogs_ctx(),
            );
            this.typewriterInterval = null;
            return;
        }
        if (this.isInDecision) {
            for (let i = 0; i < this.choiceNumber; i++) {
                let y;
                if (this.choiceNumber === 3)
                    y = 288 + (80 - 80 * (this.choiceNumber - 1 - i));
                else if (this.choiceNumber === 2)
                    y = 288 + (40 - 80 * (this.choiceNumber - 1 - i));
                else y = 288;

                const button = new Path2D();
                button.rect(200, y, 624, 50);
                if (
                    this.decision_ctx().isPointInPath(
                        button,
                        event.offsetX,
                        event.offsetY,
                    )
                ) {
                    this.decision_ctx().clearRect(0, 0, 1024, 576);
                    this.isInDecision = false;
                    this.choosenAnswer = i + 1;
                }
            }

            if (this.isInDecision) return;
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
            case 'delay':
                this.isInDelay = true;
                setTimeout(
                    () => {
                        this.isInDelay = false;
                        this.click();
                    },
                    +(line.parameters?.['time'] ?? 0) * 1000,
                );
                break;
            case 'blocker':
                this.playerService.drawBlocker(line, this.overlay_ctx());
                if (line.parameters?.['block'] === 'true') {
                    this.isInDelay = true;
                    setTimeout(
                        () => {
                            this.isInDelay = false;
                            this.click();
                        },
                        +(line.parameters?.['fadetime'] ?? 0) * 1000,
                    );
                } else this.click();
                break;
            case 'image':
                this.playerService.drawImage(line, this.image_ctx());
                if (line.parameters)
                    this.currentImage = line.parameters!['image'];
                this.click();
                break;
            case 'imagetween':
                this.playerService.moveImage(
                    this.currentImage,
                    line,
                    this.image_ctx(),
                );

                if (line.parameters?.['block'] === 'true') {
                    this.isInDelay = true;
                    setTimeout(
                        () => {
                            this.isInDelay = false;
                            this.click();
                        },
                        +(line.parameters?.['fadetime'] ?? 0) * 1000,
                    );
                } else this.click();
                break;
            case 'background':
                this.playerService.drawBackground(line, this.bg_img_ctx());
                this.click();
                break;
            case 'dialog':
                this.dialogs_ctx().clearRect(0, 0, 1024, 576);

                if (line.content) {
                    this.typewriterInterval = this.playerService.typeDialog(
                        line as dialogCommand,
                        this.dialogs_ctx(),
                        () => (this.typewriterInterval = null),
                    );
                } else this.click();
                break;
            case 'character':
                this.playerService.drawCharacters(line, this.char_ctx());
                this.click();
                break;
            case 'decision':
                this.isInDecision = true;
                this.choiceNumber =
                    line.parameters!['options'].split(';').length;
                this.playerService.drawDecision(line, this.decision_ctx());

                break;
            case 'predicate':
                if (line.parameters!['references'].includes(';')) {
                    this.choosenAnswer = 0;
                } else if (
                    +line.parameters!['references'] !== this.choosenAnswer
                ) {
                    while (
                        this.parsedLines()![this.index + 1].parsed.command !==
                        'predicate'
                    ) {
                        this.index++;
                    }
                }

                this.click();
                break;
            default:
                this.click();
                break;
        }
    }

    private click() {
        this.dialogs_canvas().nativeElement.dispatchEvent(
            new Event('click', { bubbles: true, cancelable: false }),
        );
    }

    private reset() {
        this.index = 0;

        this.bg_img_ctx().clearRect(0, 0, 1024, 576);
        this.char_ctx().clearRect(0, 0, 1024, 576);
        this.image_ctx().clearRect(0, 0, 1024, 576);
        this.overlay_ctx().clearRect(0, 0, 1024, 576);
        this.dialogs_ctx().clearRect(0, 0, 1024, 576);
        this.decision_ctx().clearRect(0, 0, 1024, 576);
    }
}
