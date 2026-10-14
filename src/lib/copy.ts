/** Bilingual landing-page copy (master copy implementation). Prices come from src/lib/pricing.ts. */
export type LandingLang = "en" | "so";

export const COPY: Record<
  LandingLang,
  {
    nav: { tagline: string; links: string[]; cta: string; menuTitle: string };
    hero: { eyebrow: string; title: string; sub: string; desire: string; cta1: string; cta2: string; trust: string };
    proof: string[];
    problem: { eyebrow: string; title: string; sub: string; cards: { title: string; body: string }[] };
    agitate: {
      eyebrow: string; headline: string; sub: string;
      without: string[]; with: string[]; withoutLabel: string; withLabel: string;
      roi: string; onePercent: string;
    };
    solution: { eyebrow: string; headline: string; sub: string; values: string[] };
    features: { eyebrow: string; title: string; sub: string; cards: { title: string; body: string; proof: string }[]; snapshotLabel: string };
    steps: { title: string; sub: string; items: { title: string; body: string }[]; ttv: string };
    testimonials: { title: string; sub: string; items: { quote: string; name: string; role: string; badge: string }[]; receiptsCaption: string; reportsCaption: string };
    faq: { title: string; items: { q: string; a: string }[] };
    finalCta: { eyebrow: string; headline: string; sub: string; cta: string; waCta: string; badges: string[] };
    footer: {
      tagline: string; cols: { title: string; links: string[] }[];
      waLine: string; copyright: string; legal: string[];
    };
  }
> = {
  en: {
    nav: {
      tagline: "School fees, finally clear.",
      links: ["Why DuqsiPay", "Features", "Pricing", "FAQ"],
      cta: "Get started",
      menuTitle: "Menu — DuqsiPay",
    },
    hero: {
      eyebrow: "Built for Somali schools · Somali + English",
      title: "Know who paid. Know who owes. In one tap.",
      sub: "Every Monday you open a notebook, count cash, and call parents one by one. DuqsiPay ends that — 200 students, every payment, every reminder, on your phone.",
      desire: "One app, and this week's fees collect themselves — you just confirm.",
      cta1: "Explore the live demo",
      cta2: "See how it works",
      trust: "Works on any Android · Setup in 60 minutes · Cancel anytime",
    },
    proof: ["26 students tracked in the live demo", "95 payments recorded & receipted", "Under 1% of monthly fee revenue"],
    problem: {
      eyebrow: "The daily reality",
      title: "Running a school from a notebook? We know that Monday.",
      sub: "The money is there — it's the tracking that steals your time and your fees.",
      cards: [
        {
          title: "Lost notebooks, disputed fees",
          body: "One register for 200 students gets lost, smudged, or argued over. When a parent says “we already paid”, you cannot prove anything — so you lose the fee to keep the peace.",
        },
        {
          title: "$200+ silently disappears monthly",
          body: "Forgotten fees, half-payments nobody followed up, payments never written down. Most directors lose $200–$300 every month without ever seeing a number for it.",
        },
        {
          title: "3 hours every Monday — on your knees over paper",
          body: "Counting cash, matching names, typing the same WhatsApp message to 40 parents. That work should take 15 minutes — and it doesn't need you to do it.",
        },
      ],
    },
    agitate: {
      eyebrow: "The cost",
      headline: "The notebook is free. It just costs you $3,600 a year.",
      sub: "Time is money and forgotten fees are money — you're paying both. Here is the honest monthly math for an average school.",
      withoutLabel: "Without DuqsiPay",
      withLabel: "With DuqsiPay",
      without: [
        "3 hours every Monday on manual fee work",
        "$200–$300 lost monthly in uncollected fees",
        "No proof when parents dispute a payment",
        "You guess who owes — and chase the wrong parents",
        "Receipts handwritten, copied, lost",
      ],
      with: [
        "15 minutes a week — fees run themselves",
        "Every payment recorded with an official receipt №",
        "Balances per student, class and month — always exact",
        "One tap opens a ready WhatsApp reminder to the right parent",
        "A monthly collection rate you can watch climb",
      ],
      roi: "You lose ~$240/month in time and forgotten fees. DuqsiPay costs from $15. Net gain: ~$225/month.",
      onePercent: "For every $1 you spend on DuqsiPay, you get back about $10 in collected fees and recovered time.",
    },
    solution: {
      eyebrow: "The way out",
      headline: "DuqsiPay — your fee office, in your pocket.",
      sub: "A simple fee-management app built for private schools in Mogadishu, Hargeisa, Bosaso and Kismayo. For directors who want the numbers without the notebook.",
      values: [
        "Collect more: forgotten fees get remembered automatically.",
        "Save 12+ hours a month: payments take seconds, not Mondays.",
        "End disputes: numbered receipts parents trust, on WhatsApp.",
      ],
    },
    features: {
      eyebrow: "Features",
      title: "Everything the office needs. Nothing you have to learn.",
      sub: "Each feature exists to give you time or money back — here is what you get.",
      snapshotLabel: "The dashboard your school deserves",
      cards: [
        {
          title: "Your whole register, searchable in seconds",
          body: "You get every student with roll number, class, parent and balance in one clean list — because students are added one by one or imported from Excel/CSV in bulk.",
          proof: "Directors find any student in under 5 seconds.",
        },
        {
          title: "Payments recorded in 10 seconds",
          body: "You get each payment saved with method, month and receipt number — because the form auto-fills the class fee when you pick the student.",
          proof: "Schools log 40+ payments before first break.",
        },
        {
          title: "Reminders that take one tap",
          body: "You get a polite, pre-written reminder opened to the exact parent — because phone numbers are auto-formatted to +252 and the message writes itself.",
          proof: "Schools recover $200+/month with weekly reminders.",
        },
        {
          title: "Your numbers, live",
          body: "You get collected, outstanding, paid and unpaid counts the moment you open the app — because the dashboard recalculates with every payment.",
          proof: "No more waiting for Monday to know your cash position.",
        },
        {
          title: "Receipts parents frame, not question",
          body: "You get an official numbered receipt with your school's name and contacts — printable, saveable as PDF, shareable to the parent on WhatsApp.",
          proof: "Payment disputes drop to nearly zero.",
        },
        {
          title: "Somali and English, one tap apart",
          body: "You get an interface your whole staff reads comfortably — because the app switches between English and Soomaali in Settings.",
          proof: "Zero training for staff who prefer Somali.",
        },
      ],
    },
    steps: {
      title: "From notebook to numbers — in one afternoon",
      sub: "Three steps. No technician needed.",
      items: [
        {
          title: "Add your school, classes & students",
          body: "Create your classes with their monthly fees, then add students one by one or paste your whole register from Excel. We can even do the import for you over WhatsApp.",
        },
        {
          title: "Record payments as they come",
          body: "Search the student, confirm the amount, done — EVC Plus, Zaad, Cash or bank. The receipt is created automatically, ready to print or send.",
        },
        {
          title: "Watch who paid — and remind who didn't",
          body: "The dashboard and monthly report show exactly who owes what. One tap opens WhatsApp with a ready reminder to that parent. You press send.",
        },
      ],
      ttv: "Most schools see their first full, accurate month within 30 days of setup.",
    },
    testimonials: {
      title: "Directors who made the switch",
      sub: "Illustrative quotes — replace with your first customers' words.",
      receiptsCaption: "Parents love getting instant, official receipts.",
      reportsCaption: "Know your numbers. Every month.",
      items: [
        {
          quote: "I used to lose track of who paid in October by November. Now I open DuqsiPay and see it in five seconds — and the reminder tap brought back about $250 we used to write off.",
          name: "Mudane A., School Director",
          role: "Director, Mogadishu",
          badge: "Recovers ~$250/month",
        },
        {
          quote: "My Monday fee work went from three hours to twenty minutes. The receipts alone ended the arguments at the gate.",
          name: "Marwo H., Principal",
          role: "Principal, Hargeisa",
          badge: "Saves 11 hours/month",
        },
        {
          quote: "I'm not a technology person, but I did the setup myself in one phone call to their team. My whole staff uses it in Somali.",
          name: "Mudane F., School Owner",
          role: "Owner, Bosaso",
          badge: "Setup in 1 call",
        },
      ],
    },
    faq: {
      title: "Questions directors ask us",
      items: [
        { q: "Does it work on my Android phone?", a: "Yes — DuqsiPay is built mobile-first for Android Chrome. It also works on any laptop or iPhone browser. Nothing to install, nothing to update." },
        { q: "What if I'm not good with technology?", a: "If you can send a WhatsApp message, you can run DuqsiPay. And you won't set it up alone — we do your import and training over one WhatsApp call." },
        { q: "We already use WhatsApp and Excel — why change?", a: "Keep WhatsApp — we just make it smarter. DuqsiPay fills the message for you and remembers who got it. Excel can't remind a parent, stop a dispute, or total your month." },
        { q: "Is my school's data safe?", a: "Your data lives in your own workspace — not shared with other schools. You can download a complete backup anytime with one click, and records with payment history can never be deleted by accident." },
        { q: "What if I want to cancel?", a: "Cancel anytime from one message to us — no contracts. You keep every record you exported, and we never hold your data hostage." },
        { q: "Do parents need to download anything?", a: "No. Parents receive receipts and reminders on the WhatsApp they already have. Nothing to install, nothing to learn." },
        { q: "Is there support in Somali?", a: "Yes — our onboarding and support team speaks Soomaali and English. Message us any working day and you'll talk to a person, not a bot." },
        { q: "How is this better than hiring another admin?", a: "An admin costs $150–$250 a month and still makes mistakes in a notebook. DuqsiPay does their fee-tracking work for a tenth of that — and frees them for work that actually needs a human." },
      ],
    },
    finalCta: {
      eyebrow: "Your last Monday in the notebook",
      headline: "Next month, collect everything you're owed.",
      sub: "Explore the live demo now — if it doesn't feel obvious in 3 minutes, don't buy it.",
      cta: "Explore the live demo",
      waCta: "Or message us on WhatsApp →",
      badges: ["No card required", "Cancel anytime", "Somali support", "Backup anytime"],
    },
    footer: {
      tagline: "School fees, finally clear.",
      cols: [
        { title: "Product", links: ["Live demo", "Features", "Pricing", "Product tour"] },
        { title: "Company", links: ["About", "Sign in", "Create account", "Pricing plans"] },
        { title: "Support", links: ["WhatsApp support", "Setup help", "FAQ", "Try live demo"] },
      ],
      waLine: "Prefer to talk? WhatsApp us — we answer in Somali or English.",
      copyright: "© {year} DuqsiPay — Mogadishu, Somalia",
      legal: ["Privacy", "Terms"],
    },
  },
  so: {
    nav: {
      tagline: "Lacagaha dugsi, si cad.",
      links: ["Maxaa DuqsiPay", "Astaamaha", "Qiimaha", "Su'aalaha"],
      cta: "Bilow hadda",
      menuTitle: "Liiska — DuqsiPay",
    },
    hero: {
      eyebrow: "Loogu talagalay dugsiyada Soomaalida · Soomaali + English",
      title: "Ogow cida bixisay. Ciduna seegto. Hal riix.",
      sub: "Isniin kasta buugaagta baad furtaa, lacag baad tirisaa, waalidkana mid mid baad u wacdaa. DuqsiPay wuu joojinayaa — 200 arday, lacag kasta, xasuusin kasta, taleefankaaga.",
      desire: "Hal app, lacagtii usbuucana isu soo ururtaa — adigu waxaad xaqiijisaa oo keliya.",
      cta1: "Arag demo toos ah",
      cta2: "Eeg sida loo adeegsado",
      trust: "Wuxuu ku shaqeeyaa Android kasta · Dejin 60 daqiiqo · Jooji waqti kasta",
    },
    proof: ["26 arday lagaa arko demo-ga toos ah", "95 lacag oo la diiwaan geliyay", "Lacag ka yar 1% ee dakhliga bisha"],
    problem: {
      eyebrow: "Xaaladda maalinkasta",
      title: "Dugsi ku maamulaysid buug? Waan naqaannaa Isniintaas.",
      sub: "Lacagtu way jirtaa — dabagalka ayaa waqtigaaga iyo lacagtaada luminaya.",
      cards: [
        {
          title: "Buug lumiya, muran dhaca",
          body: "Hal buug oo 200 arday lagu qoray wuu lumiyaa, wuuna barbaraxdaa. Marka waalidku yiraahdo “waan binnayay”, caddayn ma haysato — sidaa darteed lacagta ayaad luminaysaa.",
        },
        {
          title: "$200+ si aamusan u luma bil kasta",
          body: "Lacago la iloobo, kala-bixid aan la dabagalin, lacago aan la qorin. Madax badan ayaa luminaya $200–$300 bil kasta iyagoon arag tirada.",
        },
        {
          title: "3 saacadood Isniin kasta — warqad dhexdeeda",
          body: "Lacag tirisi, magacyo isbarbar dhig, isla fariinti WhatsApp oo 40 waalid loo dirayo. Shaqadaasi waxay qaadan lahayd 15 daqiiqo — adiguna kuma baahnid inaad samayso.",
        },
      ],
    },
    agitate: {
      eyebrow: "Qiimaha",
      headline: "Buuggu waa bilaash. Laakiin wuxuu ku kacayaa $3,600 sanadkii.",
      sub: "Waqtigu waa lacag, lacagtii la iloobotuna waa lacag — labadaba waad bixinaysaa. Kani waa xisaabta runta ah ee bisha ee dugsiga caadiga ah.",
      withoutLabel: "DuqsiPay la'aan",
      withLabel: "DuqsiPay la haysto",
      without: [
        "3 saacadood Isniin kasta shaqo gacan",
        "$200–$300 luma bil kasta",
        "Caddayn la'aan marka waalidku murmo",
        "Waad saadaalaysaa cida deyn tahay",
        "Rasiidh gacan lagu qoro oo lumiya",
      ],
      with: [
        "15 daqiiqo usbuucii — lacagtu ismaamushaa",
        "Lacag kasta rasiidh rasmiya oo leh",
        "Haraaga arday, fasal iyo bil — had iyo jeer sax",
        "Hal riix xasuusin diyaar ah waalidka saxda ah",
        "Heerka ururinta bisha oo aad arki karto",
      ],
      roi: "Waxaad luminaysaa ~$240 bil kasta waqti iyo lacago la iloobo. DuqsiPay wuxuu ka bilaabmaa $15. Faa'iidada saafiga ah: ~$225 bil kasta.",
      onePercent: "$1 kasta oo aad DuqsiPay bixiso, waxaad heshaa qiyaastii $10 oo lacag soo la ceshaday iyo waqti la badbaadiyay.",
    },
    solution: {
      eyebrow: "Xalka",
      headline: "DuqsiPay — xafiiskaaga lacagaha, jeebkaaga.",
      sub: "App fudud oo lagu maareeyo lacagaha dugsiga, loo dhisay dugsiyada gaarka ah ee Muqdisho, Hargeysa, Boosaaso iyo Kismaayo. Madaxda doonaysa tirada buug la'aan.",
      values: [
        "Soo ururi lacag badan: lacagtii la iloobay si toos ah loo xasuusanaa.",
        "Keyd 12+ saacadood bil kasta: bixinta waxay qaadataa ilbiriqsiyo.",
        "Jooji muranka: rasiidh lambarsan oo waalidku rumaysto, WhatsApp.",
      ],
    },
    features: {
      eyebrow: "Astaamaha",
      title: "Wax kasta oo xafiisku u baahan yahay. Wax aan baran karin.",
      sub: "Astaan kasta waxay kugu celinaysaa waqti ama lacag — bal eeg waxaad heli doonto.",
      snapshotLabel: "Dashboard-ka dugsigaagu mudan yahay",
      cards: [
        {
          title: "Diiwaankaaga oo dhan, raadi ilbiriqsiyo",
          body: "Waxaad heli doontaa arday kasta oo leh lambarka, fasalka, waalidka iyo haraagaaga liis nadiif ah — ardayda si mid mid loogu daro ama CSV kasta oo la soo dejiyo.",
          proof: "Madaxdu waxay arday kasta heli doonaan 5 ilbiriqsi gudahood.",
        },
        {
          title: "Lacag bixin la duubay 10 ilbiriqsi gudahood",
          body: "Lacag kasta waxaa lagu kaydsan doonaa habka, bisha iyo lambarka rasiidhka — foomku isagaa buuxinaya lacagta fasalka markaad ardayda doorato.",
          proof: "Dugsiyadu waxay diiwaan geliyaan 40+ lacag ka hor nasashada.",
        },
        {
          title: "Xasuusin hal riix ku shaqaysa",
          body: "Fariin deggan oo diyaar ah ayaa lagu furaa waalidka saxda ah — lambarrada si toos ah +252 loogu habeeyaa, fariintuna isu qortaa.",
          proof: "Dugsiyadu waxay soo celiyaan $200+ bil kasta xasuusin usbuucaale ah.",
        },
        {
          title: "Tiradaada, si toos ah",
          body: "La soo ururiyay, harsan, kuwa bixiyay iyo kuwa aan bixin — markaad app-ka furto — dashboard-ku wuu is cusboonaadaa lacag kasta.",
          proof: "Isniinta loomu sugan inaad ogaato xaaladda lacagta.",
        },
        {
          title: "Rasiidh waalidku rumaysto",
          body: "Rasiidh rasmiya oo lambarsan oo leh magaca iyo xiriirka dugsigaaga — daabici karto, PDF kaydsi, WhatsApp u dir waalidka.",
          proof: "Muramkii lacag bixinta wuu yaraadaa ilaa eber.",
        },
        {
          title: "Soomaali iyo English, hal riix",
          body: "Shaqaalaahaagu dhammaantood si fiican bay u akhriyi doonaan — app-ka wuxuu u beddelmaa English iyo Soomaali Dejinta.",
          proof: "Tababar eber oo loogu talagalay kuwa Soomaali jecel.",
        },
      ],
    },
    steps: {
      title: "Buug ilaa tiro — hal duhurnimo gudahood",
      sub: "Saddex tallaabo. Teknik yaan loo baahnayn.",
      items: [
        {
          title: "Ku dar dugsi, fasallo iyo arday",
          body: "Samee fasallada iyo lacagtooda bilaha, kadib ardayda mid mid ku dar ama Excel ka koobeeli diiwaankaaga oo dhan. Waxaan sidaana kuu sameyn karnaa WhatsApp.",
        },
        {
          title: "Diiwaan geli lacagaha imanaya",
          body: "Raadi ardayda, xaqiiji lacagta, dhamaatay — EVC Plus, Zaad, Cash ama Bank. Rasiidhku isagaa isu abuurmaa, daabac ama dir.",
        },
        {
          title: "La soco cida bixisay — xusuusi cida kale",
          body: "Dashboard-ku iyo warbixinta bishu waxay tusaa cida deyn tahay. Hal riix ayaa furaya xasuusin diyaar ah WhatsApp waalidkaas. Adigu riix dir.",
        },
      ],
      ttv: "Dugsiyada badan waxay arkaan bilkoodii ugu horreeyay ee dhamaystiran 30 maalmood gudahood.",
    },
    testimonials: {
      title: "Madax isbeddeshay",
      sub: "Tusaalooyin — ku beddel erayada macaamiishaaga ugu horreeya.",
      receiptsCaption: "Waalidiintu waxay jecel yihiin rasiidh degdeg ah oo rasmi ah.",
      reportsCaption: "Ogaw tiradaada. Bil kasta.",
      items: [
        {
          quote: "Waxaan lumin jiray cida bixisay bisha Oktoobar markay Noofember timaado. Hadda 5 ilbiriqsi ayaan ku arkaa — xasuusintuna waxay soo celisay qiyaastii $250 aan lumin jiray.",
          name: "Mudane A., Agaasime",
          role: "Agaasime, Muqdisho",
          badge: "Soo celiya ~$250/bishii",
        },
        {
          quote: "Shaqadii Isniinta muddo 3 saacadood ilaa 20 daqiiqo. Rasiidhkii isla markiiba wuu joojiyay murankii albaabka.",
          name: "Marwo H., Maamule",
          role: "Maamule, Hargeysa",
          badge: "Keydisa 11 saac/bishii",
        },
        {
          quote: "Tikniyoolajiyad uma fiicna, laakiin dejintaan anigoo taleefo ka wacay kooxooda isku sameeyay. Shaqaalaheygu dhammaantood waxay ku shaqeeyaan Soomaali.",
          name: "Mudane F., Mulkiile",
          role: "Mulkiile, Boosaaso",
          badge: "Dejin hal wicitaan",
        },
      ],
    },
    faq: {
      title: "Su'aalaha madaxdu noo weydiiyaan",
      items: [
        { q: "Ma ku shaqeeyaa taleefankayga Android?", a: "Haa — DuqsiPay wuxuu u dhismaa Android Chrome marka hore. Wuxuu kaloo ku shaqeeyaa kombuyutar iyo iPhone browser. Wax aan la rakibin oo aan la cusboonaysiin." },
        { q: "Maxaa dhacay haddii aanan tikniyoolajiyad aqoon?", a: "Haddii aad fariin WhatsApp diri karto, DuqsiPay waad maamuli kartaa. Dejintana kuma sameysid keligaa — dadaal iyo tababar WhatsApp hal wicitaan ayaan kaa sameynaa." },
        { q: "Haddaba WhatsApp iyo Excel waan u isticmaalaa — maxaa isbeddelay?", a: "Hayso WhatsApp — waxaan u sameynaa ka caqli badan. DuqsiPay wuxuu buuxiyaa fariinta isagoo xusuusanaya cida loo diray. Excel kuma xusuusin karo waalid, kama joojin karo muran, kama tirin karo bishaada." },
        { q: "Xogta dugsigaygu ma ammaan miyaa?", a: "Xogtaadu waxay ku nooshahay meel kaa gaar ah — lama wadaago dugsiyo kale. Kayd buuxa hal guji kad soo dejisana waqti kasta, diiwaan lacago lehna weligiis si khalad ah looma tirtiro." },
        { q: "Maxaa dhacay haddii aan joojin rabo?", a: "Jooji waqti kasta hal fariin — qandaraas ma jiro. Wax kasta oo aad soo dejisatay waad heysataa, xogtaadana waligay ku qaban mayno." },
        { q: "Waalidiintu ma rakibanayaan wax cusub?", a: "Maya. Waalidiintu waxay ku heli doonaan rasiidh iyo xasuusin WhatsApp-kooda caadiga ah. Wax aan la rakibin, wax aan la baran." },
        { q: "Taageero Soomaali miyaa jirtaa?", a: "Haa — kooxdeenna dejinta iyo taageeradu waxay ku hadlaan Soomaali iyo English. Maalinta shaqo fariin noo dir, qof ayaad la hadli doontaa, bot-na ma aha." },
        { q: "Ma ka wanaagsan tahay shaqaale kale oo la qofaysado?", a: "Shaqaaluhu wuxuu ku kacayaa $150–$250 bil kasta isagoo buuggana qalad ku sameeya. DuqsiPay wuxuu shaqaddaas kuu sameeyaa toban meher ka mid — isaguna wuu kuu xoraynayaa shaqo qof u baahan." },
      ],
    },
    finalCta: {
      eyebrow: "Isniintii ugu dambeysay ee buug",
      headline: "Bisha soo socota, soo ururi wax kasta oo laguu leeyahay.",
      sub: "Arag demo-ga toos ah hadda — haddii uusan 3 daqiiqo kula caddeyn inuu kuu fudud yahay, ha iibsan.",
      cta: "Arag demo toos ah",
      waCta: "Ama WhatsApp nala soo xiriir →",
      badges: ["Kaarka looma baahna", "Jooji waqti kasta", "Taageero Soomaali", "Kayd waqti kasta"],
    },
    footer: {
      tagline: "Lacagaha dugsi, si cad.",
      cols: [
        { title: "Badeecada", links: ["Demo toos ah", "Astaamaha", "Qiimaha", "Safarka badeecada"] },
        { title: "Shirkadda", links: ["Nagu saabsan", "Gal akoonka", "Sameyso akoon", "Qorshayaasha"] },
        { title: "Taageero", links: ["WhatsApp taageero", "Caawimaad dejin", "Su'aalaha", "Tijaabi demo-ga"] },
      ],
      waLine: "Hadal ma jeceshahay? WhatsApp noo soo dir — Soomaali ama English ayaan kuu jawaabnaa.",
      copyright: "© {year} DuqsiPay — Muqdisho, Soomaaliya",
      legal: ["Qarsoodi", "Shuruud"],
    },
  },
};

export function interpolate(text: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), text);
}
