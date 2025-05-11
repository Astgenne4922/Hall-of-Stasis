import { httpResource } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnemyDetailsComponent } from './enemy-details/enemy-details.component';

@Component({
    selector: 'app-enemies',
    templateUrl: './enemies.component.html',
    styleUrls: ['./enemies.component.scss'],
    imports: [FormsModule, EnemyDetailsComponent],
})
export class EnemiesComponent {
    ENEMY_URL =
        'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/enemies';

    enemyCodes = httpResource<
        {
            code: string;
            name: string;
            rank: string;
            categories: string[];
            rangeType: string;
            damageTypes: string[];
        }[]
    >({
        url: '/enemies/enemy_codes.json',
    });
    enemyFilters = httpResource<{
        ranks: string[];
        categories: string[];
        ranges: string[];
        damageTypes: string[];
    }>({
        url: '/enemies/enemy_filters.json',
    });

    selectedEnemyCode = signal('');

    selectedRank = signal('');
    selectedCategory = signal('');
    selectedRange = signal('');
    selectedDamageType = signal('');

    filteredEnemies = computed(() => {
        return this.enemyCodes
            .value()
            ?.filter(
                (e) => !this.selectedRank() || this.selectedRank() === e.rank
            )
            .filter(
                (e) =>
                    !this.selectedCategory() ||
                    e.categories.includes(this.selectedCategory())
            )
            .filter(
                (e) =>
                    !this.selectedRange() ||
                    this.selectedRange() === e.rangeType ||
                    ((this.selectedRange() === 'MELEE' ||
                        this.selectedRange() === 'RANGED') &&
                        e.rangeType === 'ALL')
            )
            .filter(
                (e) =>
                    !this.selectedDamageType() ||
                    e.damageTypes.includes(this.selectedDamageType())
            );
    });
}
