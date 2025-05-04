import { httpResource } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';

const BASE_URL = '/json/characters';

@Injectable({
    providedIn: 'root',
})
export class OperatorsService {
    character_table = httpResource<{
        [key: string]: { name: string; [key: string]: any };
    }>({ url: `${BASE_URL}/character_table.json` });
    handbook_info_table = httpResource<{
        handbookDict: { [key: string]: any };
    }>({ url: `${BASE_URL}/handbook_info_table.json` });
    uniequip_table = httpResource<{
        equipDict: { [key: string]: any };
    }>({ url: `${BASE_URL}/uniequip_table.json` });
    charword_table = httpResource<{
        charWords: { [key: string]: any };
    }>({ url: `${BASE_URL}/charword_table.json` });

    allOps = computed(() => {
        if (!this.character_table.hasValue()) {
            return undefined;
        }
        return Object.keys(this.character_table.value()).reduce(
            (acc: string[][], e) => {
                if (e.startsWith('char_'))
                    acc.push([e, this.character_table.value()![e].name]);
                return acc;
            },
            []
        );
    });

    public getOperator(code: string) {
        return this.character_table.value()?.[code];
    }

    public getOperatorFiles(code: string) {
        return this.handbook_info_table.value()?.handbookDict[code];
    }

    public getModules(code: string) {
        if (!this.uniequip_table.hasValue() || code.length === 0)
            return undefined;
        return Object.keys(this.uniequip_table.value()!.equipDict)
            .filter((e) => e.endsWith(code.split('_').at(-1)!))
            .reduce((acc: { [key: string]: any }[], e) => {
                acc.push(this.uniequip_table.value()!.equipDict[e]);
                return acc;
            }, []);
    }

    public getVoices(code: string) {
        if (!this.charword_table.hasValue() || code.length === 0)
            return undefined;
        return Object.keys(this.charword_table.value()!.charWords)
            .filter((e) => e.startsWith(code))
            .reduce((acc: { [key: string]: any }[], e) => {
                acc.push(this.charword_table.value()!.charWords[e]);
                return acc;
            }, []);
    }
}
