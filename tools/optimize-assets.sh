#!/usr/bin/env bash
# ============================================================================
# Gals-RNG — оптимизация ассетов
#
# PNG-карты -> WebP (полный размер для модалки + миниатюра для грида).
# Оригинальные PNG НЕ удаляются — код использует только WebP, а PNG остаются
# в репозитории как исходники (их можно удалить после проверки качества,
# если они есть ещё где-то).
#
# Требование: ImageMagick (convert) с поддержкой WebP.
#   Linux:  apt install imagemagick libwebp-dev
#   macOS:  brew install imagemagick libwebp
#
# Запуск:  bash tools/optimize-assets.sh
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

FULL_Q=80        # качество полноразмерного WebP (1024x1360)
THUMB_Q=78       # качество миниатюры
THUMB_W=512      # ширина миниатюры (грид ~250-330px, x2 retina)

mkdir -p img/webp

convert_img() {
    local src="$1"
    local rel="${src#img/}"        # cardGal.png / cardAlice.jpg / limited/halloween2025/cardSlender.png
    local base="${rel%.*}"         # cardGal / cardAlice / limited/...
    local full="img/webp/${base}.webp"
    local thumb="img/webp/${base}-thumb.webp"
    mkdir -p "$(dirname "$full")"

    if [ ! -f "$full" ] || [ "$src" -nt "$full" ]; then
        echo "  full  : $full"
        if [[ "$src" == *.webp ]]; then
            cp "$src" "$full"       # уже webp — копируем
        else
            convert "$src" -quality "$FULL_Q" "$full"
        fi
    fi
    if [ ! -f "$thumb" ] || [ "$src" -nt "$thumb" ]; then
        echo "  thumb : $thumb"
        # Миниатюра по умолчанию из ПЕРВОГО кадра ([0]): ImageMagick при скейле
        # анимированного webp ломает флаги наложения кадров, и браузер «ломает»
        # миниатюру (мерцает фрагментами). Для статичного арта [0] ничего не меняет.
        #
        # ИСКЛЮЧЕНИЕ — если в гриде НУЖНА анимация (пример: Догма, решение
        # разработчика пожертвовать весом ради анимированной миниатюры):
        #   cp "img/webp/<card>.webp" "img/webp/<card>-thumb.webp"
        # Пайплайн такую миниатюру не перетрет (файл новее источника),
        # но при следующей конвертии источника её зальёт — тогда повторить cp.
        convert "${src}[0]" -resize "${THUMB_W}x" -quality "$THUMB_Q" "$thumb"
    fi
}

echo "==> Карты (полные + миниатюры; png/jpg/webp)"
for f in img/card*.png img/card*.jpg img/alt*.png img/alt*.jpg img/alt2*.png \
         img/limited/*/*.png img/silhouette_placeholder.png; do
    [ -f "$f" ] && convert_img "$f"
done

# PWA-иконки НЕ генерируются: itch.io сам ставит иконку проекта.
# (Если когда-нибудь понадобится PWA для другого хостинга — вернуть блок
#  генерации из img/logo.png.)

echo "Готово. Итоговые размеры:"
du -sh img/webp 2>/dev/null || true
