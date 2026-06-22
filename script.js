const weddingDate = new Date('2026-07-23T13:50:00+03:00').getTime();

const daysEl = document.querySelector('[data-days]');
const hoursEl = document.querySelector('[data-hours]');
const minutesEl = document.querySelector('[data-minutes]');

function twoDigits(value) {
    return String(value).padStart(2, '0');
}

function updateCountdown() {
    if (!daysEl || !hoursEl || !minutesEl) return;

    const distance = weddingDate - Date.now();
    const safeDistance = Math.max(distance, 0);

    const days = Math.floor(safeDistance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((safeDistance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((safeDistance / (1000 * 60)) % 60);

    daysEl.textContent = days;
    hoursEl.textContent = twoDigits(hours);
    minutesEl.textContent = twoDigits(minutes);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyJUtF8oKLD_HIS2bqXMeFQJtKo2G-p_gw7OSM8kxF364YkU3pCL9HjMgUG0A5GB_GCIw/exec'; // сюда можно вставить ссылку Google Apps Script, если захотите сохранять ответы в Google Таблицу
const foodForm = document.querySelector('#foodForm');
const formStatus = document.querySelector('[data-form-status]');
const savedMenuKey = 'weddingMenuChoice';

function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`[name="${name}"]:checked`)).map((input) => input.value);
}

function getRadioValue(name) {
    const checked = document.querySelector(`[name="${name}"]:checked`);
    return checked ? checked.value : '';
}

function setStatus(message, type = '') {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.toggle('is-error', type === 'error');
    formStatus.classList.toggle('is-success', type === 'success');
}

function formatRuleMessage(label, min, max, current) {
    if (min === max) {
        return `${label}: нужно выбрать ровно ${max}. Сейчас выбрано: ${current}.`;
    }
    return `${label}: выберите от ${min} до ${max}. Сейчас выбрано: ${current}.`;
}

function validateCheckboxGroups() {
    const errors = [];
    document.querySelectorAll('[data-choice-group]').forEach((group) => {
        const inputs = Array.from(group.querySelectorAll('input[type="checkbox"]'));
        const selected = inputs.filter((input) => input.checked).length;
        const min = Number(group.dataset.min || 0);
        const max = Number(group.dataset.max || inputs.length);
        const label = group.dataset.label || 'раздел';
        const note = group.querySelector('[data-choice-note]');
        const isValid = selected >= min && selected <= max;

        if (note) {
            note.classList.toggle('is-error', !isValid);
            note.textContent = isValid
                ? (min === max ? `выбрано ${selected} из ${max}` : `выбрано ${selected} из ${max}`)
                : formatRuleMessage(label, min, max, selected);
        }

        if (!isValid) errors.push(formatRuleMessage(label, min, max, selected));
    });
    return errors;
}

function validateRadioGroups() {
    const errors = [];
    document.querySelectorAll('[data-radio-group]').forEach((group) => {
        const radioName = group.dataset.radioGroup;
        const label = group.dataset.label || 'раздел';
        if (!getRadioValue(radioName)) errors.push(`${label}: выберите 1 вариант.`);
    });
    return errors;
}

function limitCheckboxGroup(event) {
    const input = event.target;
    if (!input.matches('[data-choice-group] input[type="checkbox"]')) return;

    const group = input.closest('[data-choice-group]');
    const max = Number(group.dataset.max || 0);
    const selected = Array.from(group.querySelectorAll('input[type="checkbox"]:checked'));

    if (max && selected.length > max) {
        input.checked = false;
        const label = group.dataset.label || 'раздел';
        setStatus(`${label}: можно выбрать максимум ${max}.`, 'error');
    } else {
        setStatus('');
    }

    validateCheckboxGroups();
}

function collectSelection() {
    const formData = new FormData(foodForm);
    return {
        createdAt: new Date().toLocaleString('ru-RU'),
        guestName: String(formData.get('guestName') || '').trim(),
        guestContact: String(formData.get('guestContact') || '').trim(),
        salads: getCheckedValues('salads'),
        vegetables: getCheckedValues('vegetables'),
        fish: getCheckedValues('fish'),
        meat: getCheckedValues('meat'),
        hotSnack: getRadioValue('hotSnack'),
        mainCourse: getRadioValue('mainCourse'),
        drink: getRadioValue('drink'),
        comment: String(formData.get('comment') || '').trim(),
    };
}

function restoreSelection() {
    if (!foodForm) return;
    const raw = localStorage.getItem(savedMenuKey);
    if (!raw) return;

    try {
        const data = JSON.parse(raw);
        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    const input = foodForm.querySelector(`[name="${key}"][value="${CSS.escape(item)}"]`);
                    if (input) input.checked = true;
                });
                return;
            }

            const field = foodForm.querySelector(`[name="${key}"]`);
            const radio = foodForm.querySelector(`[name="${key}"][value="${CSS.escape(String(value))}"]`);
            if (radio && radio.type === 'radio') radio.checked = true;
            else if (field && field.type !== 'radio' && field.type !== 'checkbox') field.value = value;
        });

        validateCheckboxGroups();
    } catch (error) {
        localStorage.removeItem(savedMenuKey);
    }
}

async function sendToGoogleSheet(data) {
    if (!GOOGLE_SCRIPT_URL) return false;

    await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
    });

    return true;
}

async function handleFoodFormSubmit(event) {
    event.preventDefault();
    if (!foodForm) return;

    const guestName = foodForm.guestName.value.trim();
    const errors = [];

    if (!guestName) errors.push('укажите, пожалуйста, ваше имя.');
    errors.push(...validateCheckboxGroups(), ...validateRadioGroups());

    if (errors.length) {
        setStatus(errors[0], 'error');
        return;
    }

    const data = collectSelection();
    localStorage.setItem(savedMenuKey, JSON.stringify(data));

    try {
        const sent = await sendToGoogleSheet(data);
        setStatus(sent
            ? 'спасибо! выбор сохранён и отправлен организаторам ♡'
            : 'спасибо! выбор сохранён в этом браузере. чтобы он попал к организаторам, скопируйте текст или подключите Google Таблицу.',
            'success'
        );
    } catch (error) {
        setStatus('выбор сохранён в браузере, но отправить его в таблицу не получилось. скопируйте текст ниже и отправьте организаторам.', 'error');
    }
}

if (foodForm) {
    restoreSelection();
    foodForm.addEventListener('change', limitCheckboxGroup);
    foodForm.addEventListener('submit', handleFoodFormSubmit);
}

