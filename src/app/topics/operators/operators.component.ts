import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { OperatorDetailsComponent } from './operator-details/operator-details.component';

@Component({
    selector: 'app-operators',
    templateUrl: './operators.component.html',
    styleUrls: ['./operators.component.scss'],
    imports: [FormsModule, OperatorDetailsComponent],
})
export class OperatorsComponent {
    AVATAR_URL =
        'https://raw.githubusercontent.com/akgcc/arkdata/refs/heads/main/assets/torappu/dynamicassets/arts/charavatars';

    operatorCodes = httpResource<
        {
            code: string;
            name: string;
            rarity: string;
            class: string;
            subClass: string;
            faction: string;
        }[]
    >({
        url: '/characters/character_codes.json',
    });
    characterFilters = httpResource<{
        rarities: string[];
        classes: string[];
        subClasses: string[];
        factions: string[];
    }>({
        url: '/characters/character_filters.json',
    });

    selectedOpCode = signal('');

    selectedRarity = signal('');
    selectedClass = signal('');
    selectedSubClass = signal('');
    selectedFaction = signal('');

    filteredCharacters = computed(() => {
        return this.operatorCodes
            .value()
            ?.filter(
                (e) =>
                    !this.selectedRarity() || this.selectedRarity() === e.rarity
            )
            .filter(
                (e) => !this.selectedClass() || this.selectedClass() === e.class
            )
            .filter(
                (e) =>
                    !this.selectedSubClass() ||
                    this.selectedSubClass() === e.subClass
            )
            .filter(
                (e) =>
                    !this.selectedFaction() ||
                    this.selectedFaction() === e.faction
            );
    });
}
