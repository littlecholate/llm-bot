import { Home, Zap, Clock, Presentation } from 'lucide-react';
import { locales } from './locales';

export const siteConfig = {
    name: locales.site.name,
    version: '1.0.0 Beta',
    welcome: {
        title: locales.welcome.title,
        subtitle: locales.welcome.subtitle,
        description: locales.welcome.description,
    },
};

export const settingsConfig = {
    languages: locales.settings.options.languages,
    characters: locales.settings.options.characters,
};

export const navSections = [
    {
        category: locales.nav.categories.home,
        items: [{ id: 'home', label: locales.nav.items.home, icon: Home, view: 'chat' }],
    },
    {
        category: locales.nav.categories.data,
        items: [
            { id: 'events-current', label: locales.nav.items.eventsCurrent, icon: Zap, view: 'tools' },
            { id: 'events-history', label: locales.nav.items.eventsHistory, icon: Clock, view: 'tools' },
            { id: 'analysis-compare', label: locales.nav.items.analysisCompare, icon: Presentation, view: 'tools' },
        ],
    },
    {
        category: locales.nav.categories.chats,
        items: [],
    },
    {
        category: locales.nav.categories.links,
        items: [],
    },
];
