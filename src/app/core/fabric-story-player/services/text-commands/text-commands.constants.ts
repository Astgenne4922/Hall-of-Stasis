import { Gradient, Group, Rect, Textbox } from 'fabric';
import { HEIGHT, WIDTH } from '../../story-player.constants';

export const DECISION_BUTTON_GROUP1 = new Group(
    [
        new Group(
            [
                new Rect({
                    fill: '#313131',
                    stroke: 'white',
                    strokeWidth: 3,
                    width: 650,
                    height: 50,
                }),
                new Textbox('', {
                    fontSize: 22,
                    fontFamily: 'Tahoma, sans-serif',
                    fill: 'white',
                    textAlign: 'center',
                    width: 650,
                    top: 11,
                }),
            ],
            { left: 315, top: HEIGHT / 2 - 25 },
        ),
    ],
    { visible: false },
);
export const DECISION_BUTTON_GROUP2 = new Group(
    [
        new Group(
            [
                new Rect({
                    fill: '#313131',
                    stroke: 'white',
                    strokeWidth: 3,
                    width: 650,
                    height: 50,
                }),
                new Textbox('', {
                    fontSize: 22,
                    fontFamily: 'Tahoma, sans-serif',
                    fill: 'white',
                    textAlign: 'center',
                    width: 650,
                    top: 11,
                }),
            ],
            { left: 315, top: HEIGHT / 2 - 60 },
        ),
        new Group(
            [
                new Rect({
                    fill: '#313131',
                    stroke: 'white',
                    strokeWidth: 3,
                    width: 650,
                    height: 50,
                }),
                new Textbox('', {
                    fontSize: 22,
                    fontFamily: 'Tahoma, sans-serif',
                    fill: 'white',
                    textAlign: 'center',
                    width: 650,
                    top: 11,
                }),
            ],
            { left: 315, top: HEIGHT / 2 + 10 },
        ),
    ],
    { visible: false },
);
export const DECISION_BUTTON_GROUP3 = new Group(
    [
        new Group(
            [
                new Rect({
                    fill: '#313131',
                    stroke: 'white',
                    strokeWidth: 3,
                    width: 650,
                    height: 50,
                }),
                new Textbox('', {
                    fontSize: 22,
                    fontFamily: 'Tahoma, sans-serif',
                    fill: 'white',
                    textAlign: 'center',
                    width: 650,
                    top: 11,
                }),
            ],
            { left: 315, top: HEIGHT / 2 - 100 },
        ),
        new Group(
            [
                new Rect({
                    fill: '#313131',
                    stroke: 'white',
                    strokeWidth: 3,
                    width: 650,
                    height: 50,
                }),
                new Textbox('', {
                    fontSize: 22,
                    fontFamily: 'Tahoma, sans-serif',
                    fill: 'white',
                    textAlign: 'center',
                    width: 650,
                    top: 11,
                }),
            ],
            { left: 315, top: HEIGHT / 2 - 25 },
        ),
        new Group(
            [
                new Rect({
                    fill: '#313131',
                    stroke: 'white',
                    strokeWidth: 3,
                    width: 650,
                    height: 50,
                }),
                new Textbox('', {
                    fontSize: 22,
                    fontFamily: 'Tahoma, sans-serif',
                    fill: 'white',
                    textAlign: 'center',
                    width: 650,
                    top: 11,
                }),
            ],
            { left: 315, top: HEIGHT / 2 + 50 },
        ),
    ],
    { visible: false },
);

export const DIALOG_TOP_GRADIENT = new Rect({
    left: 0,
    top: 0,
    width: WIDTH,
    height: 100,
    fill: new Gradient<'linear'>({
        coords: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 100,
        },
        colorStops: [
            { offset: 0, color: 'black', opacity: 0.7 },
            { offset: 1, color: 'black', opacity: 0 },
        ],
    }),
});
export const DIALOG_BOTTOM_GRADIENT = new Rect({
    left: 0,
    top: HEIGHT - 200,
    width: WIDTH,
    height: 200,
    fill: new Gradient<'linear'>({
        coords: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 200,
        },
        colorStops: [
            { offset: 0, color: 'black', opacity: 0 },
            { offset: 0.7, color: 'black', opacity: 1 },
            { offset: 1, color: 'black', opacity: 1 },
        ],
    }),
});
export const SPEAKER_TEXTBOX = new Textbox('', {
    fontSize: 22,
    fontFamily: 'Tahoma, sans-serif',
    fill: '#959595',
    textAlign: 'right',
    width: 330,
    left: 0,
    top: HEIGHT - 100,
});
export const DIALOG_TEXTBOX = new Textbox('', {
    fontSize: 20,
    fontFamily: 'Tahoma, sans-serif',
    fill: 'white',
    width: WIDTH - 390,
    left: 380,
    top: HEIGHT - 100,
});
export const DIALOG_GROUP = new Group([DIALOG_TOP_GRADIENT, DIALOG_BOTTOM_GRADIENT, SPEAKER_TEXTBOX, DIALOG_TEXTBOX], {
    visible: false,
});

export const SUBTITLE_TEXTBOX = new Textbox('', {
    fontFamily: 'Tahoma, sans-serif',
    fill: 'white',
    visible: false,
});

export const STICKER_GROUP = new Group([], { objectCaching: false });
