# Oprávnění k operacím nad urn:nbn

Stav k 2026-07-17. Týká se čtyř operací nad urn:nbn: deaktivace, reaktivace,
přidání předchůdce a odebrání předchůdce. Dotčená repozitáře: `czidlo-frontend`
(zobrazení tlačítek) a `CZIDLO` (skutečné vynucení práv).

## Značení

Kód registrátora je součástí urn:nbn, takže z identifikátoru se vždy pozná,
kdo dokument registruje:

- Registrátor **X** registruje dokument **X:x** = `urn:nbn:cz:X-x`
- Registrátor **Y** registruje dokument **Y:y** = `urn:nbn:cz:Y-y`

Reálný příklad: u `urn:nbn:cz:tst02-000104` je registrátorem `tst02`.

Ve všech scénářích níž je **X:x dokument, nad kterým se operace provádí**
(u vazby předchůdce → nástupce je to nástupce). **Y:y je cizí předchůdce**,
tedy z jiného registrátora. **X:x2** je jiný dokument téhož registrátora X.

## Role

- **Admin** — uživatel s `admin = true`.
- **Kurátor registrátora X** — nemá `admin`, ale má práva k registrátorovi X.
  Práva jsou seznam kódů registrátorů; API je vrací jako `registrarRights`
  v odpovědi `GET /user` (schéma `UserDetails`) a zvlášť jako
  `GET /users/{id}/registrar_rights`.

## Matice oprávnění

| Uživatel | Deaktivovat X:x | Reaktivovat X:x | Přidat X:x2 jako předchůdce X:x | Přidat Y:y jako předchůdce X:x | Odebrat Y:y z předchůdců X:x |
|---|---|---|---|---|---|
| Nepřihlášený | 401 | 401 | 401 | 401 | 401 |
| Přihlášený, bez práv k X i Y | ❌ | ❌ | ❌ | ❌ | ❌ |
| Kurátor jen X | ✅ | ❌ | ✅ | ❌ | ✅ |
| Kurátor jen Y | ❌ | ❌ | ❌ | ❌ | ❌ |
| Kurátor X i Y | ✅ | ❌ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

✅ = projde, ❌ = 403, 401 = vyžaduje přihlášení

## Pravidla a proč

- **Deaktivovat X:x** — admin, nebo práva k X.
  Registrátor smí deaktivovat vlastní dokument.

- **Reaktivovat X:x** — jen admin.
  Kurátor umí dokument zavřít, ale ne vrátit zpět.

- **Přidat předchůdce k X:x** — admin, nebo práva k registrátorovi nástupce
  **i** předchůdce.
  Operace totiž nemodifikuje jen X:x — zároveň **deaktivuje předchůdce**.
  Kdyby stačila práva k X, mohl by kurátor X deaktivovat libovolný cizí
  dokument tím, že ho prohlásí za předchůdce svého. To je eskalace oprávnění.
  Důsledek: vazbu napříč registrátory může založit jen admin (nebo kurátor
  obou registrátorů).

- **Odebrat předchůdce z X:x** — admin, nebo práva k X.
  Relace je vlastnost nástupce a odebráním se předchůdce nijak nedotkne
  (nereaktivuje se), takže práva k jeho registrátorovi nejsou potřeba.

Z toho plyne **záměrná asymetrie**: kurátor X cizí vazbu Y:y → X:x založit
nemůže, ale zrušit ji na svém dokumentu smí.

## Kde je to vynucené

**Backend** (`CZIDLO`) — vynucuje se ve dvou vrstvách, obě musí projít:

| Operace | Endpoint |
|---|---|
| Deaktivovat | `POST /documents/{urn}/deactivation` |
| Reaktivovat | `DELETE /documents/{urn}/deactivation` |
| Přidat předchůdce | `PUT /documents/{urn}/predecessors` |
| Odebrat předchůdce | `DELETE /documents/{urn}/predecessors/{predUrnNbn}` |

- Resource vrstva: `web-api/…/api/resources/DocumentsResource.java`, přes
  sdílený helper `requireRightToManageRegistrar` v `AbstractResource.java`.
- Servisní vrstva: `services/…/impl/DataUpdateServiceImpl.java`
  (`addRelationPredecessorSuccessor`, `removeRelationPredecessorSuccessor`,
  `deactivateUrnNbn`, `reactivateUrnNbn`), kontroly v
  `AuthorizationModule.java`.
- U přidání předchůdce se autorizuje **před** zápisem relace, aby při odmítnutí
  nezůstal částečný zápis.

**Frontend** (`czidlo-frontend`) — jen skrývá tlačítka, nic nevynucuje:

- `src/app/body/search/search.component.html`, blok urn:nbn se otevře na
  `hasRightToRegistrar(item.registrarcode)`; Reaktivovat má navíc `isAdmin()`.
- `AuthService.hasRightToRegistrar(code)` čte `registrarRights` a sám ORuje
  `isAdmin()`.

## Co ještě chybí

- **Validace předchůdce ve formuláři.** Tlačítko „Přidat předchůdce" se řídí
  právy k X, ale pravidlo závisí i na registrátorovi předchůdce, kterého
  uživatel teprve zadá. Formulář si má z vloženého urn:nbn odvodit kód
  registrátora a bez práv k němu neumožnit odeslání — jinak kurátor X narazí
  na 403 až ze serveru.

- **Opravené bugy** (2026-07-17, ověřeno proti běžícímu backendu):
  1. `deactivateUrnNbn` a `reactivateUrnNbn` v `DataUpdateServiceImpl` volaly
     striktní `checkRegistrarRights` místo `checkRegistrarRightsOrAdmin`.
     Protože `getAdminsOfRegistrar` čte jen tabulku `user_registrar`, globální
     admin bez záznamu k danému registrátorovi dostával 403 — u deaktivace,
     reaktivace i přidání předchůdce (to předchůdce deaktivuje). **Opraveno**
     záměnou za `checkRegistrarRightsOrAdmin` (stejný vzor jako zbytek souboru).
  2. Kvůli bodu 1 mohl u přidání předchůdce zůstat **částečný zápis**: relace
     se vložila a teprve deaktivace předchůdce spadla na 403. **Opraveno**
     důsledkem bodu 1 — obě kontroly nad týmž registrátorem teď dopadnou
     stejně, takže se k deaktivaci vůbec nedojde, když nemá projít.

- **Testy.** Modul `web-api` nemá `src/test` vůbec; autorizace těchto endpointů
  není krytá žádným testem ani v jednom směru.
