## Aktuality
- **8. 10. 2017** byla nasazena nová verze softwaru CZIDLO (verze 4.3) s novými funkcionalitami – viz projektová stránka.  
- **14. 1. 2019** byla nasazena nová verze softwaru CZIDLO (verze 4.6) s novými funkcionalitami – viz projektová stránka.

---

## Základní funkce nástroje
- přidělování identifikátorů **URN:NBN** (automatizovaně prostřednictvím API nebo manuálně přes webové rozhraní),  
- správa identifikátorů (např. jejich deaktivace) a přidružených metadat,  
- vkládání a dodatečná aktualizace adres **URL** digitálních dokumentů (manuálně/API/OAI Adapter),  
- přesměrovávací služba (resolver) zajišťující přesměrování z **URN:NBN** na aktuální URL umístění dokumentu nebo na záznam v CZIDLO,  
- správa uživatelských účtů, práv a záznamů registrátorů (včetně digitálních knihoven),  
- vyhledávání záznamů přes webové rozhraní,  
- spouštění procesů na straně serveru (OAI Adapter, export identifikátorů),  
- **OAI-PMH rozhraní** pro hromadné sklízení záznamů externími systémy.

---

## Vývoj
Nástroj CZIDLO byl vyvinut v letech 2011–2012 v rámci programu *Koncepce rozvoje Národní knihovny České republiky jako výzkumné organizace na léta 2010–2015*, financovaného Ministerstvem kultury ČR.  

Softwarové řešení je založeno na **opensource technologiích** (Java, PostgreSQL, Spring security, GWT aj.) a standardech (XML, XSD, XSLT, HTTP, REST aj.).  

- Licence: **GNU GPL v3**  
- Zdrojové kódy, instalační balíky, dokumentace: [CZIDLO na GitHubu](https://github.com/NLCR/CZIDLO)  

---

## Dokumentace a podpora
- Dokumentace: [Wiki](https://github.com/NLCR/CZIDLO/wiki)  
- Instalační balíčky: [Repository](https://github.com/NLCR/CZIDLO)  
- Chyby hlaste přes: [Issue tracker](https://github.com/NLCR/CZIDLO/issues)  

---

## Vyhledávání
Aplikace umožňuje vyhledávat digitální dokumenty primárně podle identifikátoru **URN:NBN**, dále podle:  
- čČNB (číslo české národní bibliografie),  
- ISSN, ISBN,  
- názvových údajů (např. titul monografie, název periodika).  

### Příklady
- URN:NBN: `urn:nbn:cz:mzk-0005j2`  
- čČNB: `cnb000683872`  
- ISBN: `9788073210793`  

---

## Metodika
Podrobná pravidla pro využívání služby ČIDLO a návody na resolver jsou popsány v certifikované metodice.  

Aktualizovaná verze: [Metodika (resolver.nkp.cz)](https://resolver.nkp.cz/urn:nbn:cz:nk-004hvy)

---

## Kontakty
**Kurátor**  
Mgr. Filip Pavčík, PhD.  
📧 [filip.pavcik@nkp.cz](mailto:filip.pavcik@nkp.cz)  

**Technická správa a podpora**  
📧 [resolver-podpora@nkp.cz](mailto:resolver-podpora@nkp.cz)  

---

## Výzkum a vývoj
- **Autor koncepce**: PhDr. Ladislav Cubr, Ph.D. (2011–2014)  
- **Garant vývoje**: PhDr. Zdeněk Vašek, Ph.D. (2014–2017)  
- **Vývoj softwaru**:  
  - Mgr. Martin Řehánek (2011–2013, 2017–2019)  
  - Mgr. Václav Rosecký (2013)  
