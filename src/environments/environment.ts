export const environment = {

    useStaticRuntimeConfig: true, // DŮLEŽITÉ: pokud je true, konfigurace se načítá z env.json; Pro produkci vždy true, pro lokální vývoj (environment.local.ts) false

    // overriden with env.json if useStaticRuntimeConfig is true
    devMode: false, // pro produkci ziskej z promenne APP_DEV_MODE (přes env.json)
    environmentName: 'deployed (branch dev)', // pro produkci ziskej z promenne APP_ENV_NAME (přes env.json)
    environmentCode: 'd_d', // pro produkci ziskej z promenne APP_ENV_CODE (přes env.json)

    czidloApiServiceBaseUrl: '', // pro produkci ziskej z promenne APP_CZIDLO_API_SERVICE_URL (přes env.json)
    czidloPublicApiBaseUrl: '', // pro produkci ziskej z promenne APP_CZIDLO_PUBLIC_API_URL (přes env.json)

    //TODO: presunout do konfigurace
    pageInfoCzUrl: 'https://raw.githubusercontent.com/NLCR/czidlo-frontend/refs/heads/main/docs/Informace.md',
    pageRulesCzUrl: 'https://raw.githubusercontent.com/NLCR/czidlo-frontend/refs/heads/main/docs/Pravidla.md',
    pageContactsCzUrl: 'https://raw.githubusercontent.com/NLCR/czidlo-frontend/refs/heads/main/docs/Kontakty.md',

    pageInfoEnUrl: 'https://raw.githubusercontent.com/NLCR/czidlo-frontend/refs/heads/main/docs/Information.md',
    pageRulesEnUrl: 'https://raw.githubusercontent.com/NLCR/czidlo-frontend/refs/heads/main/docs/Rules.md',
    pageContactsEnUrl: 'https://raw.githubusercontent.com/NLCR/czidlo-frontend/refs/heads/main/docs/Contacts.md',

    pageEditInfoCzUrl: 'https://github.com/NLCR/czidlo-frontend/edit/main/docs/Informace.md',
    pageEditRulesCzUrl: 'https://github.com/NLCR/czidlo-frontend/edit/main/docs/Pravidla.md',
    pageEditContactsCzUrl: 'https://github.com/NLCR/czidlo-frontend/edit/main/docs/Kontakty.md',

    pageEditInfoEnUrl: 'https://github.com/NLCR/czidlo-frontend/edit/main/docs/Information.md',
    pageEditRulesEnUrl: 'https://github.com/NLCR/czidlo-frontend/edit/main/docs/Rules.md',
    pageEditContactsEnUrl: 'https://github.com/NLCR/czidlo-frontend/edit/main/docs/Contacts.md',

    esBaseUrl: '', // pro produkci ziskej z promenne APP_ES_BASE_URL (přes env.json)
    esLogin: '', // pro produkci ziskej z promenne APP_ES_LOGIN (přes env.json)
    esPassword: '', // pro produkci ziskej z promenne APP_ES_PASSWORD (přes env.json)
    esIndexSearch: '', // pro produkci ziskej z promenne APP_ES_INDEX_SEARCH (přes env.json)
    esIndexAssign: '', // pro produkci ziskej z promenne APP_ES_INDEX_ASSIGN (přes env.json)
    esIndexResolve: '', // pro produkci ziskej z promenne APP_ES_INDEX_RESOLVE (přes env.json)
}
