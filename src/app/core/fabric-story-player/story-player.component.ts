import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, input, OnInit } from '@angular/core';
import { FabricImage, StaticCanvas } from 'fabric';
import { genericCommand } from './services/command.model';
import { ScriptParserService } from './services/script-parser.service';
import { BG_URL, HEIGHT, WIDTH } from './story-player.constants';
import {
    DECISION_BUTTON_GROUP1,
    DECISION_BUTTON_GROUP2,
    DECISION_BUTTON_GROUP3,
    DIALOG_GROUP,
    STICKER_GROUP,
    SUBTITLE_TEXTBOX,
} from './services/text-commands/text-commands.constants';
import { TextCommandsService } from './services/text-commands/text-commands.service';
import { ImageCommandsService } from './services/image-commands/image-commands.service';

@Component({
    selector: 'hos-story-player',
    templateUrl: './story-player.component.html',
    styleUrls: ['./story-player.component.scss'],
    host: { '(window:resize)': 'resizeCanvas()' },
})
export class FabricStoryPlayerComponent implements OnInit {
    textCommandsService = inject(TextCommandsService);
    imageCommandsService = inject(ImageCommandsService);
    parserService = inject(ScriptParserService);

    canvas!: StaticCanvas;

    storyUrl = input.required<string>();

    storyTxt = httpResource.text(() => this.storyUrl());
    parsedLines = computed(() => {
        return this.storyTxt
            .value()
            ?.split('\n')
            .map((line) => ({ original: line, parsed: this.parserService.parseScriptLine(line) }));
    });

    index = 0;

    constructor() {
        effect(() => {
            if (this.storyTxt.hasValue()) this.reset();
        });
    }

    ngOnInit() {
        this.canvas = new StaticCanvas('player', {
            width: WIDTH,
            height: HEIGHT,
        });
        this.resizeCanvas();

        this.canvas.add(
            DIALOG_GROUP,
            SUBTITLE_TEXTBOX,
            STICKER_GROUP,
            DECISION_BUTTON_GROUP1,
            DECISION_BUTTON_GROUP2,
            DECISION_BUTTON_GROUP3,
        );
    }

    advancePlayer(event: MouseEvent) {
        if (this.index + 1 >= this.parsedLines()!.length) {
            console.log('FINITO');
            this.reset();
            return;
        }

        if (
            this.textCommandsService.handleTyping(this.parsedLines()![this.index].parsed) ||
            this.textCommandsService.handleChoice(
                (event.offsetX * WIDTH) / this.canvas.getElement().clientWidth,
                (event.offsetY * HEIGHT) / this.canvas.getElement().clientHeight,
            ) ||
            this.textCommandsService.isInAnimation ||
            this.imageCommandsService.isInAnimation
        )
            return;

        this.index++;

        const line = this.parsedLines()![this.index].parsed;

        console.log(this.parsedLines()![this.index].original);
        console.log(line);

        switch (line.command) {
            case 'background':
                if (line.parameters && line.parameters!['image']) {
                    this.imageCommandsService.handleBackground(this.canvas, line.parameters['image'].toLowerCase(), {
                        x: line.parameters['x'] ? +line.parameters['x'] : undefined,
                        y: line.parameters['y'] ? +line.parameters['y'] : undefined,
                        xScale: line.parameters['xScale'] ? +line.parameters['xScale'] : undefined,
                        yScale: line.parameters['yScale'] ? +line.parameters['yScale'] : undefined,
                        fadetime: line.parameters['fadetime'] ? +line.parameters['fadetime'] * 1000 : undefined,
                        block: line.parameters['block'] === 'true',
                    });
                } else
                    this.imageCommandsService.handleBackgroundClear(this.canvas, {
                        fadetime: line.parameters?.['fadetime'] ? +line.parameters?.['fadetime'] * 1000 : undefined,
                        block: line.parameters?.['block'] === 'true',
                    });

                if (line.parameters?.['fadetime'] && line.parameters?.['block'] === 'true')
                    setTimeout(() => this.click(), +line.parameters?.['fadetime'] * 1000);
                else this.click();
                break;
            case 'dialog':
                this.textCommandsService.handleDialog(line.parameters?.speaker ?? '', line.content);

                break;
            case 'multiline':
                this.textCommandsService.handleMultiline(
                    line.parameters!['name'],
                    line.content!,
                    line.parameters!['delay'] ? +line.parameters!['delay'] * 1000 : 25,
                    line.parameters!['end'] ? true : false,
                );

                break;
            case 'subtitle':
                if (!line.parameters) SUBTITLE_TEXTBOX.set('visible', false);
                else
                    this.textCommandsService.handleSubtitle(
                        line.parameters!['text'],
                        +line.parameters!['x'],
                        +line.parameters!['y'],
                        line.parameters!['alignment'],
                        +line.parameters!['size'],
                        +line.parameters!['width'],
                        +line.parameters!['delay'] * 1000,
                    );

                break;
            case 'sticker':
                if (!line.parameters!['text']) {
                    let duration = line.parameters!['duration'] ?? line.parameters!['fadetime'] ?? 0;
                    this.textCommandsService.handleStickerClear(line.parameters!['id'], +duration * 1000);
                    this.click();
                } else {
                    this.textCommandsService.handleSticker(
                        line.parameters!['id'],
                        line.parameters!['text'],
                        line.parameters!['x'] ? +line.parameters!['x'] : null,
                        line.parameters!['y'] ? +line.parameters!['y'] : null,
                        line.parameters!['alignment'] ?? 'left',
                        +(line.parameters!['fontSize'] ?? 24),
                        +(line.parameters!['delay'] ?? 0.025) * 1000,
                        +(line.parameters!['width'] ?? 0),
                        +(line.parameters!['duration'] ?? 0) * 1000,
                    );
                    if (line.parameters!['block'] === 'false') this.click();
                }

                break;
            case 'stickerclear':
                this.textCommandsService.handleStickerClear();
                this.click();
                break;
            case 'decision':
                this.textCommandsService.handleDecision(
                    line.parameters!['options'].split(';'),
                    line.parameters!['values'].split(';'),
                );

                break;
            case 'predicate':
                if (line.parameters!['references'].includes(';')) {
                    this.textCommandsService.choosenAnswer = null;
                } else if (line.parameters!['references'] !== this.textCommandsService.choosenAnswer) {
                    while (this.parsedLines()![this.index + 1].parsed.command !== 'predicate') {
                        this.index++;
                    }
                }

                this.click();
                break;
            default:
                this.click();
                break;
        }

        this.canvas.renderAll();
    }

    private click() {
        this.canvas.getElement().dispatchEvent(new Event('click', { bubbles: true, cancelable: false }));
    }

    private reset() {
        this.index = 0;
        this.imageCommandsService.loadImages(this.parsedLines()!);
    }

    private resizeCanvas() {
        let containerWidth = this.canvas.getElement().parentElement!.clientWidth;

        if (containerWidth > 1280) containerWidth = 1280;

        this.canvas.setDimensions(
            {
                width: containerWidth,
                height: containerWidth / (16 / 9),
            },
            { cssOnly: true },
        );

        const zoom = (this.canvas.getZoom() * containerWidth) / this.canvas.getWidth();
        // this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
    }
}
