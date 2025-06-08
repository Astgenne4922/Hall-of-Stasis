import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, input, OnInit } from '@angular/core';
import { StaticCanvas } from 'fabric';
import { ImageCommandsService } from './services/image-commands/image-commands.service';
import { ScriptParserService } from './services/script-parser.service';
import {
    DECISION_BUTTON_GROUP1,
    DECISION_BUTTON_GROUP2,
    DECISION_BUTTON_GROUP3,
    DIALOG_GROUP,
    STICKER_GROUP,
    SUBTITLE_TEXTBOX,
} from './services/text-commands/text-commands.constants';
import { TextCommandsService } from './services/text-commands/text-commands.service';
import { HEIGHT, WIDTH } from './story-player.constants';
import { IMAGE_OVERLAY } from './services/image-commands/image-commands.constants';

@Component({
    selector: 'hos-story-player',
    templateUrl: './story-player.component.html',
    styleUrls: ['./story-player.component.scss'],
    host: { '(window:resize)': 'resizeCanvas()' },
})
export class StoryPlayerComponent implements OnInit {
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
            backgroundColor: 'black',
        });
        this.resizeCanvas();

        this.canvas.add(
            IMAGE_OVERLAY,
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
            this.textCommandsService.handleTyping(this.canvas, this.parsedLines()![this.index].parsed) ||
            this.textCommandsService.handleChoice(
                this.canvas,
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
                    this.imageCommandsService.clearBackground(this.canvas, {
                        fadetime: line.parameters?.['fadetime'] ? +line.parameters?.['fadetime'] * 1000 : undefined,
                        block: line.parameters?.['block'] === 'true',
                    });

                if (line.parameters?.['fadetime'] && line.parameters?.['block'] === 'true')
                    setTimeout(() => this.click(), +line.parameters?.['fadetime'] * 1000);
                else this.click();
                break;
            case 'backgroundtween':
                if (line.parameters)
                    this.imageCommandsService.handleBackgroundTween(this.canvas, {
                        xFrom: line.parameters['xFrom'] ? +line.parameters['xFrom'] : undefined,
                        yFrom: line.parameters['yFrom'] ? +line.parameters['yFrom'] : undefined,
                        xTo: line.parameters['xTo'] ? +line.parameters['xTo'] : undefined,
                        yTo: line.parameters['yTo'] ? +line.parameters['yTo'] : undefined,
                        xScaleFrom: line.parameters['xScaleFrom'] ? +line.parameters['xScaleFrom'] : undefined,
                        yScaleFrom: line.parameters['yScaleFrom'] ? +line.parameters['yScaleFrom'] : undefined,
                        xScaleTo: line.parameters['xScaleTo'] ? +line.parameters['xScaleTo'] : undefined,
                        yScaleTo: line.parameters['yScaleTo'] ? +line.parameters['yScaleTo'] : undefined,
                        duration: line.parameters['duration'] ? +line.parameters['duration'] * 1000 : undefined,
                        block: line.parameters?.['block'] === 'true',
                        ease: undefined,
                    });

                if (line.parameters?.['duration'] && line.parameters?.['block'] === 'true')
                    setTimeout(() => this.click(), +line.parameters?.['duration'] * 1000);
                else this.click();
                break;
            case 'image':
                if (line.parameters && line.parameters!['image']) {
                    this.imageCommandsService.handleImage(this.canvas, line.parameters['image'].toLowerCase(), {
                        x: line.parameters['x'] ? +line.parameters['x'] : undefined,
                        y: line.parameters['y'] ? +line.parameters['y'] : undefined,
                        xScale: line.parameters['xScale'] ? +line.parameters['xScale'] : undefined,
                        yScale: line.parameters['yScale'] ? +line.parameters['yScale'] : undefined,
                        fadetime: line.parameters['fadetime'] ? +line.parameters['fadetime'] * 1000 : undefined,
                        block: line.parameters['block'] === 'true',
                    });
                } else
                    this.imageCommandsService.clearImage(this.canvas, {
                        fadetime: line.parameters?.['fadetime'] ? +line.parameters?.['fadetime'] * 1000 : undefined,
                        block: line.parameters?.['block'] === 'true',
                    });

                if (line.parameters?.['fadetime'] && line.parameters?.['block'] === 'true')
                    setTimeout(() => this.click(), +line.parameters?.['fadetime'] * 1000);
                else this.click();
                break;
            case 'imagetween':
                if (line.parameters)
                    this.imageCommandsService.handleImageTween(this.canvas, {
                        xFrom: line.parameters['xFrom'] ? +line.parameters['xFrom'] : undefined,
                        yFrom: line.parameters['yFrom'] ? +line.parameters['yFrom'] : undefined,
                        xTo: line.parameters['xTo'] ? +line.parameters['xTo'] : undefined,
                        yTo: line.parameters['yTo'] ? +line.parameters['yTo'] : undefined,
                        xScaleFrom: line.parameters['xScaleFrom'] ? +line.parameters['xScaleFrom'] : undefined,
                        yScaleFrom: line.parameters['yScaleFrom'] ? +line.parameters['yScaleFrom'] : undefined,
                        xScaleTo: line.parameters['xScaleTo'] ? +line.parameters['xScaleTo'] : undefined,
                        yScaleTo: line.parameters['yScaleTo'] ? +line.parameters['yScaleTo'] : undefined,
                        duration: line.parameters['duration'] ? +line.parameters['duration'] * 1000 : undefined,
                        block: line.parameters?.['block'] === 'true',
                        ease: undefined,
                    });

                if (line.parameters?.['duration'] && line.parameters?.['block'] === 'true')
                    setTimeout(() => this.click(), +line.parameters?.['duration'] * 1000);
                else this.click();
                break;
            case 'dialog':
                if (line.content)
                    this.textCommandsService.handleDialog(this.canvas, line.content, line.parameters?.['name']);
                else {
                    this.textCommandsService.clearDialog(this.canvas, {
                        fadetime: line.parameters?.['fadetime'] ? +line.parameters?.['fadetime'] * 1000 : undefined,
                        block: line.parameters?.['block'] === 'true',
                    });
                    if (line.parameters?.['fadetime'] && line.parameters?.['block'] === 'true')
                        setTimeout(() => this.click(), +line.parameters?.['fadetime'] * 1000);
                    else this.click();
                }
                break;
            case 'multiline':
                this.textCommandsService.handleMultiline(this.canvas, line.parameters!['name'], line.content!, {
                    delay: line.parameters!['delay'] ? +line.parameters!['delay'] * 1000 : undefined,
                    end: line.parameters!['end'] ? true : false,
                });

                break;
            case 'subtitle':
                if (!line.parameters) {
                    this.textCommandsService.clearSubtitle();
                    this.click();
                } else
                    this.textCommandsService.handleSubtitle(this.canvas, line.parameters!['text'], {
                        x: +line.parameters!['x'],
                        y: +line.parameters!['y'],
                        textAlign: line.parameters!['alignment'],
                        fontSize: +line.parameters!['size'],
                        width: +line.parameters!['width'],
                        delay: +line.parameters!['delay'] * 1000,
                    });

                break;
            case 'sticker':
                if (!line.parameters!['text']) {
                    let duration = line.parameters!['duration'] ?? line.parameters!['fadetime'] ?? undefined;
                    this.textCommandsService.clearSticker(this.canvas, {
                        id: line.parameters!['id'],
                        fadetime: duration ? +duration * 1000 : undefined,
                        block: line.parameters!['block'] === 'true',
                    });
                    if (duration && line.parameters?.['block'] === 'true')
                        setTimeout(() => this.click(), +duration * 1000);
                    else this.click();
                } else {
                    this.textCommandsService.handleSticker(
                        this.canvas,
                        line.parameters!['id'],
                        line.parameters!['text'],
                        {
                            x: line.parameters!['x'] ? +line.parameters!['x'] : undefined,
                            y: line.parameters!['y'] ? +line.parameters!['y'] : undefined,
                            textAlign: line.parameters!['alignment'],
                            fontSize: line.parameters!['fontSize'] ? +line.parameters!['fontSize'] : undefined,
                            delay: line.parameters!['delay'] ? +line.parameters!['delay'] * 1000 : undefined,
                            width: line.parameters!['width'] ? +line.parameters!['width'] : undefined,
                            fadetime: line.parameters!['duration'] ? +line.parameters!['duration'] * 1000 : undefined,
                            block: line.parameters!['block'] === 'true',
                        },
                    );
                }

                break;
            case 'stickerclear':
                this.textCommandsService.clearSticker(this.canvas);
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
