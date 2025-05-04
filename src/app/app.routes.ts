import { Routes } from '@angular/router';
import { StoriesComponent } from './topics/stories/stories.component';
import { OperatorsComponent } from './topics/operators/operators.component';
import { EnemiesComponent } from './topics/enemies/enemies.component';

export const routes: Routes = [
    { path: 'stories', component: StoriesComponent },
    { path: 'operators', component: OperatorsComponent },
    { path: 'enemies', component: EnemiesComponent },
];
