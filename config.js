/*
 * Публичные настройки свадебного сайта.
 * Этот файл можно хранить в открытом GitHub-репозитории.
 * Секретный ключ Uploadcare и пароль администратора сюда добавлять нельзя.
 */
window.WEDDING_APP_CONFIG = Object.freeze({
    uploadcarePublicKey: 'e87b8fad31c881627cac',
    workerUrl: 'https://wedding-photo-film.skallex.workers.dev',
    signedUploads: false,
    maxFilesPerGuest: 21
});
