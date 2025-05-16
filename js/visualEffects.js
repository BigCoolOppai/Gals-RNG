// js/visualEffects.js

const VisualEffects = {
    activeCleanupFunction: null, // Для хранения функции очистки текущего эффекта
    defaultMusicTrack: "audio/vibeOst1.mp3",

    playMusic: function(trackSrc, audioEl, isUserInitiatedPlay = false) {
        if (!audioEl) { console.warn("VS.playMusic: AudioEl не предоставлен."); return; }
        if (!trackSrc) { console.warn("VS.playMusic: TrackSrc не предоставлен."); return; }

        const wasManuallyPausedByPlayer = audioEl.wasManuallyPaused === true;
        const currentFullSrc = audioEl.currentSrc;
        // Сравниваем конец currentFullSrc с trackSrc, чтобы учесть возможные различия в путях
        const isSameTrack = currentFullSrc && currentFullSrc.endsWith(trackSrc);

        // 1. Если уже играет этот трек и это не пользовательский принудительный запуск - выходим.
        if (isSameTrack && !audioEl.paused && !isUserInitiatedPlay) {
            console.log("VS.playMusic: Уже играет этот трек, не форсировано:", trackSrc);
            return;
        }
        // 2. Если трек тот же, но на паузе, И это НЕ пользовательский запуск, И он был на паузе вручную - выходим.
        if (isSameTrack && audioEl.paused && !isUserInitiatedPlay && wasManuallyPausedByPlayer) {
            console.log(`VS.playMusic: Трек ${trackSrc} тот же, был на ручной паузе, и это не запуск от пользователя. Воспроизведение отложено.`);
            return;
        }

        const attemptPlayLogic = () => {
            // Пытаемся воспроизвести, если:
            // a) Это запуск от пользователя (isUserInitiatedPlay = true)
            // b) ИЛИ музыка НЕ была поставлена на паузу ВРУЧНУЮ (!wasManuallyPausedByPlayer)
            if (isUserInitiatedPlay || !wasManuallyPausedByPlayer) {
                const playPromise = audioEl.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // Только пользовательский клик "Включить" должен сбрасывать флаг ручной паузы
                        if (isUserInitiatedPlay) {
                            delete audioEl.wasManuallyPaused;
                            console.log("VS.playMusic: Запуск от пользователя, флаг wasManuallyPaused сброшен.");
                        }
                        console.log("VS.playMusic: Воспроизведение ЗАПУЩЕНО для:", trackSrc);
                    }).catch(error => {
                        console.warn(`VS.playMusic: ОШИБКА воспроизведения для ${trackSrc}:`, error);
                    });
                }
            } else {
                console.log(`VS.playMusic: Воспроизведение ОТЛОЖЕНО для ${trackSrc} (manuallyPaused: ${wasManuallyPausedByPlayer}, userInitiated: ${isUserInitiatedPlay})`);
            }
        };

        // 3. Устанавливаем/меняем src, только если он действительно отличается или src пустой/невалидный.
        if (!isSameTrack || !currentFullSrc || audioEl.src === window.location.href /* начальное состояние src */) {
            audioEl.src = trackSrc;
            console.log("VS.playMusic: Источник звука установлен на:", trackSrc, ". Ожидание canplaythrough...");

            // Определяем обработчики с возможностью их последующего удаления
            const onCanPlayHandler = () => {
                console.log(`VS.playMusic: 'canplaythrough' для ${trackSrc}. Попытка воспроизведения.`);
                attemptPlayLogic();
            };
            const onErrorHandler = (e) => {
                console.error(`VS.playMusic: Ошибка загрузки аудио ('error' event) для ${trackSrc}:`, e);
            };

            // Добавляем слушатели с опцией { once: true }, чтобы они автоматически удалились после первого срабатывания
            audioEl.addEventListener('canplaythrough', onCanPlayHandler, { once: true });
            audioEl.addEventListener('error', onErrorHandler, { once: true });
            
            audioEl.load(); // Явно вызываем load для нового источника
        } else {
            // SRC не менялся (например, трек тот же, но был на паузе).
            // В этом случае можно сразу пытаться воспроизвести, так как данные уже должны быть загружены.
            console.log(`VS.playMusic: SRC не менялся для ${trackSrc}. Прямая попытка воспроизведения.`);
            attemptPlayLogic();
        }
    },

    switchToDefaultMusic: function(audioEl, isInitialLoad = false) {
        if (!audioEl) { console.warn("VS.switchToDefaultMusic: AudioEl не предоставлен."); return; }
        console.log(`VS.switchToDefaultMusic вызван. isInitialLoad: ${isInitialLoad}, ManuallyPaused: ${audioEl.wasManuallyPaused}`);
        
        const isAlreadyDefault = audioEl.currentSrc && audioEl.currentSrc.endsWith(this.defaultMusicTrack);
        // Музыка должна играть, если это не начальная загрузка И она не была поставлена на паузу вручную
        const shouldPlayNow = !isInitialLoad && (audioEl.wasManuallyPaused === undefined || audioEl.wasManuallyPaused === false);

        if (!isAlreadyDefault) {
            // Если src еще не дефолтный, устанавливаем его.
            // playMusic сама решит, играть ли, основываясь на wasManuallyPaused и дождется canplaythrough.
            // isUserInitiatedPlay будет true, если shouldPlayNow=true и трек на паузе (чтобы форсировать воспроизведение).
            this.playMusic(this.defaultMusicTrack, audioEl, shouldPlayNow && audioEl.paused);
        } else if (audioEl.paused && shouldPlayNow) {
            // Если src уже дефолтный, но на паузе, и должен играть сейчас.
            this.playMusic(this.defaultMusicTrack, audioEl, true); // Форсируем (isUserInitiatedPlay=true), чтобы точно заиграло.
        } else if (isInitialLoad && (!audioEl.currentSrc || !audioEl.currentSrc.endsWith(this.defaultMusicTrack))) {
            // Если это начальная загрузка и src еще не дефолтный, просто меняем src и вызываем load.
            // Не пытаемся воспроизвести автоматически, это должно быть инициировано пользователем или настройками громкости.
            audioEl.src = this.defaultMusicTrack;
            audioEl.load();
            console.log("VS.switchToDefaultMusic: Default source set on initial load (no play attempt).");
        } else {
             console.log("VS.switchToDefaultMusic: Уже дефолтный трек или воспроизведение отложено/не требуется.");
        }
    },

    // КАРТА МУЗЫКИ ДЛЯ ЭФФЕКТОВ
    effectMusicMap: {
        'error': "audio/error-sfx.mp3",
        'timestop': "audio/timestop_sfx.mp3"
        // 'uranium': "audio/uranium_ambient.mp3"
    },
    // ==========================================================================
    // КОНЕЦ БЛОКА: Музыкальные функции и Карта музыки
    // ==========================================================================

    apply: function(effectId, targetElements, isInitialLoad = false) {
        if (this.activeCleanupFunction) {
            this.activeCleanupFunction();
            this.activeCleanupFunction = null;
        }

        const { body, glitchOverlay, audioPlayer } = targetElements;

        if (audioPlayer) {
            const musicForThisEffect = effectId ? this.effectMusicMap[effectId] : null;
            const targetTrack = musicForThisEffect || this.defaultMusicTrack;

            if (isInitialLoad) {
                // При начальной загрузке, если текущий трек не тот, что нужен, просто ставим src и load.
                if (!audioPlayer.currentSrc || !audioPlayer.currentSrc.endsWith(targetTrack)) {
                    audioPlayer.src = targetTrack;
                    audioPlayer.load(); // Явный load
                    console.log(`VS.apply: Music source for '${effectId || 'default'}' set on initial load: ${targetTrack}`);
                }
            } else {
                // Для смены эффекта (не isInitialLoad)
                // isUserInitiatedPlay = false, так как это системное переключение.
                // playMusic теперь сама корректно обработает загрузку и воспроизведение.
                this.playMusic(targetTrack, audioPlayer, false); 
            }
        }
        
        // Удаляем общие классы эффектов с body и оверлея
        if (targetElements.body) {
            targetElements.body.className = targetElements.body.className.replace(/\bvisual-effect-\S+/g, '');
        }
        if (targetElements.glitchOverlay) {
            targetElements.glitchOverlay.className = targetElements.glitchOverlay.className.replace(/\bactive-effect-\S+/g, '');
             while (targetElements.glitchOverlay.firstChild) { // Удаляем дочерние элементы оверлея
                targetElements.glitchOverlay.firstChild.remove();
            }
            targetElements.glitchOverlay.style.display = 'none';
        }
        
        if (!effectId) {
            console.log("All visual effects cleared.");
            return;
        }

        console.log(`Applying visual effect: ${effectId}`);
        if (targetElements.glitchOverlay && (effectId === 'error' || effectId === 'timestop' /* || другие эффекты, использующие оверлей */)) {
            targetElements.glitchOverlay.style.display = 'block';
        }

        const effectFunction = this.effects[effectId];
        if (effectFunction) {
            this.activeCleanupFunction = effectFunction(targetElements); // Запускаем эффект и сохраняем его функцию очистки
        } else {
            console.log(`No visual effect defined for ID: ${effectId}`);
        }
    },

    effects: {
        'error': function(targets, isInitialLoad) {
            const { glitchOverlay, body } = targets;
            if (!glitchOverlay) return null;

            glitchOverlay.classList.add('active-effect-error');
            
            // Создаем цветные слои для глитча
                    const redLayer = document.createElement('div');
                    redLayer.className = 'glitch-color-layer';
                    redLayer.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Красный с прозрачностью
                    redLayer.style.mixBlendMode = 'screen'; // Режим наложения
                    glitchOverlay.appendChild(redLayer);

                    const cyanLayer = document.createElement('div');
                    cyanLayer.className = 'glitch-color-layer';
                    cyanLayer.style.backgroundColor = 'rgba(0, 255, 255, 0.5)'; // Циан с прозрачностью
                    cyanLayer.style.mixBlendMode = 'screen';
                    glitchOverlay.appendChild(cyanLayer);

                    // Основной таймлайн GSAP для глитч-эффекта
                    const glitchTl = gsap.timeline({
                        repeat: -1, // Бесконечное повторение
                        repeatDelay: Math.random() * 0.5 + 0.1, // Случайная задержка между циклами
                        onRepeat: () => { // Меняем задержку на каждой итерации для большей случайности
                            glitchTl.repeatDelay(Math.random() * 0.5 + 0.1);
                        }
                    });

                    // 1. Анимация дрожания экрана (применяем к body или к основному контейнеру игры)
                    // Используем gsap.utils.random для случайных значений
                    glitchTl.to(body, { // Или к вашему главному игровому контейнеру
                        duration: 0.03,
                        x: () => gsap.utils.random(-3, 3, 1) + "px", // Случайный сдвиг по X
                        y: () => gsap.utils.random(-3, 3, 1) + "px", // Случайный сдвиг по Y
                        rotation: () => gsap.utils.random(-0.2, 0.2, 0.1) + "deg",
                        ease: "steps(1)", // Резкие переходы
                        repeat: 2, // Повторить дрожание несколько раз в цикле
                        yoyo: true // Вернуться в исходное положение
                    }, 0); // Начать сразу

                    // 2. Анимация цветных слоев
                    glitchTl.fromTo(redLayer,
                        { opacity: 0, x: () => gsap.utils.random(-10, 10, 1) + "px" },
                        { duration: 0.05, opacity: () => Math.random() * 0.3 + 0.1, x: 0, ease: "steps(1)", repeat: 1, yoyo: true }
                    , "<0.02"); // Начать чуть позже дрожания

                    glitchTl.fromTo(cyanLayer,
                        { opacity: 0, x: () => gsap.utils.random(-10, 10, 1) + "px" },
                        { duration: 0.05, opacity: () => Math.random() * 0.3 + 0.1, x: 0, ease: "steps(1)", repeat: 1, yoyo: true }
                    , "<0.03"); // Начать еще чуть позже

                    // 3. Динамическое создание и анимация глитч-линий
                    const createAnimatedGlitchLine = () => {
                        if (!glitchOverlay || glitchOverlay.style.display === 'none') return; // Не создавать, если оверлей скрыт

                        const line = document.createElement('div');
                        line.className = 'glitch-line';
                        line.style.height = `${gsap.utils.random(1, 8, 1)}px`;
                        line.style.top = `${gsap.utils.random(0, 100)}%`;
                        line.style.backgroundColor = Math.random() > 0.5 ? 'rgba(255,0,0,0.7)' : 'rgba(0,255,255,0.7)';
                        // Начальное состояние для GSAP анимации
                        gsap.set(line, { opacity: 0, x: Math.random() > 0.5 ? "-100%" : "100%" });
                        
                        glitchOverlay.appendChild(line);

                        gsap.timeline()
                            .to(line, { 
                                duration: gsap.utils.random(0.05, 0.15), 
                                x: 0, 
                                opacity: gsap.utils.random(0.2, 0.5), 
                                ease: "steps(3)" 
                            })
                            .to(line, { 
                                duration: gsap.utils.random(0.03, 0.1), 
                                x: Math.random() > 0.5 ? "100%" : "-100%", 
                                opacity: 0, 
                                ease: "steps(2)",
                                delay: gsap.utils.random(0, 0.1), // Небольшая задержка перед исчезновением
                                onComplete: () => line.remove() 
                            });
                    };

                    // Добавляем вызов функции создания линий в основной таймлайн
                    // Это будет вызывать функцию несколько раз в течение цикла основного таймлайна
                    glitchTl.call(createAnimatedGlitchLine, null, ">0.01"); // ">0.01" - немного после предыдущих анимаций
                    glitchTl.call(createAnimatedGlitchLine, null, ">0.03");
                    glitchTl.call(createAnimatedGlitchLine, null, ">0.05");


                    currentEffectCleanup = () => {
                        glitchTl.kill(); // Убиваем GSAP таймлайн
                        if (glitchOverlay) {
                            while (glitchOverlay.firstChild) { // Удаляем все созданные слои и линии
                                glitchOverlay.firstChild.remove();
                            }
                            glitchOverlay.style.display = 'none';
                        }
                        console.log("GSAP ERROR effect cleaned up.");
                    };
                

            return () => { // Функция очистки для 'error'
                glitchTl.kill();
                if (glitchOverlay) {
                    glitchOverlay.classList.remove('active-effect-error');
                    while (glitchOverlay.firstChild) {
                        glitchOverlay.firstChild.remove();
                    }
                    // glitchOverlay.style.display = 'none'; // Это сделает общая apply при снятии всех эффектов
                }
                console.log("ERROR effect cleaned up via VisualEffects module.");
            };
        },

        'uranium': function(targets, isInitialLoad) {
            const { body } = targets;
            body.classList.add('visual-effect-uranium');
            return () => {
                body.classList.remove('visual-effect-uranium');
                console.log("Uranium effect cleaned up via VisualEffects module.");
            };
        },

        'timestop': function(targets, isInitialLoad) {
            const { body, glitchOverlay } = targets;
            let textElement = null;
            const tl = gsap.timeline(); // Главный таймлайн для управления фазами

            if (!body || !glitchOverlay) {
                console.warn("Timestop effect: body or glitchOverlay missing.");
                return () => { if(tl) tl.kill(); }; 
            }
            
            // --- Начальная настройка ---
            // Эти классы активируют ваши СУЩЕСТВУЮЩИЕ CSS-анимации для волн и стили для текста
            glitchOverlay.classList.add('active-effect-timestop'); 
            // body.classList.add('timestop-active'); // Этот класс можно использовать для финального ЧБ фильтра, если хотите

            // Создаем текст, его анимацию будет контролировать GSAP
            textElement = document.createElement('div');
            textElement.className = 'timestop-text'; // Убедитесь, что CSS для этого есть
            textElement.textContent = "ZA WARUDO!";
            gsap.set(textElement, { opacity: 0, scale: 3, filter: "blur(10px)" }); // Начальное состояние для GSAP
            glitchOverlay.appendChild(textElement);

            // --- Определяем значения фильтров для GSAP ---
            const negativeFilter = "sepia(60%) contrast(130%) hue-rotate(180deg) invert(90%) saturate(200%) brightness(0.85)";
            const monochromeFilter = "grayscale(100%) contrast(115%) brightness(1.0)";
            const normalFilter = "none"; 

            // --- ФАЗЫ АНИМАЦИИ НА ТАЙМЛАЙНЕ GSAP ---

            // Фаза 1: Появление текста "ZA WARUDO!" и волны (волны идут по CSS)
            // GSAP просто ждет, пока CSS-анимации волн отработают (примерно 1.5-2с)
            // и одновременно анимирует текст.
            tl.addLabel("phase1_start")
              // Длительность этой "пустой" анимации должна соответствовать длительности ваших CSS-волн
              .to(glitchOverlay, { duration: 1.8 /* Примерная длительность CSS-анимации волн */ }, "phase1_start") 
              .to(textElement, { 
                  duration: 0.7, 
                  opacity: 1, 
                  scale: 1, 
                  filter: "blur(0px)", 
                  ease: "power2.out" 
              }, "phase1_start+=0.4"); // Текст появляется во время волн

            // Фаза 2: Переход в "негатив"
            tl.addLabel("start_negative", "-=1.0") // Начинаем переход в негатив, когда текст почти полностью появился
              .to(body.style, { 
                  duration: 0.2, 
                  filter: negativeFilter, 
                  ease: "none" 
              }, "start_negative");

            // Фаза 2.5: Текст "ZA WARUDO!" исчезает, пока экран в негативе
            tl.to(textElement, { 
                  duration: 0.5, 
                  opacity: 0, 
                  scale: 0.7, 
                  filter: "blur(5px)", 
                  ease: "power1.in" 
              }, ">+=1.0"); // Исчезает через 1с после начала негатива

            // Фаза 3: Переход из "негатива" в "нормальное" состояние 
            // (перед переходом в ЧБ, чтобы ЧБ применялся к нормальным цветам, а не к негативу)
            // Держим негатив примерно (1.0 от появления текста) + (0.5 на исчезновение текста) + 0.5 (пауза) = ~2.0 секунды
            tl.addLabel("end_negative", ">+=0.5") // Пауза в негативе
              .to(body.style, {
                  duration: 0.01,
                  filter: normalFilter, 
                  ease: "none"
              }, "end_negative");
              // Если нужны "возвращающиеся" волны, их CSS-анимацию можно было бы запустить здесь,
              // добавив другой класс к glitchOverlay.

            // Фаза 4: Переход в "черно-белый" мир (финальное состояние, пока эффект активен)
            tl.addLabel("start_monochrome", ">+=0.2") // Небольшая пауза после сброса негатива
              .to(body.style, {
                  duration: 0.5,
                  filter: monochromeFilter,
                  ease: "power1.inOut"
              }, "start_monochrome");

            // Функция очистки
            return () => {
                tl.kill(); 
                
                // Плавно возвращаем фильтр body к нормальному состоянию при очистке
                gsap.to(body.style, { 
                    duration: 0.3, 
                    filter: normalFilter,
                    onComplete: () => {
                        if(body) gsap.set(body, { clearProps: "filter" }); // Убираем инлайновый filter
                        // Удаляем классы, если они были и не управляются GSAP напрямую
                        // if(body) body.classList.remove('timestop-active'); 
                    }
                });

                if (glitchOverlay) {
                    glitchOverlay.classList.remove('active-effect-timestop'); 
                    if (textElement) textElement.remove(); 
                }
                console.log("Timestop (Phased GSAP) effect cleaned up.");
            };
        
            
        },
        
        // 'inversion': function(targets) { ... }
        // ... другие эффекты ...
    }
};