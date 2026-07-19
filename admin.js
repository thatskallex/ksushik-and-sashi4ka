const ADMIN_CONFIG = window.WEDDING_APP_CONFIG || {};
const WORKER_URL = String(ADMIN_CONFIG.workerUrl || '').trim().replace(/\/$/, '');
const ADMIN_SESSION_KEY = 'weddingPhotoAdminPassword';

const loginCard = document.querySelector('[data-login-card]');
const loginForm = document.querySelector('[data-admin-login]');
const passwordInput = document.querySelector('[data-admin-password]');
const loginStatus = document.querySelector('[data-login-status]');
const dashboard = document.querySelector('[data-admin-dashboard]');
const logoutButton = document.querySelector('[data-admin-logout]');
const searchForm = document.querySelector('[data-device-search]');
const searchInput = document.querySelector('[data-device-search-input]');
const searchStatus = document.querySelector('[data-search-status]');
const deviceCard = document.querySelector('[data-device-card]');
const deviceStatus = document.querySelector('[data-device-status]');
const deviceCodeEl = document.querySelector('[data-admin-device-code]');
const deviceNameEl = document.querySelector('[data-admin-device-name]');
const usedEl = document.querySelector('[data-admin-used]');
const bonusEl = document.querySelector('[data-admin-bonus]');
const remainingEl = document.querySelector('[data-admin-remaining]');
const historyEl = document.querySelector('[data-device-history]');
const createCodeForm = document.querySelector('[data-create-code]');
const codeFramesSelect = document.querySelector('[data-code-frames]');
const generatedCodeBox = document.querySelector('[data-generated-code]');
const generatedCodeValue = document.querySelector('[data-generated-code-value]');
const copyCodeButton = document.querySelector('[data-copy-code]');
const codeStatus = document.querySelector('[data-code-status]');
const refreshRecentButton = document.querySelector('[data-refresh-recent]');
const recentDevicesEl = document.querySelector('[data-recent-devices]');

let adminPassword = sessionStorage.getItem(ADMIN_SESSION_KEY) || '';
let selectedShortCode = '';

function isWorkerConfigured() {
    return Boolean(WORKER_URL && !WORKER_URL.includes('YOUR_CLOUDFLARE_WORKER_URL'));
}

function setStatus(element, message, type = '') {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle('is-error', type === 'error');
    element.classList.toggle('is-success', type === 'success');
}

async function adminApi(path, body = {}) {
    if (!isWorkerConfigured()) throw new Error('WORKER_NOT_CONFIGURED');
    const response = await fetch(`${WORKER_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminPassword}`
        },
        body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(payload.error || `HTTP_${response.status}`);
        error.status = response.status;
        throw error;
    }
    return payload;
}

function showDashboard() {
    if (loginCard) loginCard.hidden = true;
    if (dashboard) dashboard.hidden = false;
}

function showLogin() {
    if (loginCard) loginCard.hidden = false;
    if (dashboard) dashboard.hidden = true;
    if (deviceCard) deviceCard.hidden = true;
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function actionLabel(action, amount) {
    if (action === 'admin_grant') return `добавлено ${amount} кадров`;
    if (action === 'redeem_code') return `активирован код на ${amount} кадров`;
    if (action === 'reset_used') return 'сброшены использованные кадры';
    if (action === 'reset_all') return 'возврат к основной плёнке';
    return action || 'изменение';
}

function renderDevice(device, grants = []) {
    if (!device) return;
    selectedShortCode = device.shortCode;
    if (deviceCard) deviceCard.hidden = false;
    if (deviceCodeEl) deviceCodeEl.textContent = device.shortCode;
    if (deviceNameEl) deviceNameEl.textContent = device.guestName || 'анонимный гость';
    if (usedEl) usedEl.textContent = String(device.uploadedCount);
    if (bonusEl) bonusEl.textContent = String(device.bonusFrames);
    if (remainingEl) remainingEl.textContent = String(device.remaining);

    if (historyEl) {
        historyEl.replaceChildren(...grants.map((grant) => {
            const row = document.createElement('div');
            row.className = 'admin-history-item';
            const label = document.createElement('span');
            label.textContent = actionLabel(grant.action, grant.amount);
            const date = document.createElement('small');
            date.textContent = formatDate(grant.created_at);
            row.append(label, date);
            return row;
        }));
    }
}

async function findDevice(shortCode = searchInput?.value || '') {
    const cleanCode = String(shortCode).replace(/\D/g, '').slice(0, 4);
    if (cleanCode.length !== 4) {
        setStatus(searchStatus, 'введите четыре цифры', 'error');
        return;
    }

    setStatus(searchStatus, 'ищем плёнку…');
    try {
        const payload = await adminApi('/api/admin/find', { shortCode: cleanCode });
        if (searchInput) searchInput.value = cleanCode;
        renderDevice(payload.device, payload.grants || []);
        setStatus(searchStatus, 'плёнка найдена', 'success');
        setStatus(deviceStatus, '');
    } catch (error) {
        if (deviceCard) deviceCard.hidden = true;
        setStatus(searchStatus, error.status === 404 ? 'гость с таким кодом пока не найден' : 'не получилось выполнить поиск', 'error');
    }
}

async function grantFrames(amount, mode = 'add') {
    if (!selectedShortCode) return;
    setStatus(deviceStatus, 'обновляем плёнку…');
    try {
        const payload = await adminApi('/api/admin/grant', {
            shortCode: selectedShortCode,
            amount,
            mode
        });
        await findDevice(selectedShortCode);
        const message = mode === 'add'
            ? `добавлено ${amount} кадров ♡`
            : mode === 'reset_used'
                ? 'использованные кадры сброшены'
                : 'плёнка возвращена к базовому лимиту 21 кадр';
        setStatus(deviceStatus, message, 'success');
        await loadRecent();
    } catch (error) {
        setStatus(deviceStatus, 'не получилось изменить лимит', 'error');
    }
}

async function loadRecent() {
    if (!recentDevicesEl) return;
    try {
        const payload = await adminApi('/api/admin/recent');
        const devices = payload.devices || [];
        recentDevicesEl.replaceChildren(...devices.map((device) => {
            const row = document.createElement('div');
            row.className = 'admin-recent-item';

            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = device.shortCode;
            button.addEventListener('click', () => findDevice(device.shortCode));

            const copy = document.createElement('span');
            copy.textContent = device.guestName || 'анонимный гость';

            const meta = document.createElement('small');
            meta.textContent = `${device.remaining} осталось · ${formatDate(device.updatedAt)}`;

            row.append(button, copy, meta);
            return row;
        }));
    } catch (error) {
        recentDevicesEl.replaceChildren();
    }
}

async function validateLogin(password) {
    adminPassword = password;
    await adminApi('/api/admin/login');
    sessionStorage.setItem(ADMIN_SESSION_KEY, password);
    showDashboard();
    await loadRecent();
}

loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = passwordInput?.value || '';
    if (!password) return;
    setStatus(loginStatus, 'проверяем пароль…');
    try {
        await validateLogin(password);
        if (passwordInput) passwordInput.value = '';
        setStatus(loginStatus, '');
    } catch (error) {
        adminPassword = '';
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        setStatus(loginStatus, error.message === 'WORKER_NOT_CONFIGURED' ? 'сначала укажите адрес Worker в config.js' : 'неверный пароль', 'error');
    }
});

logoutButton?.addEventListener('click', () => {
    adminPassword = '';
    selectedShortCode = '';
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    showLogin();
});

searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    findDevice();
});

searchInput?.addEventListener('input', () => {
    searchInput.value = searchInput.value.replace(/\D/g, '').slice(0, 4);
});

document.querySelectorAll('[data-grant-frames]').forEach((button) => {
    button.addEventListener('click', () => grantFrames(Number(button.dataset.grantFrames), 'add'));
});

document.querySelector('[data-reset-used]')?.addEventListener('click', () => {
    if (window.confirm('Сбросить использованные кадры? Все уже загруженные фотографии останутся в альбоме.')) {
        grantFrames(0, 'reset_used');
    }
});

document.querySelector('[data-reset-all]')?.addEventListener('click', () => {
    if (window.confirm('Вернуть гостю обычную плёнку из 21 кадра и убрать все бонусы?')) {
        grantFrames(0, 'reset_all');
    }
});

createCodeForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const frames = Number(codeFramesSelect?.value || 12);
    setStatus(codeStatus, 'создаём новую плёнку…');
    try {
        const payload = await adminApi('/api/admin/codes/create', { frames });
        if (generatedCodeValue) generatedCodeValue.textContent = payload.code;
        if (generatedCodeBox) generatedCodeBox.hidden = false;
        setStatus(codeStatus, `одноразовая плёнка на ${frames} кадров готова`, 'success');
    } catch (error) {
        setStatus(codeStatus, 'не получилось создать код', 'error');
    }
});

copyCodeButton?.addEventListener('click', async () => {
    const code = generatedCodeValue?.textContent || '';
    if (!code) return;
    try {
        await navigator.clipboard.writeText(code);
        setStatus(codeStatus, 'код скопирован', 'success');
    } catch (error) {
        setStatus(codeStatus, 'выделите и скопируйте код вручную', 'error');
    }
});

refreshRecentButton?.addEventListener('click', loadRecent);

if (adminPassword && isWorkerConfigured()) {
    validateLogin(adminPassword).catch(() => {
        adminPassword = '';
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        showLogin();
    });
} else {
    showLogin();
}
