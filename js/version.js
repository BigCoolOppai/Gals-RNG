// Единый источник версии игры.
// При обновлении меняем версию здесь — и в README.md / CHANGELOG.md.
window.GAME_VERSION = "0.2.16";

// Подставляем версию в футер (если есть #versionLabel)
(function () {
    function apply() {
        var el = document.getElementById('versionLabel');
        if (el && window.GAME_VERSION) {
            // Сохраняем кодовое название после номера версии (например, "Assets & PWA")
            var m = el.textContent.match(/^Version\s+\S+\s*(.*)$/);
            var suffix = m && m[1] ? m[1] : '';
            el.textContent = 'Version ' + window.GAME_VERSION + suffix;
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', apply);
    } else {
        apply();
    }
})();
