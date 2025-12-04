## Poslání
**ČIDLO** je systém pro trvalou identifikaci digitálních dokumentů českého kulturního dědictví, který využívá standard **URN:NBN** a je řízen **Národní knihovnou ČR**, jež tento systém spravuje a koordinuje ve spolupráci s dalšími institucemi. Tato spolupráce je nezbytnou podmínkou úspěšného fungování celého systému.

ČIDLO slouží:
- **knihovnám a dalším institucím** (pro potřeby dlouhodobé správy, archivace a zpřístupňování digitálních dokumentů),  
- **uživatelům** (zajištění trvalého zpřístupňování dokumentů v síti, řešení nestability URL adres, důvěryhodnost citační praxe a ověřování autenticity citovaných dokumentů).  

---

## Struktura
ČIDLO se skládá z:
- pravidel,  
- technických podsystémů (resolver, API, OAI-PMH data provider),  
- zapojených institucí a jejich pověřených zaměstnanců,  
- identifikátorů **URN:NBN** pro český jmenný prostor (`urn:nbn:cz`),  
- přidružených metadat.  

### Centrální autorita
- Roli centrální autority vykonává **Národní knihovna ČR**, v souladu se standardem URN:NBN.  
- Hlavní zástupce: **kurátor resolveru** – koordinátor celého systému.  
  - poskytuje registrátorům informace o pravidlech,  
  - poskytuje konzultace,  
  - rozhoduje o parametrech kulturního dědictví.  
- Kontakt: 📧 [urnnbn@nkp.cz](mailto:urnnbn@nkp.cz)  

### Role spolupracujících institucí
- **Registrátor** – vlastník dokumentu, který žádá o přidělení URN:NBN a ručí za dodržování pravidel.  
- **Archivátor** – instituce, která trvale archivuje digitální dokumenty v repozitáři.  
- **Provozovatel digitální knihovny** – instituce, která dokumenty zpřístupňuje uživatelům.  

Jedna instituce může plnit všechny role, nebo je možné spolupracovat na základě dohod. Registrátora může v určité fázi zastupovat **digitalizační firma**.

### Předmět identifikace
- digitální dokumenty, které lze považovat za součást **českého kulturního dědictví**,  
- dokumenty dlouhodobě archivované a zpřístupňované v **digitálních knihovnách** na nekomerční bázi,  
- dokumenty s **neměnným obsahem** (např. aktualizované články jsou vyloučeny).  

V současnosti je systém určen pro **nově produkované dokumenty** v rámci digitalizačních projektů.  

---

## Registrátoři
- Registrátorem se mohou stát všechny **registrované knihovny v ČR**.  
- Další instituce se mohou zapojit po dohodě s kurátorem a pokud jejich dokumenty splňují podmínku kulturní hodnoty.  
- Všichni registrátoři musí dodržovat pravidla systému ČIDLO.  

### Postup
- Instituce musí nejprve kontaktovat **kurátora resolveru** 📧 [urnnbn@nkp.cz](mailto:urnnbn@nkp.cz).  
- Kurátor seznámí zájemce s pravidly a technickými postupy.  
- Registrátor může být zastupován firmou (během digitalizace) nebo spolupracovat s jinými institucemi (repozitáře, knihovny).  

---

## Archivátoři
- Archivátorem je zpravidla registrátor, který uchovává své dokumenty.  
- Archivaci je možné smluvně zajistit i jinou institucí.  

---

## Pravidla pro registrátory
1. **Přidělování URN:NBN** probíhá v okamžiku dokončení digitalizace (vytvoření archivního a uživatelského balíčku). Proces probíhá komunikací mezi API CZIDLO a digitalizačním softwarem.  
2. Registrátor musí dodat do CZIDLO **stanovená bibliografická a technická metadata**. Specifikaci poskytuje kurátor.  
3. Tentýž identifikátor musí být zapsán do metadat **archivního i uživatelského balíčku**. Archivní balíček jde do repozitáře, uživatelský do digitální knihovny.  
4. Balíčky nesmí být signifikantně změněny. Pokud ano → nový URN:NBN.  
   - Signifikantní změny: rozdělení/sloučení dokumentů, změna identifikačních údajů (např. názvu).  
   - Nesignifikantní změny: drobné překlepy.  
   - Sporné případy → konzultace s kurátorem.  
5. V digitální knihovně musí být dokument vystaven s **viditelným URN:NBN** v sekci metadat.  
6. Registrátor musí **mapovat URN:NBN do metadat pro OAI-provider**.  
7. Po vystavení dokumentu musí registrátor kontaktovat kurátora a dojednat **proces sklízení adres URL přes OAI-PMH**.  
8. Kurátor před registrací seznámí zájemce s detailnějšími pravidly. V případě nejasností je nutné kurátora kontaktovat.  
9. **Certifikovaná metodika**:  
   - [Metodika – resolver.nkp.cz](https://resolver.nkp.cz/urn:nbn:cz:nk-004hvy)  
   - [Standardy NDK (obecná stránka)](https://standardy.ndk.cz/ndk/archivace/resolver-urn-nb)
