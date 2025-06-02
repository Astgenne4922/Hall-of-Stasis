export type genericCommand = {
    command: string;
    parameters: {
        [key: string]: string;
    } | null;
    content: string | null;
};

export type dialogCommand = {
    command: 'dialog';
    parameters: {
        speaker: string | null;
    };
    content: string;
};
