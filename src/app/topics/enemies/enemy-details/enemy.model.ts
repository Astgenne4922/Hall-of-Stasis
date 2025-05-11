export type Enemy = {
    name: string;
    tag: string;
    description: string;
    rank: 'NORMAL' | 'ELITE' | 'BOSS';
    damageTypes: ('PHYSIC' | 'MAGIC' | 'NO_DAMAGE' | 'HEAL')[];
    rangeType: 'MELEE' | 'RANGED' | 'NONE' | 'ALL';
    lifePenality: number;
    abilities: Ability[];
    categories: string[];
    hp: StatRank;
    atk: StatRank;
    def: StatRank;
    res: StatRank;
    speed: StatRank;
    eRes: StatRank;
    eRst: StatRank;
    aspd: StatRank;
    weight: number;
    statusImmunities: StatusImmunities;
};

export type Ability = {
    text: string;
    textFormat: 'SILENCE' | 'NORMAL' | 'TITLE';
};

export type StatRank =
    | 'SS'
    | 'S+'
    | 'S'
    | 'A+'
    | 'A'
    | 'B+'
    | 'B'
    | 'C'
    | 'D'
    | 'E';

export type StatusImmunities = {
    stun: boolean;
    silence: boolean;
    sleep: boolean;
    frozen: boolean;
    levitate: boolean;
    disarmedCombat: boolean;
    feared: boolean;
};
