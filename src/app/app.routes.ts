import { Routes } from '@angular/router';
import { GiveawayViewComponent } from './containers/giveaway-view/giveaway-view.component'
import { WheelSettingsViewComponent } from './containers/wheel-settings-view/wheel-settings-view.component';
import { ItemSettingsViewComponent } from './containers/item-settings-view/item-settings-view.component';
import { VisualSettingsViewComponent } from './containers/visual-settings-view/visual-settings-view.component';
import { TwitchSettingsViewComponent } from './containers/twitch-settings-view/twitch-settings-view.component';
import { WinnerSettingsViewComponent } from './containers/winner-settings-view/winner-settings-view.component';
import { CountdownSettingsViewComponent } from './containers/countdown-settings-view/countdown-settings-view.component';
import { GiveawaySettingsViewComponent } from './containers/giveaway-settings-view/giveaway-settings-view.component';
import { StreamerbotSettingsViewComponent } from './containers/streamerbot-settings-view/streamerbot-settings-view.component';
import { AudioSettingsViewComponent } from './containers/audio-settings-view/audio-settings-view.component';
import { StaticWheelViewComponent } from './containers/static-wheel-view/static-wheel-view.component';

export const routes: Routes = [
    { path: '', redirectTo: 'giveaway', pathMatch: 'full' },
    { path: 'giveaway', component: GiveawayViewComponent, pathMatch: 'full' },
    { path: 'static', component: StaticWheelViewComponent, pathMatch: 'full' },
    { path: 'wheel-settings', component: WheelSettingsViewComponent, pathMatch: 'full' },
    { path: 'item-settings', component: ItemSettingsViewComponent, pathMatch: 'full' },
    { path: 'winner-settings', component: WinnerSettingsViewComponent, pathMatch: 'full' },
    { path: 'visual-settings', component: VisualSettingsViewComponent, pathMatch: 'full' },
    { path: 'twitch-settings', component: TwitchSettingsViewComponent, pathMatch: 'full' },
    { path: 'countdown-settings', component: CountdownSettingsViewComponent, pathMatch: 'full' },
    { path: 'giveaway-settings', component: GiveawaySettingsViewComponent, pathMatch: 'full' },
    { path: 'giveaway-settings/:id', component: GiveawaySettingsViewComponent, pathMatch: 'full' },
    { path: 'streamerbot-settings', component: StreamerbotSettingsViewComponent, pathMatch: 'full' },
    { path: 'audio-settings', component: AudioSettingsViewComponent, pathMatch: 'full' }
];
