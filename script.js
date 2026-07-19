const liveHeadingEl = document.querySelector('[data-live-heading]');
const liveStatusEl = document.querySelector('[data-live-status]');
const scrollHint = document.querySelector('[data-scroll-hint]');

const WEDDING_TIMES = Object.freeze({
    dayStart: Date.parse('2026-07-22T21:00:00Z'),
    ceremonySoon: Date.parse('2026-07-23T10:20:00Z'),
    ceremonyEnd: Date.parse('2026-07-23T11:20:00Z'),
    receptionStart: Date.parse('2026-07-23T12:00:00Z'),
    celebrationStart: Date.parse('2026-07-23T13:00:00Z'),
    celebrationEnd: Date.parse('2026-07-23T18:00:00Z'),
    nextDay: Date.parse('2026-07-23T21:00:00Z')
});

function getWeddingDayCopy(now = Date.now()) {
    if (now < WEDDING_TIMES.dayStart) {
        return {
            heading: 'скоро наш день',
            status: 'загляните сюда 23 июля'
        };
    }

    if (now < WEDDING_TIMES.ceremonySoon) {
        return {
            heading: 'сегодня наш день',
            status: 'совсем скоро мы скажем да'
        };
    }

    if (now < WEDDING_TIMES.ceremonyEnd) {
        return {
            heading: 'сегодня наш день',
            status: 'сейчас начинается наша история'
        };
    }

    if (now < WEDDING_TIMES.receptionStart) {
        return {
            heading: 'теперь мы семья',
            status: 'время обниматься и ехать праздновать'
        };
    }

    if (now < WEDDING_TIMES.celebrationStart) {
        return {
            heading: 'теперь мы семья',
            status: 'время встречаться и поднимать бокалы'
        };
    }

    if (now < WEDDING_TIMES.celebrationEnd) {
        return {
            heading: 'теперь мы семья',
            status: 'праздник уже начался, ждем вас в шатре'
        };
    }

    if (now < WEDDING_TIMES.nextDay) {
        return {
            heading: 'теперь мы семья',
            status: 'спасибо, что разделили этот день с нами'
        };
    }

    return {
        heading: 'теперь мы семья',
        status: 'добавляйте ваши кадры в общую фотопленку'
    };
}

function setArcCopy(element, text) {
    if (!element) return;

    const isLong = text.length > 31;
    const isVeryLong = text.length > 38;

    element.textContent = text;
    element.classList.toggle('is-long', isLong && !isVeryLong);
    element.classList.toggle('is-very-long', isVeryLong);

    // Не растягиваем текст через textLength: на textPath некоторые браузеры
    // из-за этого обрезают первые и последние буквы. Длинные фразы
    // помещаются за счет отдельного размера шрифта в CSS.
    element.removeAttribute('textLength');
    element.removeAttribute('lengthAdjust');
}

function updateWeddingDayCopy() {
    const copy = getWeddingDayCopy();
    setArcCopy(liveHeadingEl, copy.heading);
    setArcCopy(liveStatusEl, copy.status);
}

function hideScrollHint() {
    if (!scrollHint || scrollHint.classList.contains('is-hidden')) return;
    scrollHint.classList.add('is-hidden');
    try {
        sessionStorage.setItem('weddingScrollHintSeen', '1');
    } catch (error) {
        // Подсказка просто исчезнет до следующей загрузки страницы.
    }
    window.removeEventListener('scroll', handleFirstScroll);
}

function handleFirstScroll() {
    if (window.scrollY > 36) hideScrollHint();
}

updateWeddingDayCopy();
setInterval(updateWeddingDayCopy, 30000);

if (scrollHint) {
    try {
        if (sessionStorage.getItem('weddingScrollHintSeen') === '1') {
            scrollHint.classList.add('is-hidden');
        }
    } catch (error) {
        // sessionStorage может быть недоступен в приватном режиме.
    }

    scrollHint.addEventListener('click', hideScrollHint);
    window.addEventListener('scroll', handleFirstScroll, { passive: true });
}

const googleCalendarLink = document.querySelector('#googleCalendarLink');

if (googleCalendarLink) {
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: 'Свадьба Ксении и Александра',
        dates: '20260723T105000Z/20260723T180000Z',
        details: [
            '13:50–14:20 — роспись в РАГС Петродворцового района',
            '15:00–16:00 — фуршет возле Гранд Петергофа',
            '16:00–21:00 — мероприятие в шатре Гранд Петергоф'
        ].join('\n'),
        location: 'РАГС Петродворцового района; Гранд Петергоф отель'
    });

    googleCalendarLink.href = `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const PUBLIC_CONFIG = window.WEDDING_APP_CONFIG || {};
const PHOTO_UPLOAD_SETTINGS = {
    publicKey: String(PUBLIC_CONFIG.uploadcarePublicKey || '').trim(),
    workerUrl: String(PUBLIC_CONFIG.workerUrl || '').trim().replace(/\/$/, ''),
    signedUploads: PUBLIC_CONFIG.signedUploads === true,
    endpoint: 'https://upload.uploadcare.com/base/',
    maxFilesPerGuest: Math.max(1, Number(PUBLIC_CONFIG.maxFilesPerGuest) || 21),
    maxFileSize: 99 * 1024 * 1024,
    concurrentUploads: 3,
    eventTag: 'ksenia-aleksandr-wedding-2026'
};

const PHOTO_MISSIONS = [
    'сфотографируйте самый красивый букет в зале',
    'поймайте отражение праздничных огней в бокале',
    'снимите общий план шатра, когда он особенно красиво светится',
    'найдите самый милый элемент декора и сохраните его крупным планом',
    'сфотографируйте карточку своего стола рядом с праздничными деталями',
    'снимите цветы так, будто это кадр из старого семейного альбома',
    'найдите красивое сочетание свадебных цветов в одном кадре',
    'сфотографируйте свечи или гирлянды в мягком расфокусе',
    'снимите сервировку стола до начала праздничного ужина',
    'поймайте солнечный луч на праздничном декоре',
    'сфотографируйте торт до того, как его разрежут',
    'снимите бокалы в момент общего тоста',
    'найдите красивую симметрию в оформлении площадки',
    'сфотографируйте самый уютный уголок праздника',
    'снимите кольца или руки молодожёнов красивым крупным планом',
    'найдите деталь, которая лучше всего передаёт настроение дня',
    'сфотографируйте праздничный стол сверху или немного по диагонали',
    'снимите приглашение, карточку или меню рядом с цветами',
    'поймайте красивую игру света и тени на скатерти',
    'сфотографируйте декор через бокал или прозрачный предмет',

    'сделайте тёплый портрет человека, сидящего рядом с вами',
    'сфотографируйте улыбки всей компании за вашим столом',
    'соберите в кадре всех гостей своего стола',
    'поймайте красивый момент дружеских объятий',
    'сделайте фотографию двух поколений одной семьи',
    'сфотографируйте гостей, которые давно не виделись',
    'поймайте самый искренний смех за вашим столом',
    'сделайте портрет гостя в его праздничном образе',
    'сфотографируйте компанию друзей в полный рост',
    'снимите момент, когда гости поднимают бокалы вместе',
    'сделайте красивое селфи со всей компанией своего стола',
    'сфотографируйте гостей на фоне самого красивого места площадки',
    'поймайте дружеский взгляд через стол',
    'сделайте фотографию с человеком, с которым сегодня познакомились',
    'снимите семейную фотографию, которую захочется распечатать',
    'сфотографируйте самый элегантный праздничный образ среди гостей',
    'поймайте момент, когда кто-то говорит красивый тост',
    'сделайте портрет человека с его любимым напитком',
    'сфотографируйте трёх гостей с одинаково радостными улыбками',
    'снимите вашу компанию в форме сердечка или полукруга',
    'сфотографируйте пару гостей, которые особенно красиво смотрятся вместе',
    'сделайте кадр «мы здесь были» со своим столом',
    'поймайте добрый момент между родственниками',
    'сфотографируйте гостей рядом с цветочной композицией',
    'сделайте красивый групповой портрет без спешки',
    'снимите момент вручения подарка или открытки',
    'сфотографируйте руки друзей, сложенные вместе',
    'поймайте улыбку человека сразу после приятного поздравления',
    'сделайте портрет гостя при мягком вечернем свете',
    'снимите компанию, которая дружит уже много лет',

    'сфотографируйте молодожёнов в красивом общем плане',
    'поймайте силуэт пары на фоне света или неба',
    'снимите руки молодожёнов с кольцами',
    'сфотографируйте пару среди цветов или зелени',
    'снимите первый танец издалека, захватив атмосферу зала',
    'поймайте красивый профиль пары во время спокойного момента',
    'сфотографируйте молодожёнов через гирлянды или цветы на переднем плане',
    'снимите отражение пары в зеркале, стекле или бокале',
    'поймайте момент, когда молодожёны держатся за руки',
    'сфотографируйте пару рядом с самой красивой частью декора',
    'снимите молодожёнов в окружении гостей',
    'поймайте красивый общий кадр пары во время поздравлений',
    'сфотографируйте букет в руках невесты крупным планом',
    'снимите детали образов молодожёнов рядом в одном кадре',
    'поймайте спокойный и тёплый кадр пары со спины',

    'сфотографируйте танцпол в момент, когда он заполнен гостями',
    'поймайте синхронное движение нескольких танцующих людей',
    'снимите красивые руки в воздухе под любимую песню',
    'сфотографируйте танец друзей широким кадром',
    'поймайте момент, когда все подпевают знакомой песне',
    'снимите общий план праздника во время музыки',
    'сфотографируйте свет на танцполе с небольшой выдержкой движения',
    'поймайте красивый поворот платья во время танца',
    'снимите круг гостей на танцполе',
    'сфотографируйте музыкантов, ведущего или диджея за работой',

    'сделайте кадр через цветы на переднем плане',
    'используйте отражение в ложке, бокале или зеркале',
    'сфотографируйте сцену строго симметрично',
    'сделайте минималистичный кадр только из двух-трёх деталей',
    'поймайте несколько планов в одном кадре: деталь, гостей и зал',
    'сфотографируйте праздничную сцену с очень низкой точки',
    'снимите кадр сквозь рамку, арку или ветви',
    'найдите в зале форму сердца и сфотографируйте её',
    'сделайте кадр, где главный герой находится не по центру',
    'сфотографируйте один цвет, который повторяется в разных деталях',
    'поймайте красивую тень от цветов, бокала или декора',
    'сделайте чёрно-белый по настроению кадр, даже если снимаете в цвете',
    'сфотографируйте момент через плечо другого гостя',
    'снимите праздничную сцену с гирляндами в расфокусе на переднем плане',
    'сделайте кадр, похожий на обложку романтического фильма',
    'найдите идеальную рамку внутри окружающего пространства',
    'сфотографируйте движение так, чтобы главный объект остался чётким',
    'снимите красивое отражение неба или света на поверхности',
    'сделайте фотографию с повторяющимися линиями или узорами',
    'поймайте маленький момент внутри большого праздника',

    'сфотографируйте самый красивый вид вокруг площадки',
    'поймайте вечернее небо над местом праздника',
    'снимите дорожку, ведущую к шатру или месту церемонии',
    'сфотографируйте природу рядом с праздничными огнями',
    'найдите красивый фон для портрета одного из гостей',
    'снимите общий вид площадки перед закатом',
    'сфотографируйте цветы или зелень рядом с архитектурой',
    'поймайте отражение площадки в воде или стекле',
    'снимите вид, который лучше всего запомнит это место',
    'сфотографируйте переход от дневного света к вечернему',

    'снимите фирменный кадр первого стола',
    'снимите фирменный кадр второго стола',
    'снимите фирменный кадр третьего стола',
    'снимите фирменный кадр четвёртого стола',
    'сфотографируйте соседний стол и передайте ему эстафету',
    'сделайте общий портрет своего стола с одинаковым жестом',
    'снимите красивый тост вашего стола',
    'сфотографируйте самое уютное общение за вашим столом',
    'сделайте кадр, который станет обложкой альбома вашего стола',
    'сфотографируйте всех за столом так, чтобы было видно оформление вокруг'
];

const missionText = document.querySelector('[data-photo-mission]');
const newMissionButton = document.querySelector('[data-new-mission]');
const missionDoneButton = document.querySelector('[data-mission-done]');
const missionsCompletedEl = document.querySelector('[data-missions-completed]');
const cameraButton = document.querySelector('[data-open-camera]');
const galleryButton = document.querySelector('[data-open-gallery]');
const cameraInput = document.querySelector('[data-camera-input]');
const galleryInput = document.querySelector('[data-gallery-input]');
const photoSelection = document.querySelector('[data-photo-selection]');
const photoPreview = document.querySelector('[data-photo-preview]');
const clearPhotosButton = document.querySelector('[data-clear-photos]');
const uploadPhotosButton = document.querySelector('[data-upload-photos]');
const uploadButtonText = document.querySelector('[data-upload-button-text]');
const uploadStatus = document.querySelector('[data-photo-upload-status]');
const filmLeftEl = document.querySelector('[data-film-left]');
const guestNameInput = document.querySelector('[data-photo-guest-name]');
const photoNoteInput = document.querySelector('[data-photo-note]');
const deviceCodeEls = document.querySelectorAll('[data-device-code], [data-refill-device-code]');
const filmRefill = document.querySelector('[data-film-refill]');
const checkRefillButton = document.querySelector('[data-check-refill]');
const toggleRedeemButton = document.querySelector('[data-toggle-redeem]');
const filmCodeForm = document.querySelector('[data-film-code-form]');
const filmCodeInput = document.querySelector('[data-film-code-input]');
const filmRefillStatus = document.querySelector('[data-film-refill-status]');
const filmCard = document.querySelector('.film-card');

const PHOTO_STORAGE_KEYS = {
    currentMission: 'weddingPhotoMission',
    recentMissions: 'weddingPhotoRecentMissions',
    completedMissions: 'weddingPhotoCompletedMissions',
    guestName: 'weddingPhotoGuestName',
    uploadedTotal: 'weddingPhotoUploadedTotal',
    deviceId: 'weddingPhotoDeviceId',
    pendingConfirmations: 'weddingPhotoPendingConfirmations',
    cachedFilmState: 'weddingPhotoCachedFilmState'
};

let selectedPhotos = [];
let isUploadingPhotos = false;
let serverFilmState = null;
let isSyncingFilmState = false;

function safeLocalStorageGet(key, fallback = '') {
    try {
        return localStorage.getItem(key) ?? fallback;
    } catch (error) {
        return fallback;
    }
}

function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        // Сайт продолжит работать, даже если браузер запретил localStorage.
    }
}

function safeJsonParse(value, fallback) {
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function isWorkerConfigured() {
    return Boolean(
        PHOTO_UPLOAD_SETTINGS.workerUrl
        && !PHOTO_UPLOAD_SETTINGS.workerUrl.includes('YOUR_CLOUDFLARE_WORKER_URL')
    );
}

function createDeviceId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `device-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function getDeviceId() {
    let deviceId = safeLocalStorageGet(PHOTO_STORAGE_KEYS.deviceId, '').trim();
    if (!deviceId) {
        deviceId = createDeviceId();
        safeLocalStorageSet(PHOTO_STORAGE_KEYS.deviceId, deviceId);
    }
    return deviceId;
}

function normalizeFilmState(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const baseLimit = Math.max(1, Number(raw.baseLimit) || PHOTO_UPLOAD_SETTINGS.maxFilesPerGuest);
    const bonusFrames = Math.max(0, Number(raw.bonusFrames) || 0);
    const uploadedCount = Math.max(0, Number(raw.uploadedCount) || 0);
    return {
        deviceId: String(raw.deviceId || getDeviceId()),
        shortCode: String(raw.shortCode || '').trim(),
        guestName: String(raw.guestName || ''),
        baseLimit,
        bonusFrames,
        uploadedCount,
        totalLimit: Math.max(baseLimit, Number(raw.totalLimit) || baseLimit + bonusFrames),
        remaining: Math.max(0, Number(raw.remaining) || (baseLimit + bonusFrames - uploadedCount))
    };
}

function loadCachedFilmState() {
    const cached = safeJsonParse(safeLocalStorageGet(PHOTO_STORAGE_KEYS.cachedFilmState, 'null'), null);
    const normalized = normalizeFilmState(cached);
    if (normalized && normalized.deviceId === getDeviceId()) serverFilmState = normalized;
}

function cacheFilmState(state) {
    const normalized = normalizeFilmState(state);
    if (!normalized) return;
    serverFilmState = normalized;
    safeLocalStorageSet(PHOTO_STORAGE_KEYS.cachedFilmState, JSON.stringify(normalized));
    safeLocalStorageSet(PHOTO_STORAGE_KEYS.uploadedTotal, String(normalized.uploadedCount));
}

async function apiRequest(path, { method = 'POST', body, adminPassword } = {}) {
    if (!isWorkerConfigured()) throw new Error('WORKER_NOT_CONFIGURED');

    const headers = { 'Content-Type': 'application/json' };
    if (adminPassword) headers.Authorization = `Bearer ${adminPassword}`;

    const response = await fetch(`${PHOTO_UPLOAD_SETTINGS.workerUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(payload.error || `HTTP_${response.status}`);
        error.status = response.status;
        error.payload = payload;
        throw error;
    }
    return payload;
}

function getPendingConfirmations() {
    const parsed = safeJsonParse(safeLocalStorageGet(PHOTO_STORAGE_KEYS.pendingConfirmations, '[]'), []);
    return Array.isArray(parsed)
        ? [...new Set(parsed.filter((item) => typeof item === 'string' && item.length >= 8))]
        : [];
}

function savePendingConfirmations(items) {
    safeLocalStorageSet(PHOTO_STORAGE_KEYS.pendingConfirmations, JSON.stringify([...new Set(items)]));
}

function queuePendingConfirmations(uuids) {
    savePendingConfirmations([...getPendingConfirmations(), ...uuids]);
}

function getLocalUploadedTotal() {
    return Math.max(0, Number(safeLocalStorageGet(PHOTO_STORAGE_KEYS.uploadedTotal, '0')) || 0);
}

function getUploadedPhotoTotal() {
    if (!serverFilmState) return getLocalUploadedTotal();
    return Math.min(
        serverFilmState.totalLimit,
        serverFilmState.uploadedCount + getPendingConfirmations().length
    );
}

function getTotalFrameLimit() {
    return serverFilmState?.totalLimit || PHOTO_UPLOAD_SETTINGS.maxFilesPerGuest;
}

function getAvailableFrameCount() {
    return Math.max(0, getTotalFrameLimit() - getUploadedPhotoTotal());
}

function getPendingPhotoCount() {
    return selectedPhotos.filter((photo) => photo.status !== 'success').length;
}

function getRemainingPhotoCount() {
    return Math.max(0, getAvailableFrameCount() - getPendingPhotoCount());
}

function setDeviceCode(code) {
    const visibleCode = code || '••••';
    deviceCodeEls.forEach((element) => {
        element.textContent = visibleCode;
    });
}

function setFilmRefillStatus(message, type = '') {
    if (!filmRefillStatus) return;
    filmRefillStatus.textContent = message;
    filmRefillStatus.classList.toggle('is-error', type === 'error');
    filmRefillStatus.classList.toggle('is-success', type === 'success');
}

function updateFilmCounter() {
    if (filmLeftEl) filmLeftEl.textContent = String(getRemainingPhotoCount());
    setDeviceCode(serverFilmState?.shortCode || '');

    const isExhausted = getAvailableFrameCount() <= 0;
    if (filmRefill) filmRefill.hidden = !isExhausted;
    if (!isExhausted && filmCodeForm) filmCodeForm.hidden = true;
}

function updatePhotoControls() {
    const hasPendingPhotos = selectedPhotos.some((photo) => photo.status !== 'success');
    const hasPhotos = selectedPhotos.length > 0;
    const hasFreeFrames = getRemainingPhotoCount() > 0;

    if (photoSelection) photoSelection.hidden = !hasPhotos;
    if (uploadPhotosButton) uploadPhotosButton.disabled = !hasPendingPhotos || isUploadingPhotos;
    if (cameraButton) cameraButton.disabled = isUploadingPhotos || !hasFreeFrames;
    if (galleryButton) galleryButton.disabled = isUploadingPhotos || !hasFreeFrames;
    if (clearPhotosButton) clearPhotosButton.disabled = isUploadingPhotos;
    if (guestNameInput) guestNameInput.disabled = isUploadingPhotos;
    if (photoNoteInput) photoNoteInput.disabled = isUploadingPhotos;

    if (uploadButtonText) {
        if (isUploadingPhotos) uploadButtonText.textContent = 'отправляем фотографии…';
        else if (selectedPhotos.some((photo) => photo.status === 'error')) uploadButtonText.textContent = 'повторить отправку';
        else uploadButtonText.textContent = 'отправить в общий альбом';
    }

    updateFilmCounter();
}

async function syncFilmState({ silent = false } = {}) {
    if (!isWorkerConfigured() || isSyncingFilmState) return serverFilmState;
    isSyncingFilmState = true;

    try {
        const payload = await apiRequest('/api/device/status', {
            body: {
                deviceId: getDeviceId(),
                guestName: guestNameInput?.value.trim() || '',
                legacyUploadedCount: getLocalUploadedTotal()
            }
        });
        cacheFilmState(payload.device);
        updatePhotoControls();
        return serverFilmState;
    } catch (error) {
        if (!silent) setFilmRefillStatus('не получилось проверить плёнку. проверьте интернет и попробуйте ещё раз', 'error');
        return serverFilmState;
    } finally {
        isSyncingFilmState = false;
    }
}

async function flushPendingConfirmations() {
    if (!isWorkerConfigured()) return false;
    const uploadIds = getPendingConfirmations();
    if (!uploadIds.length) return true;

    try {
        const payload = await apiRequest('/api/device/confirm', {
            body: {
                deviceId: getDeviceId(),
                uploadIds
            }
        });
        savePendingConfirmations([]);
        cacheFilmState(payload.device);
        updatePhotoControls();
        return true;
    } catch (error) {
        updatePhotoControls();
        return false;
    }
}

function getRecentMissionIndexes() {
    const parsed = safeJsonParse(safeLocalStorageGet(PHOTO_STORAGE_KEYS.recentMissions, '[]'), []);
    return Array.isArray(parsed) ? parsed.filter(Number.isInteger).slice(-12) : [];
}

function chooseMission(forceNew = false) {
    if (!missionText || !PHOTO_MISSIONS.length) return;

    const savedIndex = Number(safeLocalStorageGet(PHOTO_STORAGE_KEYS.currentMission, '-1'));
    if (!forceNew && Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < PHOTO_MISSIONS.length) {
        missionText.textContent = PHOTO_MISSIONS[savedIndex];
        missionText.dataset.missionIndex = String(savedIndex);
        return;
    }

    const recentIndexes = getRecentMissionIndexes();
    const availableIndexes = PHOTO_MISSIONS
        .map((_, index) => index)
        .filter((index) => !recentIndexes.includes(index));
    const pool = availableIndexes.length ? availableIndexes : PHOTO_MISSIONS.map((_, index) => index);
    const index = pool[Math.floor(Math.random() * pool.length)];

    missionText.textContent = PHOTO_MISSIONS[index];
    missionText.dataset.missionIndex = String(index);
    safeLocalStorageSet(PHOTO_STORAGE_KEYS.currentMission, String(index));
    safeLocalStorageSet(PHOTO_STORAGE_KEYS.recentMissions, JSON.stringify([...recentIndexes, index].slice(-12)));

    const card = missionText.closest('.photo-mission');
    if (card) {
        card.classList.remove('mission-refresh');
        void card.offsetWidth;
        card.classList.add('mission-refresh');
    }
}

function updateMissionCount() {
    if (!missionsCompletedEl) return;
    const completed = Math.max(0, Number(safeLocalStorageGet(PHOTO_STORAGE_KEYS.completedMissions, '0')) || 0);
    missionsCompletedEl.textContent = String(completed);
}

function completeMission() {
    const completed = Math.max(0, Number(safeLocalStorageGet(PHOTO_STORAGE_KEYS.completedMissions, '0')) || 0) + 1;
    safeLocalStorageSet(PHOTO_STORAGE_KEYS.completedMissions, String(completed));
    updateMissionCount();

    const card = missionText?.closest('.photo-mission');
    if (card) card.classList.add('mission-complete');
    window.setTimeout(() => {
        if (card) card.classList.remove('mission-complete');
        chooseMission(true);
    }, 650);
}

function makePhotoId(file) {
    const randomPart = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${file.lastModified}-${file.size}-${randomPart}`;
}

function isImageFile(file) {
    return file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name);
}

function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} МБ`;
}

function setPhotoStatus(message, type = '') {
    if (!uploadStatus) return;
    uploadStatus.textContent = message;
    uploadStatus.classList.toggle('is-error', type === 'error');
    uploadStatus.classList.toggle('is-success', type === 'success');
}

function createPhotoPreviewCard(photo, index) {
    const figure = document.createElement('figure');
    figure.className = 'polaroid-card';
    figure.dataset.photoId = photo.id;
    figure.dataset.status = photo.status;
    figure.style.setProperty('--photo-tilt', `${((index % 5) - 2) * 1.1}deg`);

    const media = document.createElement('div');
    media.className = 'polaroid-media';

    const image = document.createElement('img');
    image.src = photo.previewUrl;
    image.alt = `Предпросмотр: ${photo.file.name}`;
    image.loading = 'lazy';
    image.addEventListener('error', () => {
        media.classList.add('has-no-preview');
        image.hidden = true;
    }, { once: true });

    const fallback = document.createElement('span');
    fallback.className = 'polaroid-fallback';
    fallback.textContent = 'кадр';
    fallback.setAttribute('aria-hidden', 'true');

    const state = document.createElement('span');
    state.className = 'polaroid-state';
    state.setAttribute('aria-live', 'polite');
    if (photo.status === 'success') state.textContent = 'сохранено ♡';
    else if (photo.status === 'error') state.textContent = 'не отправлено';
    else if (photo.status === 'uploading') state.textContent = `${Math.round(photo.progress)}%`;

    const progress = document.createElement('span');
    progress.className = 'polaroid-progress';
    progress.style.setProperty('--upload-progress', `${photo.progress}%`);
    media.append(image, fallback, state, progress);

    const caption = document.createElement('figcaption');
    const frameName = document.createElement('span');
    frameName.textContent = `кадр ${String(index + 1).padStart(2, '0')}`;
    const fileSize = document.createElement('small');
    fileSize.textContent = formatFileSize(photo.file.size);
    caption.append(frameName, fileSize);

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-photo-button';
    removeButton.setAttribute('aria-label', `Убрать фотографию ${photo.file.name}`);
    removeButton.textContent = '×';
    removeButton.disabled = isUploadingPhotos || photo.status === 'uploading';
    removeButton.addEventListener('click', () => removePhoto(photo.id));

    figure.append(media, caption, removeButton);
    return figure;
}

function renderPhotoPreviews() {
    if (photoPreview) photoPreview.replaceChildren(...selectedPhotos.map(createPhotoPreviewCard));
    updatePhotoControls();
}

function addPhotos(fileList) {
    if (isUploadingPhotos) return;

    const files = Array.from(fileList || []);
    const imageFiles = files.filter(isImageFile);
    const tooLarge = imageFiles.filter((file) => file.size > PHOTO_UPLOAD_SETTINGS.maxFileSize);
    const acceptable = imageFiles.filter((file) => file.size <= PHOTO_UPLOAD_SETTINGS.maxFileSize);
    const existingKeys = new Set(selectedPhotos.map((photo) => `${photo.file.name}-${photo.file.size}-${photo.file.lastModified}`));
    const uniqueFiles = acceptable.filter((file) => !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`));
    const slotsLeft = getRemainingPhotoCount();
    const filesToAdd = uniqueFiles.slice(0, slotsLeft);

    filesToAdd.forEach((file) => {
        selectedPhotos.push({
            id: makePhotoId(file),
            file,
            previewUrl: URL.createObjectURL(file),
            status: 'ready',
            progress: 0,
            uuid: ''
        });
    });

    renderPhotoPreviews();
    const messages = [];
    if (files.length !== imageFiles.length) messages.push('файлы не в формате изображения пропущены');
    if (tooLarge.length) messages.push('фотографии больше 99 МБ пропущены');
    if (uniqueFiles.length > slotsLeft) messages.push(`на этой плёнке осталось только ${slotsLeft} кадров`);

    if (messages.length) setPhotoStatus(messages.join(' · '), 'error');
    else if (filesToAdd.length) setPhotoStatus(`выбрано фотографий: ${selectedPhotos.length}`);

    if (cameraInput) cameraInput.value = '';
    if (galleryInput) galleryInput.value = '';
}

function removePhoto(photoId) {
    const index = selectedPhotos.findIndex((photo) => photo.id === photoId);
    if (index < 0 || isUploadingPhotos) return;
    URL.revokeObjectURL(selectedPhotos[index].previewUrl);
    selectedPhotos.splice(index, 1);
    renderPhotoPreviews();
    setPhotoStatus(selectedPhotos.length ? `выбрано фотографий: ${selectedPhotos.length}` : '');
}

function clearSelectedPhotos() {
    if (isUploadingPhotos) return;
    selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    selectedPhotos = [];
    renderPhotoPreviews();
    setPhotoStatus('');
}

function refreshPhotoCard(photo) {
    const card = photoPreview?.querySelector(`[data-photo-id="${CSS.escape(photo.id)}"]`);
    if (!card) return;
    card.dataset.status = photo.status;

    const state = card.querySelector('.polaroid-state');
    const progress = card.querySelector('.polaroid-progress');
    if (progress) progress.style.setProperty('--upload-progress', `${photo.progress}%`);
    if (state) {
        if (photo.status === 'success') state.textContent = 'сохранено ♡';
        else if (photo.status === 'error') state.textContent = 'не отправлено';
        else if (photo.status === 'uploading') state.textContent = `${Math.round(photo.progress)}%`;
        else state.textContent = '';
    }
}

async function getSecureUploadCredentials(requestedCount) {
    if (!PHOTO_UPLOAD_SETTINGS.signedUploads) return null;
    const payload = await apiRequest('/api/device/signature', {
        body: {
            deviceId: getDeviceId(),
            requestedCount
        }
    });
    cacheFilmState(payload.device);
    return {
        signature: String(payload.signature || ''),
        expire: String(payload.expire || '')
    };
}

function uploadSinglePhoto(photo, metadata, credentials) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('UPLOADCARE_PUB_KEY', PHOTO_UPLOAD_SETTINGS.publicKey);
        formData.append('UPLOADCARE_STORE', '1');
        formData.append('tags', `${PHOTO_UPLOAD_SETTINGS.eventTag},guest-photo`);
        formData.append('metadata[event]', PHOTO_UPLOAD_SETTINGS.eventTag);
        formData.append('metadata[guest_name]', metadata.guestName.slice(0, 512));
        formData.append('metadata[mission]', metadata.mission.slice(0, 512));
        formData.append('metadata[note]', metadata.note.slice(0, 512));
        formData.append('metadata[batch_id]', metadata.batchId);
        formData.append('metadata[uploaded_at]', metadata.uploadedAt);
        formData.append('metadata[device_id]', metadata.deviceId.slice(0, 512));
        formData.append('metadata[device_code]', metadata.deviceCode.slice(0, 512));
        if (credentials?.signature && credentials?.expire) {
            formData.append('signature', credentials.signature);
            formData.append('expire', credentials.expire);
        }
        formData.append('file', photo.file, photo.file.name);

        const request = new XMLHttpRequest();
        request.open('POST', PHOTO_UPLOAD_SETTINGS.endpoint);
        request.responseType = 'json';
        request.timeout = 180000;

        request.upload.addEventListener('progress', (event) => {
            if (!event.lengthComputable) return;
            photo.progress = Math.min(99, (event.loaded / event.total) * 100);
            refreshPhotoCard(photo);
        });

        request.addEventListener('load', () => {
            if (request.status < 200 || request.status >= 300) {
                reject(new Error(`Upload failed: ${request.status}`));
                return;
            }
            const response = request.response || {};
            const uuid = Object.values(response)[0];
            if (typeof uuid !== 'string') {
                reject(new Error('Upload response does not contain UUID'));
                return;
            }
            photo.uuid = uuid;
            photo.progress = 100;
            resolve(uuid);
        });

        request.addEventListener('error', () => reject(new Error('Network error')));
        request.addEventListener('timeout', () => reject(new Error('Upload timeout')));
        request.send(formData);
    });
}

async function uploadSelectedPhotos() {
    if (isUploadingPhotos) return;

    if (!PHOTO_UPLOAD_SETTINGS.publicKey || PHOTO_UPLOAD_SETTINGS.publicKey === 'YOUR_UPLOADCARE_PUBLIC_KEY') {
        setPhotoStatus('облачный альбом ещё не подключён: добавьте Public Key Uploadcare в config.js', 'error');
        return;
    }

    if (isWorkerConfigured()) {
        await syncFilmState({ silent: true });
        await flushPendingConfirmations();
    }

    const pendingPhotos = selectedPhotos.filter((photo) => photo.status !== 'success');
    if (!pendingPhotos.length) return;
    if (pendingPhotos.length > getAvailableFrameCount()) {
        setPhotoStatus('на плёнке не хватает свободных кадров. уберите лишние фотографии или получите новую плёнку', 'error');
        updatePhotoControls();
        return;
    }

    let uploadCredentials = null;
    if (PHOTO_UPLOAD_SETTINGS.signedUploads) {
        try {
            uploadCredentials = await getSecureUploadCredentials(pendingPhotos.length);
        } catch (error) {
            setPhotoStatus('не получилось получить разрешение на загрузку. проверьте интернет и попробуйте снова', 'error');
            return;
        }
    }

    const guestName = guestNameInput?.value.trim() || 'анонимный гость';
    const note = photoNoteInput?.value.trim() || '';
    const mission = missionText?.textContent.trim() || '';
    const batchId = `wedding-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const metadata = {
        guestName,
        note,
        mission,
        batchId,
        uploadedAt: new Date().toISOString(),
        deviceId: getDeviceId(),
        deviceCode: serverFilmState?.shortCode || ''
    };

    safeLocalStorageSet(PHOTO_STORAGE_KEYS.guestName, guestName === 'анонимный гость' ? '' : guestName);
    isUploadingPhotos = true;
    pendingPhotos.forEach((photo) => {
        photo.status = 'queued';
        photo.progress = 0;
    });
    renderPhotoPreviews();
    setPhotoStatus(`отправляем ${pendingPhotos.length} ${pendingPhotos.length === 1 ? 'фотографию' : 'фотографий'}…`);

    let nextIndex = 0;
    let successCount = 0;
    let errorCount = 0;
    const uploadedUuids = [];

    async function uploadWorker() {
        while (nextIndex < pendingPhotos.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;
            const photo = pendingPhotos[currentIndex];
            photo.status = 'uploading';
            refreshPhotoCard(photo);

            try {
                const uuid = await uploadSinglePhoto(photo, metadata, uploadCredentials);
                photo.status = 'success';
                uploadedUuids.push(uuid);
                successCount += 1;
            } catch (error) {
                photo.status = 'error';
                photo.progress = 0;
                errorCount += 1;
            }
            refreshPhotoCard(photo);
        }
    }

    const workerCount = Math.min(PHOTO_UPLOAD_SETTINGS.concurrentUploads, pendingPhotos.length);
    await Promise.all(Array.from({ length: workerCount }, uploadWorker));
    isUploadingPhotos = false;

    let counterSynced = true;
    if (successCount) {
        if (isWorkerConfigured()) {
            queuePendingConfirmations(uploadedUuids);
            counterSynced = await flushPendingConfirmations();
        } else {
            safeLocalStorageSet(
                PHOTO_STORAGE_KEYS.uploadedTotal,
                String(Math.min(getTotalFrameLimit(), getLocalUploadedTotal() + successCount))
            );
        }
    }
    renderPhotoPreviews();

    if (!errorCount) {
        const syncNote = counterSynced ? '' : ' счётчик обновится, когда появится интернет.';
        setPhotoStatus(`готово! ${successCount === 1 ? 'фотография сохранена' : `${successCount} фотографий сохранены`} в общем альбоме ♡${syncNote}`, 'success');
        window.setTimeout(() => {
            selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
            selectedPhotos = [];
            renderPhotoPreviews();
            if (photoNoteInput) photoNoteInput.value = '';
        }, 1800);
    } else {
        setPhotoStatus(`сохранено: ${successCount}. не удалось отправить: ${errorCount}. проверьте интернет и нажмите «повторить отправку».`, 'error');
    }
}

async function checkForRefill() {
    const before = getAvailableFrameCount();
    setFilmRefillStatus('проверяем новую плёнку…');
    const state = await syncFilmState({ silent: true });
    if (!state) {
        setFilmRefillStatus('не получилось связаться с фотолабораторией. попробуйте ещё раз', 'error');
        return;
    }

    const after = getAvailableFrameCount();
    if (after > before) {
        setFilmRefillStatus(`новая плёнка заряжена: доступно ${after} кадров ♡`, 'success');
        setPhotoStatus(`новая плёнка заряжена: доступно ${after} кадров ♡`, 'success');
        if (filmCard) {
            filmCard.classList.remove('film-refilled');
            void filmCard.offsetWidth;
            filmCard.classList.add('film-refilled');
        }
    } else {
        setFilmRefillStatus('новых кадров пока нет. покажите организатору код плёнки', 'error');
    }
}

async function redeemFilmCode(event) {
    event.preventDefault();
    if (!isWorkerConfigured()) {
        setFilmRefillStatus('сервер фотоплёнки ещё не подключён', 'error');
        return;
    }

    const code = filmCodeInput?.value.trim().toUpperCase().replace(/\s+/g, '');
    if (!code) {
        setFilmRefillStatus('введите код дополнительной плёнки', 'error');
        return;
    }

    setFilmRefillStatus('заряжаем плёнку…');
    try {
        const payload = await apiRequest('/api/device/redeem', {
            body: {
                deviceId: getDeviceId(),
                code,
                guestName: guestNameInput?.value.trim() || ''
            }
        });
        cacheFilmState(payload.device);
        if (filmCodeInput) filmCodeInput.value = '';
        if (filmCodeForm) filmCodeForm.hidden = true;
        setFilmRefillStatus(`готово: добавлено ${payload.framesAdded} кадров ♡`, 'success');
        setPhotoStatus(`готово: добавлено ${payload.framesAdded} кадров ♡`, 'success');
        updatePhotoControls();
        if (filmCard) {
            filmCard.classList.remove('film-refilled');
            void filmCard.offsetWidth;
            filmCard.classList.add('film-refilled');
        }
    } catch (error) {
        const message = error.status === 404
            ? 'такой код не найден'
            : error.status === 409
                ? 'эта дополнительная плёнка уже была использована'
                : 'не получилось активировать код. попробуйте ещё раз';
        setFilmRefillStatus(message, 'error');
    }
}

async function saveGuestNameToServer() {
    safeLocalStorageSet(PHOTO_STORAGE_KEYS.guestName, guestNameInput?.value.trim() || '');
    await syncFilmState({ silent: true });
}

if (missionText) {
    chooseMission(false);
    updateMissionCount();
}

loadCachedFilmState();
if (guestNameInput) {
    guestNameInput.value = safeLocalStorageGet(PHOTO_STORAGE_KEYS.guestName, '');
    guestNameInput.addEventListener('change', saveGuestNameToServer);
}

newMissionButton?.addEventListener('click', () => chooseMission(true));
missionDoneButton?.addEventListener('click', completeMission);
cameraButton?.addEventListener('click', () => cameraInput?.click());
galleryButton?.addEventListener('click', () => galleryInput?.click());
cameraInput?.addEventListener('change', (event) => addPhotos(event.target.files));
galleryInput?.addEventListener('change', (event) => addPhotos(event.target.files));
clearPhotosButton?.addEventListener('click', clearSelectedPhotos);
uploadPhotosButton?.addEventListener('click', uploadSelectedPhotos);
checkRefillButton?.addEventListener('click', checkForRefill);
toggleRedeemButton?.addEventListener('click', () => {
    if (!filmCodeForm) return;
    filmCodeForm.hidden = !filmCodeForm.hidden;
    if (!filmCodeForm.hidden) filmCodeInput?.focus();
});
filmCodeForm?.addEventListener('submit', redeemFilmCode);
filmCodeInput?.addEventListener('input', () => {
    filmCodeInput.value = filmCodeInput.value.toUpperCase();
});

updatePhotoControls();
if (isWorkerConfigured()) {
    syncFilmState({ silent: true })
        .then(() => flushPendingConfirmations())
        .catch(() => undefined);
}
