# Miittinki — Kokoushuoneiden varaus-API

Pieni REST-rajapinta kokoushuoneiden varaamiseen. Toteutus on Node.js + TypeScript + Express ja käyttää muistinvaraista tietovarastoa (ei ulkoista DB:tä).

**Tärkeintä:** rajapinta noudattaa ohjeistettua liiketoimintalogiikkaa (start/end -validoinnit, päällekkäisyyksien esto, `bookedBy`-omistajuustarkistus).

**Teknologiat**
- Node.js 20 LTS
- TypeScript 5.x
- Express 4.19.x
- uuid 9.x
- date-fns 3.x

**Nopea käynnistys**

```bash
npm install
npm run dev
```

Palvelin käynnistyy oletuksena osoitteeseen `http://localhost:3000`.

**Komennot**
- Kehitys: `npm run dev`
- Käännä: `npm run build`
- Käynnistä tuotannossa: `npm start`
- Suorita testit: `npm test`

---

**Testit**

Projekti sisältää kattavat yksikkötestit, jotka varmistavat ohjelman toimivuuden:

```bash
npm test
```

Testit kattavat seuraavat osa-alueet:

**BookingService** (27 testiä)
- ✓ Varauksen luonti (onnistuneet varaukset, validoinnit)
- ✓ Varauksen peruutus (olemassa oleva varaus, omistajuustarkistus)
- ✓ Varausten haku huoneen perusteella (tyhjä lista, useita varauksia)
- ✓ Varauksen muokkaaminen (onnistuneet muutokset, päällekkäisyyksien esto)
- ✓ Liiketoimintalogiikka:
  - Varaukset eivät voi olla menneisyydessä
  - Aloitusaika täytyy olla ennen lopetusaikaa
  - Varaukset eivät saa mennä päällekkäin
  - Eri huoneet voivat olla varattuja samalla ajalla
  - Omistajuustarkistus varauksen poistossa ja muokkauksessa

**TimeUtils** (11 testiä)
- ✓ ISO-päivämäärän jäsentäminen
- ✓ Aikavälin validoinnit (aloitus ennen lopetusta)
- ✓ Menneisyyden tarkistus
- ✓ Päällekkäisyyden havaitseminen (eri skenaarioita)

**BookingRepository** (5 testiä)
- ✓ Varausten tallennus ja haku
- ✓ Varausten päivitys ja poistaminen
- ✓ Huoneen varausten listaus

**Testien tulokset**: 43 testiä menevät läpi (3 test suites)

---

**API — pääreitit**

- Luo varaus
	- POST `/api/bookings`
	- Body (JSON):

```json
{
	"roomId": "A101",
	"startTime": "2026-02-10T09:00:00Z",
	"endTime": "2026-02-10T10:00:00Z",
	"bookedBy": "session-abc-123"
}
```

	- Vastaukset:
		- 201: luotu varaus (JSON, sisältää `id`, `roomId`, `startTime`, `endTime`, `bookedBy`)
		- 400: virheellinen aikaväli / menneisyydessä
		- 409: päällekkäinen varaus

- Muokkaa varausta
	- PUT `/api/bookings/:id`
	- Body (JSON):

```json
{
	"startTime": "2026-02-10T10:00:00Z",
	"endTime": "2026-02-10T11:00:00Z",
	"bookedBy": "session-abc-123"
}
```

	- Säännöt:
		- `bookedBy` vaaditaan ja muokkausoikeus tarkistetaan (vain alkuperäinen saa muokata)
		- Päällekkäisyystarkistus ohittaa muokattavan varauksen itsensä
	- Virheet: 400, 403, 404, 409

- Peruuta varaus
	- DELETE `/api/bookings/:id`
	- Body (JSON): `{ "bookedBy": "session-abc-123" }`
	- Vastaukset: 204 No Content / 403 / 404

- Listaa huoneen varaukset
	- GET `/api/rooms/:roomId/bookings`
	- Paluuarvo: taulukko varauksia (JSON)

---

**Projektin rakenne (lyhyt)**

- `src/controllers/` — HTTP-käsittelijät
- `src/services/` — liiketoimintalogiikka (validoinnit, päällekkäisyydet, omistajuustarkistukset)
- `src/repositories/` — in-memory tallennus
- `src/models/` — domain-rajapinnat
- `src/dtos/` — request/response DTO:t
- `src/routes/` — Express-reitit
- `src/errors/` — virhetyypit
- `src/utils/` — apufunktiot (aikavertailut, yms.)

---

Kehitysehdotuksia / seuraavat askeleet:
- Lisää pyyntövalidointi (esim. `express-validator`)
- Vaihda muistivarastosta pysyvään tietokantaan tarpeen mukaan
- Lisää integraatiotestit API-päätepisteiden testaamiseen

Lisätietoja ja koodin sijainti: katso `src/`-hakemisto.

