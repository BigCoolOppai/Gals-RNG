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
        convert "$src" -resize "${THUMB_W}x" -quality "$THUMB_Q" "$thumb"
    fi
}

echo "==> Карты (полные + миниатюры; png/jpg/webp)"
for f in img/card*.png img/card*.jpg img/alt*.png img/alt*.jpg img/alt2*.png \
         img/limited/*/*.png img/silhouette_placeholder.png; do
    [ -f "$f" ] && convert_img "$f"
done

# PWA-иконки генерируются ТОЛЬКО из официального лого игры (img/logo.png).
# ВНИМАНИЕ: img/effects/brand.png — это игровое артефакт-изображение
# (метка берсерка, используется эффектом карты Стаг), НЕ лого игры.
if [ -f img/logo.png ]; then
    echo "==> PWA-иконки из img/logo.png"
    convert img/logo.png -resize 512x512 -quality 85 icon-512.png
    convert img/logo.png -resize 192x192 -quality 85 icon-192.png
    convert img/logo.png -resize 64x64  -quality 85 favicon.png
else
    echo "==> img/logo.png не найден — PWA-иконки не генерируются (положи лого игры в img/logo.png)"
fi

echo "Готово. Итоговые размеры:"
du -sh img/webp icon-192.png icon-512.png favicon.png 2>/dev/null || true
