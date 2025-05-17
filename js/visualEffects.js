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
        'timestop': "audio/timestop-sfx.mp3",
        'motivation': "audio/motivation-sfx.mp3",
        'smokinsexystyle': "audio/smokinsexystyle-sfx.mp3"
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
        if (targetElements.glitchOverlay && (effectId === 'error' || effectId === 'timestop' || effectId === 'motivation'  || effectId === 'smokinsexystyle'  || effectId === 'cosmic'  /* || другие эффекты, использующие оверлей */)) {
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
        'smokinsexystyle': function(targets) {
        const { glitchOverlay } = targets;
        if (!glitchOverlay) return null;

        glitchOverlay.style.display = 'block'; // Показываем оверлей

        // Создаем контейнер для SSS лого
        const sssContainer = document.createElement('div');
        sssContainer.style.position = 'absolute';
        // Позиционируем в правом верхнем углу (или любом другом)
        sssContainer.style.top = '20px';
        sssContainer.style.right = '20px';
        sssContainer.style.zIndex = '10'; // Поверх других возможных элементов оверлея
        // sssContainer.style.transform = 'rotate(-5deg)'; // Легкий наклон для стиля

        // Создаем сам текст "SSS"
        const sssText = document.createElement('div');
        sssText.textContent = 'SSS';
        // Стилизуем текст под референс (примерные стили, можно доработать)
        sssText.style.fontFamily = "'Pirata One', 'Arial Black', sans-serif"; // Или другой подходящий "металлический" шрифт
        sssText.style.fontSize = 'clamp(40px, 8vw, 100px)'; // Адаптивный размер
        sssText.style.fontWeight = '400';
        sssText.style.color = '#FFD700'; // Золотой
        sssText.style.webkitTextStroke = '2px #4A2A00'; // Коричневая обводка для объема
        sssText.style.textStroke = '2px #4A2A00';
        sssText.style.textShadow = `
            2px 2px 0px #000,
            -2px -2px 0px #000,
            2px -2px 0px #000,
            -2px 2px 0px #000,
            0 0 15px rgba(255, 165, 0, 0.7), /* Оранжевое свечение */
            0 0 30px rgba(255, 100, 0, 0.5)
        `;
        sssText.style.lineHeight = '1'; // Уменьшаем межстрочный интервал, если текст будет в несколько строк (здесь не актуально)
        
        // Добавляем "Smokin' Sexy Style!!" под SSS, если хотите
        const subText = document.createElement('div');
        subText.textContent = "Smokin' Sexy Style!!";
        subText.style.fontFamily = "'Pirata One', cursive"; // Или другой рукописный/стильный
        subText.style.fontSize = 'clamp(16px, 3vw, 30px)';
        subText.style.color = '#FF8C00'; // Оранжевый
        subText.style.textAlign = 'center';
        subText.style.marginTop = '-10px'; // Подогнать позицию
        subText.style.textShadow = '1px 1px 2px #000';
        // subText.style.transform = 'rotate(-5deg)';

        sssContainer.appendChild(sssText);
        sssContainer.appendChild(subText); // Раскомментируйте, если нужен подтекст
        glitchOverlay.appendChild(sssContainer);

        // Анимация появления и легкой пульсации
        const tl = gsap.timeline();
        tl.from(sssContainer, { 
            duration: 0.7, 
            x: '+=50px', // Появление справа
            opacity: 0, 
            scale: 0.8,
            ease: 'back.out(1.7)' 
        })
        .to(sssText.style, { // Анимация textShadow для пульсации свечения
            duration: 1.2,
            textShadow: `
                2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000,
                0 0 25px rgba(255, 165, 0, 1),
                0 0 45px rgba(255, 100, 0, 0.8)
            `,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        }, "-=0.3"); // Начать чуть раньше конца появления

        return () => { // Функция очистки
            tl.kill(); // Останавливаем анимацию GSAP
            if (sssContainer.parentNode) {
                sssContainer.remove();
            }
            // Не скрываем glitchOverlay здесь, т.к. он может использоваться другими эффектами
            // Общая функция apply скроет его, если не останется активных эффектов, требующих оверлей
            console.log("SSS (Dante) effect cleaned up.");
        };
    },
    'motivation': function(targets) {
        const { glitchOverlay } = targets;
        if (!glitchOverlay) return null;

        glitchOverlay.style.display = 'block';
        const svgNS = "http://www.w3.org/2000/svg";
        let animationInterval = null;

        const createSlash = () => {
            if (!glitchOverlay || glitchOverlay.style.display === 'none') return; // Проверка, активен ли еще оверлей

            const svg = document.createElementNS(svgNS, "svg");
            svg.style.position = 'absolute';
            svg.style.left = '0';
            svg.style.top = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.overflow = 'visible'; // Чтобы линии не обрезались краями SVG
            svg.style.pointerEvents = 'none';
            glitchOverlay.appendChild(svg);

            const line = document.createElementNS(svgNS, "line");
            
            // Параметры разреза
            const startX = Math.random() * glitchOverlay.offsetWidth;
            const startY = Math.random() * glitchOverlay.offsetHeight;
            const length = gsap.utils.random(400, 2000); // Длина разреза
            const angle = gsap.utils.random(0, Math.PI * 2); // Случайный угол
            const endX = startX + Math.cos(angle) * length;
            const endY = startY + Math.sin(angle) * length;

            line.setAttribute("x1", startX.toString());
            line.setAttribute("y1", startY.toString());
            line.setAttribute("x2", startX.toString()); // Начальная точка для анимации "рисования"
            line.setAttribute("y2", startY.toString());

            line.style.stroke = `hsl(${gsap.utils.random(180, 240)}, 100%, ${gsap.utils.random(60, 80)}%)`; // Оттенки синего/голубого
            line.style.strokeWidth = gsap.utils.random(2, 5).toString();
            line.style.strokeLinecap = "round";
            line.style.filter = `drop-shadow(0 0 ${gsap.utils.random(3, 8)}px ${line.style.stroke})`; // Свечение

            svg.appendChild(line);

            gsap.timeline({ onComplete: () => svg.remove() }) // Удаляем SVG после анимации
                .to(line, { // Анимация "рисования" линии
                    attr: { x2: endX, y2: endY },
                    duration: 0.15, // Быстро
                    ease: "power2.out"
                })
                .to(line, { // Исчезновение
                    opacity: 0,
                    duration: 0.4,
                    delay: 0.1 // Пауза перед исчезновением
                }, ">"); 
        };
        
        // Запускаем создание разрезов с интервалом
        // Очищаем предыдущий интервал, если он был (важно для случаев быстрой смены эффектов)
        if (animationInterval) clearInterval(animationInterval);
        animationInterval = setInterval(createSlash, gsap.utils.random(300, 800)); // Интервал появления новых разрезов
        createSlash(); // Создаем первый сразу

        return () => { // Функция очистки
            if (animationInterval) {
                clearInterval(animationInterval);
                animationInterval = null;
            }
            // Удаляем все оставшиеся SVG с разрезами
            const svgs = glitchOverlay.querySelectorAll('svg');
            svgs.forEach(svg => svg.remove());
            // Не скрываем glitchOverlay здесь
            console.log("Motivation (Vergil) effect cleaned up.");
        };
    },
    'cosmic': function(targets) {
        const { glitchOverlay, body } = targets; // Можем немного затемнить body
        if (!glitchOverlay || !body) return null;

        glitchOverlay.style.display = 'block';
        const nebulae = [];
        const numNebulae = gsap.utils.random(5, 10); // Количество облаков
        const tl = gsap.timeline(); // Основной таймлайн для управления жизненным циклом туманностей

        // Сохраняем оригинальный фон body, если он не стандартный
        // const originalBodyBg = body.style.backgroundColor;
        // gsap.to(body, { duration: 2, backgroundColor: "#0f0c1e", ease: "power1.inOut" }); // Затемняем основной фон

        for (let i = 0; i < numNebulae; i++) {
            const nebula = document.createElement('div');
            nebula.style.position = 'absolute';
            nebula.style.borderRadius = '50%';
            const size = gsap.utils.random(glitchOverlay.offsetWidth * 0.3, glitchOverlay.offsetWidth * 0.8); // Крупные
            nebula.style.width = `${size}px`;
            nebula.style.height = `${size * gsap.utils.random(0.6, 1)}px`;
            
            // Темные цвета: фиолетовый, индиго, темно-серый, с очень низкой альфой
            const r = gsap.utils.random(20, 50);  // Темно-красные/фиолетовые компоненты
            const g = gsap.utils.random(10, 40);
            const b = gsap.utils.random(40, 80);  // Темно-синие/фиолетовые компоненты
            const alpha = gsap.utils.random(0.1, 0.3); // Очень низкая прозрачность

            nebula.style.background = `radial-gradient(ellipse, rgba(${r},${g},${b},${alpha}) 0%, transparent 60%)`;
            nebula.style.filter = `blur(${gsap.utils.random(30, 60)}px)`; // Сильное размытие
            nebula.style.mixBlendMode = 'multiply'; // Или 'darken', 'overlay' - поэкспериментируйте
            nebula.style.opacity = 0;
            glitchOverlay.appendChild(nebula);
            nebulae.push(nebula);

            // Начальное положение и анимация
            gsap.set(nebula, {
                x: gsap.utils.random(0, glitchOverlay.offsetWidth - size),
                y: gsap.utils.random(0, glitchOverlay.offsetHeight - size * 0.7),
                rotation: gsap.utils.random(0, 360)
            });

            const singleNebulaTl = gsap.timeline({
                repeat: -1,
                delay: gsap.utils.random(0, 5) // Разная задержка для каждой туманности
            });

            singleNebulaTl.to(nebula, { // Появление
                opacity: 1,
                duration: gsap.utils.random(5, 10),
                ease: "power1.inOut"
            })
            .to(nebula, { // Движение и изменение формы/вращения
                x: `+=${gsap.utils.random(-150, 150)}`,
                y: `+=${gsap.utils.random(-100, 100)}`,
                rotation: `+=${gsap.utils.random(-45, 45)}`,
                scale: gsap.utils.random(0.8, 1.2),
                duration: gsap.utils.random(15, 30),
                ease: "none"
            }, 0) // Начинается одновременно с появлением
            .to(nebula, { // Исчезновение
                opacity: 0,
                duration: gsap.utils.random(5, 10),
                ease: "power1.inOut"
            });
            
            tl.add(singleNebulaTl, 0); // Добавляем в общий таймлайн, чтобы можно было убить все сразу
        }

        return () => { // Функция очистки
            tl.kill(); // Убиваем все анимации туманностей
            // gsap.to(body, { duration: 1, backgroundColor: originalBodyBg || "#1a1a2e" }); // Возвращаем фон body
            nebulae.forEach(n => n.remove());
            // Не скрываем glitchOverlay здесь
            console.log("Cosmic (Dark Nebula) effect cleaned up.");
        };
    },
        
        // 'inversion': function(targets) { ... }
        // ... другие эффекты ...
    }
};