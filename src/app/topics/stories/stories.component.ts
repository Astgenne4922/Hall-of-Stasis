import { httpResource } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoryPlayerComponent } from '../../core/story-player/story-player.component';

@Component({
    selector: 'app-stories',
    templateUrl: './stories.component.html',
    styleUrls: ['./stories.component.scss'],
    imports: [FormsModule, StoryPlayerComponent],
})
export class StoriesComponent {
    storyCodes = httpResource<{ code: string; name: string; type: string }[]>({
        url: '/stories/story_codes.json',
    });

    selectedType = signal('MAINLINE');
    selectedStory = signal('');
    selectedChapter = signal('');

    storyObject = httpResource<{
        code: string;
        type: string;
        parts: {
            [key: string]: {
                storyName: string;
                before: string | null;
                after: string | null;
                interlude: string | null;
                dependence: string | null;
            };
        };
    }>(() => `/stories/${this.selectedStory()}/story.json`);

    filteredStories = computed(() =>
        this.storyCodes.value()?.filter((s) => s.type === this.selectedType())
    );
    storyParts = computed(() => {
        const stages: { code: string; name: string; url: string }[] = [];
        Object.entries(this.storyObject.value()?.parts ?? {}).forEach(
            ([code, stage]) => {
                if (stage.before)
                    stages.push({
                        code: `${code} (Before)`,
                        name: `${stage.storyName}`,
                        url: `/stories/${this.selectedStory()}/scripts/${
                            stage.before
                        }.txt`,
                    });
                if (stage.after)
                    stages.push({
                        code: `${code} (After)`,
                        name: `${stage.storyName}`,
                        url: `/stories/${this.selectedStory()}/scripts/${
                            stage.after
                        }.txt`,
                    });
                if (stage.interlude)
                    stages.push({
                        code: `${code}`,
                        name: `${stage.storyName}`,
                        url: `/stories/${this.selectedStory()}/scripts/${
                            stage.interlude
                        }.txt`,
                    });
            }
        );

        return stages;
    });
}
