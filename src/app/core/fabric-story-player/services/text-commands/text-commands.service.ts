import { inject, Injectable } from '@angular/core';
import {
    SPEAKER_TEXTBOX,
    DIALOG_GROUP,
    DIALOG_TEXTBOX,
    SUBTITLE_TEXTBOX,
    DECISION_BUTTON_GROUP1,
    DECISION_BUTTON_GROUP2,
    DECISION_BUTTON_GROUP3,
    STICKER_GROUP,
} from './text-commands.constants';
import { ScriptParserService } from '../script-parser.service';
import { Group, Point, Textbox } from 'fabric';
import { dialogCommand, genericCommand } from '../command.model';

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

    handleDialog(speaker: string, text: string | null) {
        this.multiline = null;
        this.hasMultilineEnded = false;

        if (speaker) SPEAKER_TEXTBOX.set('text', speaker);
        else SPEAKER_TEXTBOX.set('text', '');

        if (text) {
            DIALOG_GROUP.set('visible', true);

            const parsedText = this.parserService.parseRichText(text!);
            DIALOG_TEXTBOX.set('styles', parsedText.styles);

            let letterIdx = 0;
            this.typewriterInterval = setInterval(() => {
                DIALOG_TEXTBOX.set('text', parsedText.text.slice(0, letterIdx));
                DIALOG_TEXTBOX.canvas?.renderAll();

                letterIdx++;
                if (letterIdx > parsedText.text.length) {
                    clearInterval(this.typewriterInterval!);
                    this.typewriterInterval = null;
                }
            }, 25);
        } else {
            DIALOG_GROUP.set('visible', false);
            DIALOG_TEXTBOX.set('text', '');
        }
    }

    handleMultiline(name: string, text: string, delay: number, end: boolean) {
        SPEAKER_TEXTBOX.set('text', name);

        if (!this.multiline || this.hasMultilineEnded) this.multiline = [];
        this.multiline.push(text);

        this.hasMultilineEnded = end;

        let letterIdx = 0;
        this.typewriterInterval = setInterval(() => {
            DIALOG_TEXTBOX.set({
                ...this.parserService.parseRichText(this.multiline!.slice(0, -1).join('') + text.slice(0, letterIdx)),
            });
            DIALOG_TEXTBOX.canvas?.renderAll();

            letterIdx++;
            if (letterIdx > this.parserService.parseRichText(text).text.length) {
                clearInterval(this.typewriterInterval!);
                this.typewriterInterval = null;
            }
        }, delay);

        DIALOG_GROUP.set('visible', true);
    }

    handleSubtitle(
        text: string,
        x: number,
        y: number,
        textAlign: string,
        fontSize: number,
        width: number,
        delay: number,
    ) {
        const parsedText = this.parserService.parseRichText(text);

        SUBTITLE_TEXTBOX.set({
            text: '',
            left: x,
            top: y,
            textAlign: textAlign,
            fontSize: fontSize,
            width: width,
            styles: parsedText.styles,
        });

        let letterIdx = 0;
        this.typewriterInterval = setInterval(() => {
            SUBTITLE_TEXTBOX.set('text', parsedText.text.slice(0, letterIdx));
            SUBTITLE_TEXTBOX.canvas?.renderAll();

            letterIdx++;
            if (letterIdx > parsedText.text.length) {
                clearInterval(this.typewriterInterval!);
                this.typewriterInterval = null;
            }
        }, delay);
        SUBTITLE_TEXTBOX.set('visible', true);
    }

    handleSticker(
        id: string,
        text: string,
        x: number | null,
        y: number | null,
        textAlign: string,
        fontSize: number,
        delay: number,
        width: number,
        duration: number,
    ) {
        if (!this.stickers[id]) {
            this.stickers[id] = {
                box: new Textbox('', {
                    fontFamily: 'Tahoma, sans-serif',
                    fill: 'white',
                    textAlign: textAlign,
                    fontSize: fontSize,
                    left: x!,
                    top: y!,
                    width: width,
                    opacity: duration ? 0 : 1,
                }),
                text: [],
            };
            STICKER_GROUP.add(this.stickers[id].box);
        } else {
            if (x && y) {
                this.stickers[id].box.set({
                    text: '',
                    textAlign: textAlign,
                    fontSize: fontSize,
                    left: x,
                    top: y,
                    width: width,
                    opacity: duration ? 0 : 1,
                });
                this.stickers[id].text = [];
            }
        }

        this.stickers[id].text.push(text);

        let letterIdx = 0;
        this.typewriterInterval = setInterval(() => {
            this.stickers[id].box.set({
                ...this.parserService.parseRichText(
                    this.stickers[id].text.slice(0, -1).join('') + text.slice(0, letterIdx),
                ),
            });
            STICKER_GROUP.canvas?.renderAll();

            letterIdx++;
            if (letterIdx > this.parserService.parseRichText(text).text.length) {
                clearInterval(this.typewriterInterval!);
                this.typewriterInterval = null;
            }
        }, delay);

        if (duration)
            this.stickers[id].box.animate(
                { opacity: 1 },
                {
                    duration: duration,
                    onChange: () => STICKER_GROUP.canvas?.renderAll(),
                },
            );
    }
    handleStickerClear(id?: string, duration?: number) {
        if (id) {
            if (duration) {
                this.isInAnimation = true;
                this.stickers[id].box.animate(
                    { opacity: 0 },
                    {
                        duration: duration,
                        onChange: () => STICKER_GROUP.canvas?.renderAll(),
                        onComplete: () => {
                            STICKER_GROUP.remove(this.stickers[id].box);
                            delete this.stickers[id];
                            this.isInAnimation = false;
                        },
                    },
                );
            } else {
                STICKER_GROUP.remove(this.stickers[id].box);
                delete this.stickers[id];
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

    handleChoice(mouseX: number, mouseY: number) {
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
                    buttons.canvas?.renderAll();
                }
            }

            if (this.dialogChoices) return true;
        }

        return false;
    }

    handleTyping(command: genericCommand | dialogCommand) {
        if (!this.typewriterInterval) return false;

        clearInterval(this.typewriterInterval);
        this.typewriterInterval = null;
        if (this.multiline)
            DIALOG_TEXTBOX.set({
                ...this.parserService.parseRichText(this.multiline.join('')),
            });
        else if (SUBTITLE_TEXTBOX.visible)
            SUBTITLE_TEXTBOX.set({
                ...this.parserService.parseRichText((command as genericCommand).parameters!['text']),
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

        DIALOG_TEXTBOX.canvas?.renderAll();

        return true;
    }
}
