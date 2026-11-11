/* Mithra Bhakti — Song & Mantra Books (v1.9, additive; no existing file logic is replaced)
   Menu -> Devotional Tools -> "Song & Mantra Books". Ready-made classic texts (all traditional / public domain)
   that add to Songs & Lyrics in one tap, exactly like the Stotram Library.
   Writes only to the existing 'songs' key (same shape as Songs & Lyrics), so Smart Backup already includes them.
   Texts are typed from tradition: please verify against your family's / temple's trusted book. */
(() => {
'use strict';
const MB = window.MB; if (!MB) return;
const $ = s => document.querySelector(s), get = MB.get, set = MB.set, esc = MB.esc, toast = MB.toast;
const nl = s => esc(s).replace(/\n/g, '<br>');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const BOOKS = [
 { id: 'hanuman', t: 'ஹனுமான் சாலீசா', en: 'Hanuman Chalisa · Tulsidas (16th c.)', songs: [
  { t: 'ஹனுமான் சாலீசா', d: 'Hanuman', c: 'Stotram', m: 'Forty verses in praise of Hanuman, by Goswami Tulsidas.',
    ta: `ஸ்ரீகுரு சரண ஸரோஜ ரஜ நிஜ மன முகுர ஸுதாரி
வரணௌ ரகுவர விமல ஜஸு ஜோ தாயகு பல சாரி

புத்தி ஹீன தனு ஜானிகே ஸுமிரௌ பவன குமார
பல புத்தி வித்யா தேஹு மோஹி ஹரஹு கலேஶ விகார

ஜய ஹனுமான ஜ்ஞான குண ஸாகர
ஜய கபீஶ திஹு லோக உஜாகர

ராம தூத அதுலித பலதாமா
அஞ்ஜனி புத்ர பவனஸுத நாமா

மஹாவீர விக்ரம பஜரங்கீ
குமதி நிவார ஸுமதி கே ஸங்கீ

கஞ்சன வரண விராஜ ஸுவேஶா
கானன குண்டல குஞ்சித கேஶா

ஹாத வஜ்ர ஔ த்வஜா விராஜை
காந்தே மூஞ்ச ஜனேவூ ஸாஜை

ஶங்கர ஸுவன கேஸரீ நந்தன
தேஜ ப்ரதாப மஹா ஜக வந்தன

வித்யாவான குணீ அதி சாதுர
ராம காஜ கரிபே கோ ஆதுர

ப்ரபு சரித்ர ஸுனிபே கோ ரஸியா
ராம லகன ஸீதா மன பஸியா

ஸூக்ஷ்ம ரூப தரி ஸியஹி திகாவா
விகட ரூப தரி லங்க ஜராவா

பீம ரூப தரி அஸுர ஸம்ஹாரே
ராமசந்த்ர கே காஜ ஸம்வாரே

லாய ஸஞ்ஜீவன லகன ஜியாயே
ஶ்ரீரகுவீர ஹரஷி உர லாயே

ரகுபதி கீன்ஹீ பஹுத படாஈ
தும மம ப்ரிய பரதஹி ஸம பாஈ

ஸஹஸ பதன தும்ஹரோ ஜஸ காவை
அஸ கஹி ஶ்ரீபதி கண்ட லகாவை

ஸனகாதிக ப்ரஹ்மாதி முனீஶா
நாரத ஶாரத ஸஹித அஹீஶா

யம குபேர திகபால ஜஹா தே
கபி கோபித கஹி ஸகே கஹா தே

தும உபகார ஸுக்ரீவஹி கீன்ஹா
ராம மிலாய ராஜபத தீன்ஹா

தும்ஹரோ மந்த்ர விபீஷண மானா
லங்கேஶ்வர பயே ஸப ஜக ஜானா

ஜுக ஸஹஸ்ர ஜோஜன பர பானூ
லீல்யோ தாஹி மதுர பல ஜானூ

ப்ரபு முத்ரிகா மேலி முக மாஹீ
ஜலதி லாங்கி கயே அசரஜ நாஹீ

துர்கம காஜ ஜகத கே ஜேதே
ஸுகம அனுக்ரஹ தும்ஹரே தேதே

ராம துஆரே தும ரகவாரே
ஹோத ந ஆஜ்ஞா பினு பைஸாரே

ஸப ஸுக லஹை தும்ஹாரீ ஸரனா
தும ரக்ஷக காஹூ கோ டர நா

ஆபன தேஜ ஸம்ஹாரோ ஆபை
தீனோ லோக ஹாங்க தே காம்பை

பூத பிஶாச நிகட நஹி ஆவை
மஹாபீர ஜப நாம ஸுனாவை

நாஸை ரோக ஹரை ஸப பீரா
ஜபத நிரந்தர ஹனுமத பீரா

ஸங்கட ஸே ஹனுமான சுடாவை
மன க்ரம வசன த்யான ஜோ லாவை

ஸப பர ராம தபஸ்வீ ராஜா
தின கே காஜ ஸகல தும ஸாஜா

ஔர மனோரத ஜோ கோஈ லாவை
ஸோஈ அமித ஜீவன பல பாவை

சாரோ ஜுக பரதாப தும்ஹாரா
ஹை பரஸித்த ஜகத உஜியாரா

ஸாது ஸந்த கே தும ரக்வாரே
அஸுர நிகந்தன ராம துலாரே

அஷ்ட ஸித்தி நௌ நிதி கே தாதா
அஸ பர தீன்ஹ ஜானகீ மாதா

ராம ரஸாயன தும்ஹரே பாஸா
ஸதா ரஹோ ரகுபதி கே தாஸா

தும்ஹரே பஜன ராம கோ பாவை
ஜனம ஜனம கே துக பிஸராவை

அந்த கால ரகுபர புர ஜாஈ
ஜஹா ஜன்ம ஹரிபக்த கஹாஈ

ஔர தேவதா சித்த ந தரஈ
ஹனுமத ஸேஈ ஸர்வ ஸுக கரஈ

ஸங்கட கடை மிடை ஸப பீரா
ஜோ ஸுமிரை ஹனுமத பலபீரா

ஜை ஜை ஜை ஹனுமான கோஸாயீ
க்ருபா கரஹு குருதேவ கீ நாயீ

ஜோ ஶத பார பாட கர கோயீ
சூடஹி பந்தி மஹா ஸுக ஹோயீ

ஜோ யஹ படை ஹனுமான சாலீஸா
ஹோய ஸித்தி ஸாகீ கௌரீஸா

துலஸீதாஸ ஸதா ஹரி சேரா
கீஜை நாத ஹ்ருதய மஹ டேரா

பவனதனய ஸங்கட ஹரண மங்கல மூரதி ரூப
ராம லகன ஸீதா ஸஹித ஹ்ருதய பஸஹு ஸுர பூப` }
 ]},

 { id: 'slokas', t: 'ஸ்லோகங்கள் & மந்திரங்கள்', en: 'Classic slokas · one for each deity', songs: [
  { t: 'வக்ரதுண்ட மஹாகாய (விநாயகர்)', d: 'Vinayagar', c: 'Slokam', m: 'O curved-trunked, mighty Lord with the brilliance of a million suns, remove all obstacles from my work.',
    ta: `வக்ரதுண்ட மஹாகாய ஸூர்யகோடி ஸமப்ரப
நிர்விக்னம் குரு மே தேவ ஸர்வகார்யேஷு ஸர்வதா` },
  { t: 'ஶுக்லாம்பரதரம் (விநாயகர்)', d: 'Vinayagar', c: 'Slokam', m: 'Dhyana sloka to remove all obstacles.',
    ta: `ஶுக்லாம்பரதரம் விஷ்ணும் ஶஶிவர்ணம் சதுர்புஜம்
ப்ரஸன்னவதனம் த்யாயேத் ஸர்வ விக்னோப ஶாந்தயே` },
  { t: 'கர்ப்பூர கௌரம் (சிவன்)', d: 'Shiva', c: 'Slokam', m: 'Salutations to Shiva, camphor-white, an incarnation of compassion, who dwells in the lotus of the heart with Bhavani.',
    ta: `கர்ப்பூர கௌரம் கருணாவதாரம்
ஸம்ஸார ஸாரம் புஜகேந்த்ர ஹாரம்
ஸதா வஸந்தம் ஹ்ருதயாரவிந்தே
பவம் பவானீ ஸஹிதம் நமாமி` },
  { t: 'ஷடாநநம் (முருகன்)', d: 'Murugan', c: 'Slokam', m: 'I take refuge in Guha (Murugan), the six-faced, who rides the divine peacock.',
    ta: `ஷடாநநம் சந்தன லேபிதாங்கம்
மஹோரஸம் திவ்ய மயூர வாஹனம்
ருத்ரஸ்ய ஸூனும் ஸுரஸைன்ய நாதம்
குஹம் ஸதா சரணம் அஹம் ப்ரபத்யே` },
  { t: 'ஶாந்தாகாரம் (பெருமாள்)', d: 'Perumal', c: 'Slokam', m: 'Salutations to Vishnu, serene, reclining on the serpent, lotus-navelled, lord of all worlds.',
    ta: `ஶாந்தாகாரம் புஜகஶயனம் பத்மநாபம் ஸுரேஶம்
விஶ்வாதாரம் ககனஸத்ருஶம் மேகவர்ணம் ஶுபாங்கம்
லக்ஷ்மீகாந்தம் கமலநயனம் யோகிஹ்ருத்த்யானகம்யம்
வந்தே விஷ்ணும் பவபயஹரம் ஸர்வலோகைகநாதம்` },
  { t: 'ஶ்ரீ ராம ராம ராமேதி (ராமர்)', d: 'Perumal', c: 'Slokam', m: 'Saying the name Rama once equals reciting the thousand names of Vishnu.',
    ta: `ஶ்ரீ ராம ராம ராமேதி ரமே ராமே மனோரமே
ஸஹஸ்ரநாம தத்துல்யம் ராம நாம வரானனே` },
  { t: 'கிருஷ்ணாய வாஸுதேவாய (கிருஷ்ணன்)', d: 'Perumal', c: 'Slokam', m: 'Salutations to Krishna, Vasudeva, Hari, the Supreme Self, remover of the sorrows of those who bow.',
    ta: `க்ருஷ்ணாய வாஸுதேவாய ஹரயே பரமாத்மனே
ப்ரணத க்லேச நாஶாய கோவிந்தாய நமோ நம:` },
  { t: 'காயேன வாசா மனஸா (நாராயண ஸமர்ப்பணம்)', d: 'Perumal', c: 'Slokam', m: 'Whatever I do with body, speech, mind and senses, I offer it all to Narayana.',
    ta: `காயேன வாசா மனஸேந்த்ரியைர்வா
புத்த்யாத்மனா வா ப்ரக்ருதே: ஸ்வபாவாத்
கரோமி யத்யத் ஸகலம் பரஸ்மை
நாராயணாயேதி ஸமர்ப்பயாமி` },
  { t: 'பூதநாத ஸதானந்த (ஐயப்பன்)', d: 'Ayyappan', c: 'Slokam', m: 'Salutations to Shasta, lord of beings and ever-blissful, compassionate to all; protect me.',
    ta: `பூதநாத ஸதானந்த ஸர்வ பூத தயாபர
ரக்ஷ ரக்ஷ மஹாபாஹோ ஶாஸ்த்ரே துப்யம் நமோ நம:` },
  { t: 'யா தேவீ ஸர்வபூதேஷு (அம்மன்)', d: 'Amman', c: 'Slokam', m: 'To the Goddess who dwells in all beings as Shakti, salutations again and again.',
    ta: `யா தேவீ ஸர்வபூதேஷு ஶக்தி ரூபேண ஸம்ஸ்திதா
நமஸ்தஸ்யை நமஸ்தஸ்யை நமஸ்தஸ்யை நமோ நம:` },
  { t: 'ஸர்வமங்கல மாங்கல்யே (அம்மன்)', d: 'Amman', c: 'Slokam', m: 'O auspicious one, fulfiller of all aims, refuge, Gauri, Narayani, salutations to you.',
    ta: `ஸர்வமங்கல மாங்கல்யே ஶிவே ஸர்வார்த்த ஸாதிகே
ஶரண்யே த்ர்யம்பகே கௌரி நாராயணி நமோஸ்துதே` },
  { t: 'ஸரஸ்வதி நமஸ்துப்யம்', d: 'Amman', c: 'Slokam', m: 'Salutations to Saraswati, giver of boons; I begin my studies, may I always succeed.',
    ta: `ஸரஸ்வதி நமஸ்துப்யம் வரதே காமரூபிணி
வித்யாரம்பம் கரிஷ்யாமி ஸித்திர்பவது மே ஸதா` },
  { t: 'குரு ப்ரஹ்மா (குரு வந்தனம்)', d: 'Other', c: 'Slokam', m: 'The Guru is Brahma, Vishnu and Maheshwara; the Guru is the Supreme Brahman itself; salutations to that Guru.',
    ta: `குருர் ப்ரஹ்மா குருர் விஷ்ணு: குருர் தேவோ மஹேஶ்வர:
குரு: ஸாக்ஷாத் பரப்ரஹ்ம தஸ்மை ஶ்ரீகுரவே நம:` },
  { t: 'ஜபா குஸும (ஸூர்ய நமஸ்காரம்)', d: 'Other', c: 'Slokam', m: 'I bow to Surya, radiant as the hibiscus, son of Kashyapa, destroyer of darkness and sin.',
    ta: `ஜபா குஸும ஸங்காஶம் காஶ்யபேயம் மஹாத்யுதிம்
தமோரிம் ஸர்வ பாபக்னம் ப்ரணதோஸ்மி திவாகரம்` },
  { t: 'அஸதோ மா ஸத்கமய', d: 'Other', c: 'Slokam', m: 'Lead me from untruth to truth, from darkness to light, from death to immortality.',
    ta: `அஸதோ மா ஸத்கமய
தமஸோ மா ஜ்யோதிர்கமய
ம்ருத்யோர்மா அம்ருதம் கமய` },
  { t: 'ஸஹ நாவவது (சாந்தி மந்திரம்)', d: 'Other', c: 'Slokam', m: 'May we be protected together, nourished together, work together with vigour; may our learning be bright; let there be no hatred. Peace.',
    ta: `ஓம் ஸஹ நாவவது ஸஹ நௌ புனக்து
ஸஹ வீர்யம் கரவாவஹை
தேஜஸ்வி நாவதீதமஸ்து மா வித்விஷாவஹை
ஓம் ஶாந்தி: ஶாந்தி: ஶாந்தி:` },
  { t: 'லோகா: ஸமஸ்தா: ஸுகினோ பவந்து', d: 'Other', c: 'Slokam', m: 'May all beings in all the worlds be happy.',
    ta: `லோகா: ஸமஸ்தா: ஸுகினோ பவந்து` }
 ]},

 { id: 'tamil', t: 'தமிழ் பக்திப் பாடல்கள்', en: 'Thirumurai · Thiruppavai · Thirumanthiram (selections)', songs: [
  { t: 'நாமார்க்கும் குடியல்லோம் (அப்பர் தேவாரம்)', d: 'Shiva', c: 'Thevaram', m: 'Appar: devoted to Shiva, we fear no one — not even death — and have no sorrow.',
    ta: `நாமார்க்கும் குடியல்லோம் நமனை அஞ்சோம்
நரகத்தில் இடர்ப்படோம் நடலை இல்லோம்
ஏமாப்போம் பிணியறியோம் பணிவோம் அல்லோம்
இன்பமே எந்நாளும் துன்பம் இல்லை
தாமார்க்கும் குடியல்லாத் தன்மையான
சங்கரன் நற்சங்கவெண் குழையோர் காதில்
கோமாற்கே நாமென்றும் மீளா ஆளாய்க்
கொய்ம்மலர்ச் சேவடியினையே குறுகினோமே` },
  { t: 'மாசில் வீணையும் (அப்பர் தேவாரம்)', d: 'Shiva', c: 'Thevaram', m: 'Appar: the shade of Shiva\'s feet is as soothing as a flawless veena, the evening moon and the cool breeze.',
    ta: `மாசில் வீணையும் மாலை மதியமும்
வீசு தென்றலும் வீங்கிள வேனிலும்
மூசு வண்டறை பொய்கையும் போன்றதே
ஈசன் எந்தை இணையடி நீழலே` },
  { t: 'நமச்சிவாய வாழ்க (சிவபுராணம் – தொடக்கம்)', d: 'Shiva', c: 'Thevaram', m: 'Opening lines of Manikkavasagar\'s Sivapuranam (Thiruvasagam). Only the opening lines are included here.',
    ta: `நமச்சிவாய வாழ்க நாதன் தாள் வாழ்க
இமைப்பொழுதும் என் நெஞ்சில் நீங்காதான் தாள் வாழ்க
கோகழி ஆண்ட குருமணிதன் தாள் வாழ்க
ஆகமம் ஆகி நின்று அண்ணிப்பான் தாள் வாழ்க
ஏகன் அநேகன் இறைவன் அடி வாழ்க` },
  { t: 'அன்பே சிவம் (திருமந்திரம்)', d: 'Shiva', c: 'Other', m: 'Thirumoolar: love and Shiva are one.',
    ta: `அன்பும் சிவமும் இரண்டென்பர் அறிவிலார்
அன்பே சிவமாவது ஆரும் அறிகிலார்
அன்பே சிவமாவது ஆரும் அறிந்தபின்
அன்பே சிவமாய் அமர்ந்திருப்பாரே` },
  { t: 'ஒன்றே குலமும் (திருமந்திரம்)', d: 'Other', c: 'Other', m: 'Thirumoolar: one community, one God.',
    ta: `ஒன்றே குலமும் ஒருவனே தேவனும்
நன்றே நினைமின் நமனில்லை ஆகுமே` },
  { t: 'மார்கழித் திங்கள் (திருப்பாவை – பாசுரம் 1)', d: 'Perumal', c: 'Pasuram', m: 'Andal, Thiruppavai verse 1 (Margazhi). Only the first verse is included here.',
    ta: `மார்கழித் திங்கள் மதிநிறைந்த நன்னாளால்
நீராடப் போதுவீர் போதுமினோ நேரிழையீர்
சீர்மல்கும் ஆய்ப்பாடிச் செல்வச் சிறுமீர்காள்
கூர்வேல் கொடுந்தொழிலன் நந்தகோபன் குமரன்
ஏரார்ந்த கண்ணி யசோதை இளஞ்சிங்கம்
கார்மேனிச் செங்கண் கதிர்மதியம் போல்முகத்தான்
நாரா யணனே நமக்கே பறைதருவான்
பாரோர் புகழப் படிந்தேலோர் எம்பாவாய்` }
 ]}
];

const have = () => new Set(get('songs', []).map(s => s.title));

function page() {
  const h = have();
  return `${MB.header('Song & Mantra Books', 'பாடல் & மந்திர நூல்கள் — ஒரு தட்டலில் உங்கள் Songs-ல் சேர்க்கலாம்.')}
  ${BOOKS.map(b => {
    const left = b.songs.filter(s => !h.has(s.t)).length;
    return `<section class="card bx-card bl-book"><div class="bx-lib-head"><div><b>${esc(b.t)}</b><small class="bx-tr">${esc(b.en)}</small></div><span class="bx-tag">${b.songs.length}</span></div>
    <div class="bx-actions"><button class="btn ${left ? 'gold' : 'soft'}" data-bl-all="${b.id}" ${left ? '' : 'disabled'}>${left ? `+ Add all (${left}) to my Songs` : '✓ All in your Songs'}</button></div>
    ${b.songs.map((s, i) => `<details class="bl-item"><summary><span>${esc(s.t)}</span><span class="bx-tag">${esc(s.d)}</span></summary>
      <div class="bx-ta">${nl(s.ta)}</div><p class="bx-m">${esc(s.m || '')}</p>
      <div class="bx-actions"><button class="btn ${h.has(s.t) ? 'soft' : 'gold'}" data-bl-add="${b.id}:${i}" ${h.has(s.t) ? 'disabled' : ''}>${h.has(s.t) ? '✓ In your Songs' : '+ Add to my Songs'}</button></div></details>`).join('')}</section>`;
  }).join('')}
  <p class="feature-note">All texts here are traditional classics (public domain). Modern film or album songs are not included because they are copyrighted. Texts are typed from tradition — please verify with your family's or temple's trusted book, and fix any word in Songs → Edit.</p>`;
}

function addOne(arr, s) {
  if (arr.some(x => x.title === s.t)) return false;
  arr.push({ id: uid(), fav: false, createdAt: new Date().toISOString(), title: s.t, lyrics: s.ta, deity: s.d, category: s.c, mediaId: '' });
  return true;
}

MB.pages.songBooks = page;

function inject() {
  /* Explore Menu overlay: add the entry to the LIBRARY group */
  const sc = $('#premiumMenuOverlay .premium-menu-scroll');
  if (sc && !sc.querySelector('[data-go="songBooks"]')) {
    const entry = '<button class="premium-menu-item" data-go="songBooks"><span class="premium-menu-icon">📖</span><span class="premium-menu-copy"><b>Song & Mantra Books</b><small>Chalisa, slokas, Thirumurai</small></span><span class="premium-menu-arrow">›</span></button>';
    const lib = [...sc.querySelectorAll('.premium-menu-group')].find(g => { const h = g.querySelector('h3'); return h && h.textContent.trim() === 'LIBRARY'; });
    const grid = lib && lib.querySelector('.premium-menu-grid');
    if (grid) grid.insertAdjacentHTML('beforeend', entry);
    else sc.insertAdjacentHTML('afterbegin', `<section class="premium-menu-group"><h3>LIBRARY</h3><div class="premium-menu-grid">${entry}</div></section>`);
  }
  const root = $('#pageContent'); if (!root) return;
  const p = MB.state && MB.state.page;
  if (p === 'more' && !root.querySelector('[data-go="songBooks"]')) {
    const item = '<button data-go="songBooks"><span>📖</span><div><b>Song & Mantra Books</b><small>Hanuman Chalisa, slokas, Thirumurai</small></div>›</button>';
    const fm = root.querySelector('.feature-menu');
    if (fm) fm.insertAdjacentHTML('beforeend', item);
    else { const s = document.createElement('section'); s.innerHTML = `<div class="section-head"><h2>Devotional Tools</h2></div><div class="more-list card feature-menu">${item}</div>`; root.append(s); }
  }
}
const prevAfter = MB.after; MB.after = () => { prevAfter && prevAfter(); try { inject(); } catch (e) { console.error('Song & Mantra Books', e); } };

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const d = b.dataset;
  if (d.blAdd) {
    const [id, i] = d.blAdd.split(':'); const bk = BOOKS.find(x => x.id === id), s = bk && bk.songs[Number(i)]; if (!s) return;
    const a = get('songs', []);
    if (addOne(a, s)) { set('songs', a); MB.render(); toast('Added to Songs & Lyrics'); } else toast('Already in your Songs');
  } else if (d.blAll) {
    const bk = BOOKS.find(x => x.id === d.blAll); if (!bk) return;
    const a = get('songs', []); let n = 0; bk.songs.forEach(s => { if (addOne(a, s)) n++; });
    if (n) { set('songs', a); MB.render(); toast(`${n} added to Songs & Lyrics`); } else toast('Already in your Songs');
  }
});
})();
