import { Procedure, Suggestion } from './types';

// Seed postupci (6 najpopularnijih). Koraci, dokumenta i takse su ilustrativni i nisu provereni.

export const PROCEDURES: Procedure[] = [
  {
    id: 'prijava-boravista',
    slug: 'prijava-boravista',
    title: 'Prijava boravišta',
    shortTitle: 'Boravište',
    category: 'boraviste',
    summary:
      'Prijava boravišta u nadležnoj policijskoj stanici za građane koji privremeno žive van mesta prebivališta. Obavlja se lično, nalepnica se izdaje istog dana.',
    institutionIds: ['mup-ps-stari-grad'],
    source: 'mup.gov.rs / Zakon o prebivalištu i boravištu građana',
    updatedAt: '2026-03-01',
    popular: true,
    estimatedCost: '320 din',
    documents: [
      {
        id: 'pb-licna',
        title: 'Lična karta',
        description: 'Važeća lična karta na uvid.',
        defaultStatus: 'have',
      },
      {
        id: 'pb-obrazac',
        title: 'Obrazac PB-1',
        description: 'Popunjavaš na šalteru ili unapred.',
        defaultStatus: 'need',
      },
      {
        id: 'pb-adresa',
        title: 'Dokaz o adresi stanovanja',
        description: 'Ugovor o zakupu ili overena izjava vlasnika.',
        defaultStatus: 'need',
      },
      {
        id: 'pb-taksa',
        title: 'Uplata administrativne takse',
        description: '320 din · uplatnica ili POS na šalteru.',
        defaultStatus: 'need',
        cost: '320 din',
      },
    ],
    steps: [
      {
        id: 'pb-s1',
        title: 'Pripremi dokumenta',
        description:
          'Proveri da imaš ličnu kartu i dokaz o adresi (ugovor o zakupu ili overenu izjavu vlasnika).',
        chips: ['~10 min'],
      },
      {
        id: 'pb-s2',
        title: 'Overi izjavu vlasnika (ako nemaš ugovor)',
        description:
          'Ako stanuješ kod vlasnika bez ugovora, izjavu o saglasnosti vlasnik overava kod javnog beležnika ili u opštini.',
        chips: ['opciono'],
        institutionId: 'maticar-ns',
      },
      {
        id: 'pb-s3',
        title: 'Otiđi u PS Stari Grad',
        description:
          'Nadležna policijska stanica prema adresi boravišta. Ponesi sitninu za taksu.',
        chips: ['07:30-15:00'],
        institutionId: 'mup-ps-stari-grad',
      },
      {
        id: 'pb-s4',
        title: 'Popuni obrazac PB-1',
        description:
          'Službenik proverava dokumenta i daje obrazac na popunjavanje.',
        chips: ['šalter 4 ili 5', '10-15 min'],
        institutionId: 'mup-ps-stari-grad',
      },
      {
        id: 'pb-s5',
        title: 'Preuzmi nalepnicu',
        description:
          'Nalepnica boravišta se lepi u ličnu kartu i izdaje istog dana, obično za 15 minuta.',
        chips: ['isti dan'],
        institutionId: 'mup-ps-stari-grad',
      },
    ],
  },
  {
    id: 'licna-karta',
    slug: 'vadjenje-licne-karte',
    title: 'Vađenje lične karte',
    shortTitle: 'Lična karta',
    category: 'licna-dokumenta',
    summary:
      'Izdavanje nove ili zamena lične karte u policijskoj stanici prema mestu prebivališta.',
    institutionIds: ['mup-ps-stari-grad'],
    source: 'mup.gov.rs / Zakon o ličnoj karti',
    updatedAt: '2026-02-15',
    popular: true,
    estimatedCost: '~1.150 din',
    documents: [
      {
        id: 'lk-stara',
        title: 'Stara lična karta ili izvod iz MKR',
        defaultStatus: 'have',
      },
      {
        id: 'lk-taksa',
        title: 'Uplata takse i obrasca',
        description: 'Republička taksa + cena obrasca.',
        defaultStatus: 'need',
        cost: '~1.150 din',
      },
      {
        id: 'lk-foto',
        title: 'Fotografija (slika se na šalteru)',
        description: 'Najčešće se slikaš na licu mesta, nije potrebna poneta slika.',
        defaultStatus: 'have',
      },
    ],
    steps: [
      {
        id: 'lk-s1',
        title: 'Uplati takse',
        description: 'Republičku administrativnu taksu i cenu obrasca uplati unapred ili na šalteru.',
        chips: ['~1.150 din'],
      },
      {
        id: 'lk-s2',
        title: 'Otiđi u nadležnu PS',
        description: 'Policijska stanica prema mestu prebivališta.',
        chips: ['07:30-15:00'],
        institutionId: 'mup-ps-stari-grad',
      },
      {
        id: 'lk-s3',
        title: 'Predaj zahtev i slikaj se',
        description: 'Daješ otiske i fotografiju na šalteru, potpisuješ zahtev.',
        chips: ['~15 min'],
        institutionId: 'mup-ps-stari-grad',
      },
      {
        id: 'lk-s4',
        title: 'Preuzmi ličnu kartu',
        description: 'Gotova lična karta se preuzima nakon nekoliko radnih dana (ili hitno uz doplatu).',
        chips: ['do 15 dana'],
        institutionId: 'mup-ps-stari-grad',
      },
    ],
  },
  {
    id: 'pasos',
    slug: 'novi-pasos',
    title: 'Novi pasoš',
    shortTitle: 'Pasoš',
    category: 'licna-dokumenta',
    summary:
      'Izdavanje biometrijskog pasoša. Podnosi se lično, uz prethodno uplaćene takse.',
    institutionIds: ['mup-pasosi'],
    source: 'mup.gov.rs / Zakon o putnim ispravama',
    updatedAt: '2026-01-20',
    popular: true,
    estimatedCost: '~6.000 din',
    documents: [
      { id: 'ps-licna', title: 'Važeća lična karta', defaultStatus: 'have' },
      { id: 'ps-stari', title: 'Stari pasoš (ako postoji)', defaultStatus: 'have' },
      {
        id: 'ps-taksa-obrazac',
        title: 'Taksa za obrazac pasoša',
        defaultStatus: 'need',
        cost: '~3.600 din',
      },
      {
        id: 'ps-taksa-izrada',
        title: 'Taksa za izradu',
        defaultStatus: 'need',
        cost: '~2.400 din',
      },
      {
        id: 'ps-foto',
        title: 'Fotografija (slika se na šalteru)',
        defaultStatus: 'have',
      },
    ],
    steps: [
      {
        id: 'ps-s1',
        title: 'Uplati obe takse',
        description: 'Taksu za obrazac i taksu za izradu pasoša uplati unapred.',
        chips: ['~6.000 din'],
      },
      {
        id: 'ps-s2',
        title: 'Otiđi na šalter za pasoše',
        description: 'MUP Novi Sad - odeljenje za putne isprave.',
        chips: ['07:30-15:30'],
        institutionId: 'mup-pasosi',
      },
      {
        id: 'ps-s3',
        title: 'Daj biometrijske podatke',
        description: 'Otisci prstiju, fotografija i potpis se uzimaju na šalteru.',
        chips: ['~20 min'],
        institutionId: 'mup-pasosi',
      },
      {
        id: 'ps-s4',
        title: 'Preuzmi pasoš',
        description: 'Pasoš se preuzima nakon nekoliko radnih dana (moguća hitna izrada uz doplatu).',
        chips: ['do 15 dana'],
        institutionId: 'mup-pasosi',
      },
    ],
  },
  {
    id: 'registracija-vozila',
    slug: 'registracija-vozila',
    title: 'Registracija vozila',
    shortTitle: 'Registracija',
    category: 'vozila',
    summary:
      'Registracija ili produženje registracije vozila. Obuhvata tehnički pregled, osiguranje i registraciju kod MUP-a.',
    institutionIds: ['mup-ps-stari-grad'],
    source: 'mup.gov.rs / Zakon o bezbednosti saobraćaja',
    updatedAt: '2026-02-01',
    popular: true,
    estimatedCost: 'zavisi od vozila',
    documents: [
      { id: 'rv-saobracajna', title: 'Saobraćajna dozvola', defaultStatus: 'have' },
      { id: 'rv-licna', title: 'Lična karta vlasnika', defaultStatus: 'have' },
      { id: 'rv-tehnicki', title: 'Tehnički pregled (potvrda)', defaultStatus: 'need' },
      { id: 'rv-osiguranje', title: 'Polisa obaveznog osiguranja', defaultStatus: 'need' },
      { id: 'rv-takse', title: 'Uplate poreza i taksi', defaultStatus: 'need' },
      { id: 'rv-komunalna', title: 'Komunalna taksa', defaultStatus: 'need' },
      { id: 'rv-registr', title: 'Registraciona nalepnica (izdaje se)', defaultStatus: 'need' },
    ],
    steps: [
      { id: 'rv-s1', title: 'Tehnički pregled', description: 'Odvezi vozilo na tehnički pregled u ovlašćenu organizaciju.', chips: ['~30 min'] },
      { id: 'rv-s2', title: 'Kupi osiguranje', description: 'Sklopi obavezno osiguranje od autoodgovornosti.', chips: [] },
      { id: 'rv-s3', title: 'Uplati takse i porez', description: 'Uplate se najčešće mogu obaviti na istom mestu kao tehnički pregled.', chips: [] },
      { id: 'rv-s4', title: 'Predaj dokumentaciju', description: 'Na šalteru za registraciju vozila predaješ ceo set dokumenata.', chips: ['šalter MUP'], institutionId: 'mup-ps-stari-grad' },
      { id: 'rv-s5', title: 'Preuzmi nalepnicu', description: 'Dobijaš registracionu nalepnicu i overenu saobraćajnu.', chips: ['isti dan'], institutionId: 'mup-ps-stari-grad' },
      { id: 'rv-s6', title: 'Zalepi nalepnicu', description: 'Zalepi registracionu nalepnicu na vetrobran.', chips: [] },
    ],
  },
  {
    id: 'pausalna-firma',
    slug: 'pausalna-firma',
    title: 'Otvaranje paušalne firme',
    shortTitle: 'Paušalna firma',
    category: 'biznis',
    summary:
      'Registracija preduzetnika sa paušalnim oporezivanjem kroz APR, uz prijavu u Poreskoj upravi.',
    institutionIds: ['apr-ns', 'poreska-ns'],
    source: 'apr.gov.rs / purs.gov.rs',
    updatedAt: '2026-02-20',
    popular: true,
    estimatedCost: '~1.600 din (registracija)',
    documents: [
      { id: 'pf-licna', title: 'Lična karta', defaultStatus: 'have' },
      { id: 'pf-jrpps', title: 'Jedinstvena registraciona prijava (APR)', defaultStatus: 'need' },
      { id: 'pf-sifra', title: 'Odabrana šifra delatnosti', defaultStatus: 'need' },
      { id: 'pf-naziv', title: 'Naziv radnje', defaultStatus: 'need' },
      { id: 'pf-taksa', title: 'Naknada za registraciju', defaultStatus: 'need', cost: '~1.600 din' },
    ],
    steps: [
      { id: 'pf-s1', title: 'Izaberi šifru delatnosti', description: 'Pronađi odgovarajuću šifru delatnosti za svoj posao.', chips: [] },
      { id: 'pf-s2', title: 'Odluči o oporezivanju', description: 'Proveri da li ispunjavaš uslove za paušal (limit prometa, dozvoljene delatnosti).', chips: ['paušal vs. knjige'] },
      { id: 'pf-s3', title: 'Popuni JRPPS prijavu', description: 'Jedinstvena registraciona prijava preduzetnika.', chips: [], institutionId: 'apr-ns' },
      { id: 'pf-s4', title: 'Uplati naknadu i predaj u APR', description: 'Predaja prijave i dokaza o uplati naknade.', chips: ['~1.600 din'], institutionId: 'apr-ns' },
      { id: 'pf-s5', title: 'Dobij rešenje o registraciji', description: 'APR izdaje rešenje i matični broj (najčešće za nekoliko dana).', chips: [], institutionId: 'apr-ns' },
      { id: 'pf-s6', title: 'Prijavi se u Poreskoj upravi', description: 'Podnosiš poresku prijavu za paušalno oporezivanje.', chips: ['15 dana'], institutionId: 'poreska-ns' },
      { id: 'pf-s7', title: 'Otvori poslovni račun', description: 'U banci otvaraš tekući račun za preduzetnika.', chips: [] },
    ],
  },
  {
    id: 'upis-godine',
    slug: 'upis-godine',
    title: 'Upis godine (FTN)',
    shortTitle: 'Upis godine',
    category: 'obrazovanje',
    summary:
      'Upis naredne godine studija u studentskoj službi fakulteta.',
    institutionIds: ['ftn-studentska'],
    source: 'ftn.uns.ac.rs / Studentska služba',
    updatedAt: '2026-03-10',
    popular: true,
    estimatedCost: 'školarina + indeks',
    documents: [
      { id: 'ug-indeks', title: 'Indeks', defaultStatus: 'have' },
      { id: 'ug-sv20', title: 'Popunjeni ŠV-20 obrasci', defaultStatus: 'need' },
      { id: 'ug-uplata', title: 'Uplata školarine/rate', defaultStatus: 'need' },
    ],
    steps: [
      { id: 'ug-s1', title: 'Popuni ŠV-20', description: 'Preuzmi i popuni statističke obrasce ŠV-20.', chips: [] },
      { id: 'ug-s2', title: 'Uplati ratu/školarinu', description: 'Uplati prema instrukcijama fakulteta.', chips: [] },
      { id: 'ug-s3', title: 'Predaj u studentsku službu', description: 'Predaješ indeks, obrasce i uplatnice u studentskoj službi.', chips: ['09:00-13:00'], institutionId: 'ftn-studentska' },
    ],
  },
];

export const procedureBySlug = (slug: string): Procedure | undefined =>
  PROCEDURES.find(p => p.slug === slug || p.id === slug);

export const procedureById = (id: string): Procedure | undefined =>
  PROCEDURES.find(p => p.id === id);

// Predlozi za Pitaj home (Popularno ovog meseca).
export const SUGGESTIONS: Suggestion[] = [
  { procedureSlug: 'prijava-boravista', label: 'Prijava boravišta', meta: '5 koraka · 4 dokumenta' },
  { procedureSlug: 'vadjenje-licne-karte', label: 'Vađenje lične karte', meta: '4 koraka · 3 dokumenta' },
  { procedureSlug: 'novi-pasos', label: 'Novi pasoš', meta: '4 koraka · 5 dokumenata' },
  { procedureSlug: 'registracija-vozila', label: 'Registracija vozila', meta: '6 koraka · 7 dokumenata' },
  { procedureSlug: 'pausalna-firma', label: 'Paušalna firma', meta: '7 koraka · APR + PU' },
  { procedureSlug: 'upis-godine', label: 'Upis godine', meta: '3 koraka · FTN' },
];
