export const environment = {

    useStaticRuntimeConfig: true, // DŮLEŽITÉ: pokud je true, konfigurace se načítá z env.json; Pro produkci vždy true, pro lokální vývoj (environment.local.ts) false

    // overriden with env.json if useStaticRuntimeConfig is true
    devMode: false, // pro produkci ziskej z promenne APP_DEV_MODE (přes env.json)
    environmentName: 'deployed (branch dev)', // pro produkci ziskej z promenne APP_ENV_NAME (přes env.json)
    environmentCode: 'd_d', // pro produkci ziskej z promenne APP_ENV_CODE (přes env.json)

    czidloApiServiceBaseUrl: '', // pro produkci ziskej z promenne APP_CZIDLO_API_SERVICE_URL (přes env.json)
    
    //TODO: presunout do konfigurace
    pageInfoCzUrl: 'https://raw.githubusercontent.com/trineracz/czidlo-frontend-tmp/refs/heads/main/Informace.md',
    pageRulesCzUrl: 'https://raw.githubusercontent.com/trineracz/czidlo-frontend-tmp/refs/heads/main/Pravidla.md',
    pageContactsCzUrl: 'https://raw.githubusercontent.com/trineracz/czidlo-frontend-tmp/refs/heads/main/Kontakty.md',

    pageInfoEnUrl: 'https://raw.githubusercontent.com/trineracz/czidlo-frontend-tmp/refs/heads/main/Information.md',
    pageRulesEnUrl: 'https://raw.githubusercontent.com/trineracz/czidlo-frontend-tmp/refs/heads/main/Rules.md',
    pageContactsEnUrl: 'https://raw.githubusercontent.com/trineracz/czidlo-frontend-tmp/refs/heads/main/Contacts.md',

    pageEditInfoCzUrl: 'https://github.com/trineracz/czidlo-frontend-tmp/edit/main/Informace.md',
    pageEditRulesCzUrl: 'https://github.com/trineracz/czidlo-frontend-tmp/edit/main/Pravidla.md',
    pageEditContactsCzUrl: 'https://github.com/trineracz/czidlo-frontend-tmp/edit/main/Kontakty.md',

    pageEditInfoEnUrl: 'https://github.com/trineracz/czidlo-frontend-tmp/edit/main/Information.md',
    pageEditRulesEnUrl: 'https://github.com/trineracz/czidlo-frontend-tmp/edit/main/Rules.md',
    pageEditContactsEnUrl: 'https://github.com/trineracz/czidlo-frontend-tmp/edit/main/Contacts.md',
    
}
