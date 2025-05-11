export type Operator = {
    name: string;
    classDescription: string;
    faction: string;
    appellation: string | null;
    description1: string;
    description2: string;
    rarity: string;
    class: string;
    subClass: string;
    files: { title: string; body: string }[];
    records: { title: string; parts: { intro: string; body: string }[] }[];
    baseSkin: BaseSkin | null;
    elite1Skin: BaseSkin | null;
    elite2Skin: BaseSkin | null;
    skins: Skin[];
    voices: Voice[];
    dubs: string[];
    skinVoices: Voice[] | null;
    skinDubs: { [key: string]: string[] }[] | null;
    modules: Module[] | null;
};

export type BaseSkin = {
    id: string;
    description: string;
    isDynamic: boolean;
};

export type Skin = {
    id: string;
    name: string;
    line1: string;
    line2: string;
    line3: string;
    isDynamic: boolean;
};

export type Voice = {
    id: string;
    name: string;
    body: string;
};

export type Module = {
    name: string;
    icon: string;
    description: string;
    code: string;
};
