import { Injectable } from '@angular/core';

const BG_URL =
    'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/avg/backgrounds';
const CHAR_URL =
    'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/avg/characters';

@Injectable({
    providedIn: 'root',
})
export class StoryPlayerService {
    drawBackground(command: any, ctx: CanvasRenderingContext2D) {
        const img = new Image();
        img.src = `${BG_URL}/${command.data.image}.png`;
        img.onload = () => {
            ctx.drawImage(
                img,
                -command.data.x -
                    (1024 * (command.data.xScale + 0.2) - 1024) / 2,
                -command.data.y - (576 * (command.data.yScale + 0.2) - 576) / 2,
                1024 * (command.data.xScale + 0.2),
                576 * (command.data.yScale + 0.2),
            );
        };
    }

    drawDialogBackground(ctx: CanvasRenderingContext2D) {
        const grad = ctx.createLinearGradient(
            1024 / 2,
            576 - 200,
            1024 / 2,
            576,
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 1)');

        const grad2 = ctx.createLinearGradient(1024 / 2, 0, 1024 / 2, 100);
        grad2.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 576 - 200, 1024, 200);
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, 1024, 100);
    }
    typeDialog(command: any, ctx: CanvasRenderingContext2D) {
        this.drawDialogBackground(ctx);

        if (command.data.speaker) {
            ctx.font = '20px Arial, Helvetica, sans-serif';
            ctx.fillStyle = '#7B7B7B';
            ctx.textAlign = 'right';
            ctx.fillText(command.data.speaker, 260, 576 - 55);
        }

        ctx.font = '18px Arial, Helvetica, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        const lines = this.wrapText(command.data.text, ctx);
        const metrics = ctx.measureText(command.data.text);
        const lineHeight =
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

        // if (!this.isTyping) {
        //     const typewriter = (lineIdx = 0, i = 0) => {
        //         const cursorX =
        //             ctx.measureText(lines[lineIdx].slice(0, i + 1)).width -
        //             ctx.measureText(lines[lineIdx][i]).width;
        //         ctx.fillText(
        //             lines[lineIdx][i],
        //             300 + cursorX,
        //             576 - 55 + lineHeight * lineIdx,
        //         );
        //         if (this.isTyping) {
        //             if (i + 1 < lines[lineIdx].length)
        //                 setTimeout(() => typewriter(lineIdx, i + 1), 25);
        //             else if (lineIdx + 1 < lines.length)
        //                 setTimeout(() => typewriter(lineIdx + 1, 0), 25);
        //             else this.isTyping = false;
        //         }
        //     };
        //     this.isTyping = true;
        //     typewriter();
        // } else {
        //     this.isTyping = false;
        //     for (let i = 0; i < lines.length; i++) {
        //         ctx.fillText(lines[i], 300, 576 - 55 + lineHeight * i);
        //     }
        // }
    }
    drawDialog(command: any, ctx: CanvasRenderingContext2D) {
        this.drawDialogBackground(ctx);

        if (command.data.speaker) {
            ctx.font = '20px Arial, Helvetica, sans-serif';
            ctx.fillStyle = '#7B7B7B';
            ctx.textAlign = 'right';
            ctx.fillText(command.data.speaker, 260, 576 - 55);
        }

        ctx.font = '18px Arial, Helvetica, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        const lines = this.wrapText(command.data.text, ctx);
        const metrics = ctx.measureText(command.data.text);
        const lineHeight =
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 300, 576 - 55 + lineHeight * i);
        }
    }

    drawCharacters(command: any, ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, 1024, 576);

        if (command.data.name) {
            if (command.data.name2) {
                const left = new Image();
                if (command.data.name.split('_').length > 3)
                    left.src = `${CHAR_URL}/${command.data.name.replace(
                        /#\d$/,
                        '',
                    )}/${command.data.name.replace(/\d#/, '')}.png`;
                else left.src = `${CHAR_URL}/${command.data.name}.png`;
                left.onload = () => {
                    ctx.filter =
                        command.data.focus === 2 ? 'brightness(50%)' : 'none';
                    ctx.drawImage(left, -35, 0, 774, 774);
                    ctx.strokeRect(-35, 0, 774, 774);
                };

                const right = new Image();
                if (command.data.name2.split('_').length > 3)
                    right.src = `${CHAR_URL}/${command.data.name2.replace(
                        /#\d$/,
                        '',
                    )}/${command.data.name2.replace(/\d#/, '')}.png`;
                else right.src = `${CHAR_URL}/${command.data.name2}.png`;
                right.onload = () => {
                    ctx.filter =
                        command.data.focus === 1 ? 'brightness(50%)' : 'none';
                    ctx.drawImage(right, 235, -25, 874, 874);
                    ctx.strokeRect(235, -25, 874, 874);
                };
            } else {
                const img = new Image();
                if (command.data.name.split('_').length > 3)
                    img.src = `${CHAR_URL}/${command.data.name.replace(
                        /#\d$/,
                        '',
                    )}/${command.data.name.replace(/\d#/, '')}.png`;
                else img.src = `${CHAR_URL}/${command.data.name}.png`;
                img.onload = () => {
                    ctx.filter = 'none';
                    ctx.drawImage(img, 100, 30, 824, 824);
                    ctx.strokeRect(100, 30, 824, 824);
                };
            }
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

        // dialogo con nome
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

        // dialogo senza nome
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
