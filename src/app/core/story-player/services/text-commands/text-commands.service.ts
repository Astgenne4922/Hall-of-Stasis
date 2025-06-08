import { inject, Injectable } from '@angular/core';
import { Group, Point, StaticCanvas, Textbox } from 'fabric';
import { Command } from '../command.model';
import { fadein, fadeout } from '../common.animation';
import { ScriptParserService } from '../script-parser.service';
import {
    DECISION_BUTTON_GROUP1,
    DECISION_BUTTON_GROUP2,
    DECISION_BUTTON_GROUP3,
    DIALOG_GROUP,
    DIALOG_TEXTBOX,
    SPEAKER_TEXTBOX,
    STICKER_GROUP,
    SUBTITLE_TEXTBOX,
} from './text-commands.constants';

@Injectable({
    providedIn: 'root',
})
export class TextCommandsService {
    private parserService = inject(ScriptParserService);

    multiline: string[] | null = null;
    hasMultilineEnded: boolean = false;

    dialogChoices: { [key: string]: string } | null = null;
    choosenAnswer: string | null = null;

    stickers: { [key: string]: { box: Textbox; text: string[] } } = {};

    isInAnimation = false;

    typewriterInterval: ReturnType<typeof setInterval> | null = null;

    handleDialog(canvas: StaticCanvas, text: string, speaker?: string) {
        this.multiline = null;
        this.hasMultilineEnded = false;

        SPEAKER_TEXTBOX.set('text', speaker ?? '');

        DIALOG_GROUP.set('visible', true);

        this.createTypewriterEffect(canvas, DIALOG_TEXTBOX, text, { delay: 25 });
    }
    clearDialog(canvas: StaticCanvas, options?: { fadetime?: number; block?: boolean }) {
        if (options?.fadetime) {
            if (options?.block) this.isInAnimation = true;
            fadeout(canvas, DIALOG_GROUP, options.fadetime, () => {
                DIALOG_GROUP.set('visible', false);
                canvas.renderAll();
                DIALOG_GROUP.set('opacity', 1);
                DIALOG_TEXTBOX.set('text', '');
                if (options?.block) this.isInAnimation = false;
            });
        } else {
            DIALOG_GROUP.set('visible', false);
            DIALOG_TEXTBOX.set('text', '');
        }
    }

    handleMultiline(canvas: StaticCanvas, name: string, text: string, options?: { delay?: number; end: boolean }) {
        SPEAKER_TEXTBOX.set('text', name);

        if (!this.multiline || this.hasMultilineEnded) this.multiline = [];
        this.multiline.push(text);

        this.hasMultilineEnded = options?.end ?? false;

        this.createTypewriterEffect(canvas, DIALOG_TEXTBOX, text, {
            multi: this.multiline,
            delay: options?.delay ?? 25,
        });

        DIALOG_GROUP.set('visible', true);
    }

    handleSubtitle(
        canvas: StaticCanvas,
        text: string,
        options: { x: number; y: number; textAlign: string; fontSize: number; width: number; delay: number },
    ) {
        SUBTITLE_TEXTBOX.set({
            text: '',
            left: options.x,
            top: options.y,
            textAlign: options.textAlign,
            fontSize: options.fontSize,
            width: options.width,
        });

        this.createTypewriterEffect(canvas, SUBTITLE_TEXTBOX, text, { delay: options.delay });

        SUBTITLE_TEXTBOX.set('visible', true);
    }
    clearSubtitle() {
        SUBTITLE_TEXTBOX.set('visible', false);
    }

    handleSticker(
        canvas: StaticCanvas,
        id: string,
        text: string,
        options?: {
            x?: number;
            y?: number;
            textAlign?: string;
            fontSize?: number;
            width?: number;
            delay?: number;
            fadetime?: number;
            block: boolean;
        },
    ) {
        if (!this.stickers[id]) {
            this.stickers[id] = {
                box: new Textbox('', {
                    fontFamily: 'Tahoma, sans-serif',
                    fill: 'white',
                    textAlign: options?.textAlign ?? 'left',
                    fontSize: options?.fontSize ?? 24,
                    left: options?.x!,
                    top: options?.y!,
                    width: options?.width,
                    opacity: options?.fadetime ? 0 : 1,
                }),
                text: [],
            };
            STICKER_GROUP.add(this.stickers[id].box);
        } else {
            if (options?.x && options.y) {
                this.stickers[id].box.set({
                    text: '',
                    textAlign: options.textAlign ?? 'left',
                    fontSize: options.fontSize ?? 24,
                    left: options.x,
                    top: options.y,
                    width: options.width,
                    opacity: options.fadetime ? 0 : 1,
                });
                this.stickers[id].text = [];
            }
        }

        this.stickers[id].text.push(text);

        this.createTypewriterEffect(canvas, this.stickers[id].box, text, {
            multi: this.stickers[id].text,
            delay: options?.delay ?? 25,
        });

        if (options?.fadetime) {
            if (options.block) this.isInAnimation = true;
            fadein(canvas, this.stickers[id].box, options.fadetime, () => {
                if (options.block) this.isInAnimation = false;
            });
        }
    }
    clearSticker(canvas: StaticCanvas, options?: { id?: string; fadetime?: number; block: boolean }) {
        if (options?.id) {
            if (options.fadetime) {
                if (options.block) this.isInAnimation = true;
                fadeout(canvas, this.stickers[options.id].box, options.fadetime, () => {
                    STICKER_GROUP.remove(this.stickers[options.id!].box);
                    delete this.stickers[options.id!];
                    if (options?.block) this.isInAnimation = false;
                });
            } else {
                STICKER_GROUP.remove(this.stickers[options.id].box);
                delete this.stickers[options.id];
            }
        } else {
            for (const key in this.stickers) STICKER_GROUP.remove(this.stickers[key].box);
            this.stickers = {};
        }
    }

    handleDecision(options: string[], values: string[]) {
        let buttons;
        if (values.length === 1) buttons = DECISION_BUTTON_GROUP1;
        else if (values.length === 2) buttons = DECISION_BUTTON_GROUP2;
        else buttons = DECISION_BUTTON_GROUP3;

        this.dialogChoices = {};
        for (let i = 0; i < options.length; i++) {
            this.dialogChoices[values[i]] = options[i];

            (buttons.item(i) as Group).item(1).set('text', options[i]);
        }
        buttons.set('visible', true);
    }

    handleChoice(canvas: StaticCanvas, mouseX: number, mouseY: number) {
        if (this.dialogChoices) {
            let buttons;
            const values = Object.keys(this.dialogChoices);
            if (values.length === 1) buttons = DECISION_BUTTON_GROUP1;
            else if (values.length === 2) buttons = DECISION_BUTTON_GROUP2;
            else buttons = DECISION_BUTTON_GROUP3;

            for (let i = 0; i < values.length; i++) {
                if ((buttons.item(i) as Group).item(1).containsPoint(new Point(mouseX, mouseY))) {
                    this.dialogChoices = null;
                    this.choosenAnswer = values[i];

                    buttons.set('visible', false);
                    canvas.renderAll();
                }
            }

            if (this.dialogChoices) return true;
        }

        return false;
    }

    handleTyping(canvas: StaticCanvas, command: Command) {
        if (!this.typewriterInterval) return false;

        clearInterval(this.typewriterInterval);
        this.typewriterInterval = null;
        if (this.multiline)
            DIALOG_TEXTBOX.set({
                ...this.parserService.parseRichText(this.multiline.join('')),
            });
        else if (SUBTITLE_TEXTBOX.visible)
            SUBTITLE_TEXTBOX.set({
                ...this.parserService.parseRichText(command.parameters!['text']),
            });
        else if (command.command === 'sticker') {
            this.stickers[command.parameters!['id']].box.dispose();
            this.stickers[command.parameters!['id']].box.set({
                opacity: 1,
                ...this.parserService.parseRichText(this.stickers[command.parameters!['id']].text.join('')),
            });
        } else
            DIALOG_TEXTBOX.set({
                ...this.parserService.parseRichText(command.content!),
            });

        canvas.renderAll();

        return true;
    }

    private createTypewriterEffect(
        canvas: StaticCanvas,
        textbox: Textbox,
        text: string,
        options: {
            multi?: string[];
            delay: number;
        },
    ) {
        let letterIdx = 0;
        this.typewriterInterval = setInterval(() => {
            textbox.set({
                ...this.parserService.parseRichText(
                    (options.multi ?? []).slice(0, -1).join('') + text.slice(0, letterIdx),
                ),
            });
            canvas.renderAll();

            letterIdx++;
            if (letterIdx > this.parserService.parseRichText(text).text.length) {
                clearInterval(this.typewriterInterval!);
                this.typewriterInterval = null;
            }
        }, options.delay);
    }
}
