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

    dialogs_canvas =
        viewChild.required<ElementRef<HTMLCanvasElement>>('dialogs');
    dialogs_ctx = computed(
        () => this.dialogs_canvas().nativeElement.getContext('2d')!,
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
                    parsed: this.playerService.parseScriptLine(line),
                    new: this.parserService.parseScriptLine(line),
                };
            });
    });
    index = 0;
    isAnimatingEvent = false;

    constructor() {
        effect(() => {
            if (this.storyTxt.hasValue()) this.reset();
        });
    }

    advancePlayer(event: MouseEvent) {
        if (this.isAnimatingEvent) return;

        this.isAnimatingEvent = true;
        while (this.isAnimatingEvent) {
            this.index++;

            if (this.index >= this.parsedLines()!.length) {
                console.log('FINITO');

                return;
            }

            let line: any = this.parsedLines()![this.index].parsed;

            console.log(this.parsedLines()![this.index].original);
            console.log(this.parsedLines()![this.index].new);
            console.log(line);

            switch (line.type) {
                case 'background':
                    this.playerService.drawBackground(line, this.bg_img_ctx());
                    break;
                case 'dialog':
                    this.dialogs_ctx().clearRect(0, 0, 1024, 576);

                    if (line.data.text) {
                        this.playerService.drawDialog(line, this.dialogs_ctx());
                        this.isAnimatingEvent = false;
                    }

                    break;
                case 'character':
                    this.playerService.drawCharacters(line, this.char_ctx());
                    break;
                default:
                    break;
            }
        }
    }

    reset() {
        this.index = 0;
        this.isAnimatingEvent = false;

        this.bg_img_ctx().clearRect(0, 0, 1024, 576);
        this.dialogs_ctx().clearRect(0, 0, 1024, 576);
        this.char_ctx().clearRect(0, 0, 1024, 576);
    }
}
