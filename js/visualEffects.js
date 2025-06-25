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
        'smokinsexystyle': "audio/smokinsexystyle-sfx.mp3",
        // 'uranium': "audio/uranium_ambient.mp3",
        'uranium_alt_1': "audio/altUranium-sfx.mp3"
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
        if (targetElements.glitchOverlay && (
        effectId === 'error' || 
        effectId === 'timestop' || 
        effectId === 'motivation' || 
        effectId === 'smokinsexystyle' || 
        effectId === 'cosmic' ||
        effectId === 'uranium_alt_1' || // Добавлено
        effectId === 'witchy' ||         // Добавлено
        effectId === 'blackhole'||      // Добавлено
        effectId === 'berserk' ||
        effectId === 'bee' ||
        effectId === 'epic_alt_1' ||
        effectId === 'legendary_alt_1' ||
        effectId === 'alastor' ||
        effectId === 'neon' ||
        effectId === 'chlorine'
        )) {
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
        'jackpot': function(targets) {
            const { glitchOverlay } = targets;
            if (!glitchOverlay) return null;

            // --- Переменные для хранения ссылок на элементы и анимации ---
            let elementsToCleanup = [];
            let mainTimeline = gsap.timeline(); // Используем одну временную шкалу

            // --- Начальная настройка ---
            glitchOverlay.innerHTML = '';
            glitchOverlay.style.display = 'block';
            glitchOverlay.classList.add('active-effect-jackpot');

            const cardImagePath = 'img/effects/jackpot1.png';
            const reelHeight = 350;
            const reelItemsCount = 30;

            // --- ФУНКЦИЯ ДЛЯ СОЗДАНИЯ АУРЫ (теперь она независима) ---
            const createAura = () => {
                // Если эффект был очищен, пока мы ждали, не создаем ауру
                if (!glitchOverlay.classList.contains('active-effect-jackpot')) {
                    return;
                }
                console.log("Creating Persistent Aura.");
                const auraContainer = document.createElement('div');
                auraContainer.className = 'aura-container'; // Даем класс для легкой очистки
                glitchOverlay.appendChild(auraContainer);
                elementsToCleanup.push(auraContainer);

                for (let i = 0; i < 120; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'jackpot-aura-particle';
                    auraContainer.appendChild(particle);

                    const isLeft = Math.random() > 0.5;
                    const startX = isLeft ? gsap.utils.random(-80, window.innerWidth * 0.15) : gsap.utils.random(window.innerWidth * 0.85, window.innerWidth + 80);
                    
                    gsap.set(particle, {
                        x: startX,
                        y: gsap.utils.random(-80, window.innerHeight + 80),
                        scale: gsap.utils.random(0.2, 1.5),
                    });

                    // Анимация жизни частицы (бесконечный цикл)
                    gsap.to(particle, {
                        duration: gsap.utils.random(2, 4),
                        x: `+=${(isLeft ? 1 : -1) * gsap.utils.random(40, 100)}`,
                        y: `+=${gsap.utils.random(-120, 120)}`,
                        opacity: 0,
                        scale: `*=${gsap.utils.random(0.7, 1.8)}`,
                        ease: "power2.out",
                        repeat: -1,
                        delay: gsap.utils.random(0, 3)
                    });
                }
            };
            
            // --- СОЗДАНИЕ СЛОТОВ ---
            const slotsContainer = document.createElement('div');
            slotsContainer.className = 'jackpot-slots-container';
            glitchOverlay.appendChild(slotsContainer);
            elementsToCleanup.push(slotsContainer); // Добавляем в массив для очистки

            const reels = [];
            for (let i = 0; i < 3; i++) {
                const slot = document.createElement('div');
                slot.className = 'jackpot-slot';
                const reel = document.createElement('div');
                reel.className = 'jackpot-reel';
                for (let j = 0; j < reelItemsCount; j++) {
                    const img = document.createElement('img');
                    img.src = cardImagePath;
                    reel.appendChild(img);
                }
                slot.appendChild(reel);
                slotsContainer.appendChild(slot);
                reels.push(reel);
            }

            // --- ПОСЛЕДОВАТЕЛЬНАЯ АНИМАЦИЯ ---
            
            // 1. Появление и вращение
            mainTimeline.from(slotsContainer, { duration: 0.5, opacity: 0, scale: 0.8, ease: "back.out(1.7)" })
                .to(reels, { y: `-=${reelHeight * (reelItemsCount - 5)}`, duration: 2, ease: "power1.in", stagger: 0.1 });

            // 2. Остановка барабанов
            const stopReel = (reelIndex, targetPosition) => {
                const reel = reels[reelIndex];
                const randomOffset = Math.floor(Math.random() * 5 - 2);
                const finalPosition = -(targetPosition + randomOffset) * reelHeight;
                return gsap.to(reel, { y: finalPosition, duration: 2.5, ease: "back.out(1)" });
            };
            mainTimeline.add(stopReel(1, 15), "-=0.5")
                .add(stopReel(0, 15), ">-2.0")
                .add(stopReel(2, 15), ">-2.0");

            // 3. Вспышка
            mainTimeline.to(glitchOverlay, { backgroundColor: 'rgba(46, 204, 113, 0.7)', duration: 0.1, repeat: 3, yoyo: true, ease: 'none' }, ">-0.3")
                .set(glitchOverlay, { backgroundColor: 'transparent' });

            // 4. Плавно убираем слоты
            mainTimeline.to(slotsContainer, { duration: 1.0, opacity: 0, scale: 0.9, ease: "power1.in" });

            // 5. ПОСЛЕ ВСЕГО ЭТОГО, вызываем создание ауры.
            mainTimeline.call(createAura);


            // --- ФУНКЦИЯ ОЧИСТКИ ---
            return () => {
                if (mainTimeline) mainTimeline.kill();
                // GSAP.killTweensOf() - более надежный способ остановить анимации,
                // чем просто удалять элементы, к которым они привязаны.
                gsap.killTweensOf(".jackpot-aura-particle");
                
                // Удаляем все созданные элементы
                elementsToCleanup.forEach(el => {
                    if (el.parentNode) {
                        el.remove();
                    }
                });
                
                glitchOverlay.classList.remove('active-effect-jackpot');
                glitchOverlay.style.display = 'none';
                console.log("Jackpot effect (Final Attempt) cleaned up.");
            };
        },
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
                    glitchTl.to(gameWrapper, { // Или к вашему главному игровому контейнеру
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

        'timestop': function(targets) {
            // --- ЭТАП 0: ПОДГОТОВКА (без изменений) ---
            const { glitchOverlay } = targets;
            const gameWrapper = document.getElementById('gameWrapper');
            if (!glitchOverlay || !gameWrapper) return () => {};
            
            const zaWarudoText = document.createElement('div');
            zaWarudoText.textContent = 'ZA WARUDO!';
            Object.assign(zaWarudoText.style, {
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontFamily: "'Impact', 'Arial Black', sans-serif", fontSize: 'clamp(60px, 10vw, 150px)',
                color: 'rgba(255, 235, 59, 0.9)', zIndex: '10000', opacity: '0', pointerEvents: 'none',
                textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 0 0 25px rgba(0,0,0,0.7)',
            });
            glitchOverlay.appendChild(zaWarudoText);

            const pixiApp = new PIXI.Application({
                width: window.innerWidth, height: window.innerHeight, backgroundAlpha: 0,
                resizeTo: window, autoDensity: true, resolution: window.devicePixelRatio || 1,
            });
            glitchOverlay.appendChild(pixiApp.view);
            glitchOverlay.style.display = 'block';
            glitchOverlay.style.zIndex = '9998';

            const fragmentShader = `
                precision mediump float; uniform float u_time; uniform vec2 u_resolution;
                void main() {
                    vec2 uv = gl_FragCoord.xy / u_resolution.xy; vec2 center = vec2(0.5, 0.5); float dist = distance(uv, center);
                    float waveFront = u_time * 0.7; float waveWidth = 0.04; float edgeSoftness = 0.005;
                    float ring = smoothstep(waveFront - waveWidth - edgeSoftness, waveFront - waveWidth, dist) - smoothstep(waveFront, waveFront + edgeSoftness, dist);
                    if (ring > 0.0) {
                        vec3 c1=vec3(1,.9,.3), c2=vec3(.5,.7,1); vec2 tc=normalize(center-uv); float sa=.008*ring;
                        float g1d=distance(uv+tc*sa,center), g1i=smoothstep(waveFront-waveWidth,waveFront,g1d)-smoothstep(waveFront,waveFront+edgeSoftness,g1d);
                        float g2d=distance(uv-tc*sa,center), g2i=smoothstep(waveFront-waveWidth,waveFront,g2d)-smoothstep(waveFront,waveFront+edgeSoftness,g2d);
                        gl_FragColor = vec4((c1*g1i)+(c2*g2i), ring*0.7);
                    } else { discard; }
                }
            `;
            const distortionFilter = new PIXI.Filter(null, fragmentShader, { u_time: 0.0, u_resolution: [pixiApp.screen.width, pixiApp.screen.height] });
            const fullscreenQuad = new PIXI.Container();
            fullscreenQuad.filterArea = pixiApp.screen;
            fullscreenQuad.filters = [distortionFilter];
            pixiApp.stage.addChild(fullscreenQuad);

            // --- ЭТАП 2: ФИНАЛЬНАЯ ПЛАВНАЯ АНИМАЦИЯ ---
            const tl = gsap.timeline();
            const uniforms = distortionFilter.uniforms;

            tl.addLabel("expand")
              .to(uniforms, { u_time: 3.0, duration: 2.8, ease: "power2.inOut" }, "expand")
              // Анимация текста
              .fromTo(zaWarudoText, { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, "expand+=0.2")
              .to(zaWarudoText, { opacity: 0, scale: 0.8, duration: 0.7, ease: 'power2.in' }, ">+=0.8")
              // ПЛАВНО ПЕРЕХОДИМ В СОСТОЯНИЕ "ИНВЕРСИИ"
              .to(gameWrapper, {
                  '--invert': 1,
                  '--hue-rotate': '180deg',
                  '--saturate': 0.8,
                  '--contrast': 1.1,
                  duration: 2.8,
                  ease: 'power2.inOut'
              }, "expand");

            tl.addLabel("contract", ">-1.2")
              .to(uniforms, { u_time: -0.2, duration: 1.2, ease: "power3.in" }, "contract")
              // ПЛАВНО ПЕРЕХОДИМ В МОНОХРОМНОЕ СОСТОЯНИЕ
              .to(gameWrapper, {
                  '--invert': 0, // Возвращаем инверсию к 0
                  '--hue-rotate': '0deg', // Возвращаем цвет на место
                  '--saturate': 1, // Возвращаем нормальную насыщенность
                  '--grayscale': 1, // ПЛАВНО ПОВЫШАЕМ до 1
                  '--brightness': 0.9,
                  '--contrast': 1.1,
                  duration: 2.0,
                  ease: 'sine.inOut'
              }, "contract");

            // --- ЭТАП 3: ОЧИСТКА ---
            return () => {
                console.log("SMOOTH (CSS Variables) TIMESTOP effect cleaned up.");
                tl.kill();
                
                // Плавно возвращаем все значения к дефолтным
                gsap.to(gameWrapper, {
                    '--grayscale': 0,
                    '--brightness': 1,
                    duration: 0.8,
                    onComplete: () => {
                        // Важно! Очищаем инлайновые стили, которые создает GSAP, чтобы не было конфликтов
                        gameWrapper.style.cssText = gameWrapper.style.cssText.replace(/--\w+:\s*[^;]+;/g, '');
                    }
                });
                
                if (zaWarudoText) zaWarudoText.remove();
                if (pixiApp) pixiApp.destroy(true, { children: true, texture: true, baseTexture: true });
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
    'uranium_alt_1': function(targets) {
        const { glitchOverlay } = targets;
        if (!glitchOverlay) return null;
        
        glitchOverlay.style.display = 'block';
        glitchOverlay.classList.add('active-effect-uranium', 'unstable-version');

        return () => {
            if (glitchOverlay) {
                glitchOverlay.classList.remove('active-effect-uranium', 'unstable-version');
                glitchOverlay.style.display = 'none';
            }
        };
    },

    'witchy': function(targets) {
        const { glitchOverlay } = targets;
        if (!glitchOverlay) return null;

        glitchOverlay.style.display = 'block';
        glitchOverlay.classList.add('active-effect-witchy');
        const blobs = [];

        for (let i = 0; i < 20; i++) {
            const blob = document.createElement('div');
            blob.className = 'witchy-goo-blob';
            const size = gsap.utils.random(50, 250);
            gsap.set(blob, {
                width: size,
                height: size,
                x: `random(0, ${window.innerWidth})`,
                y: `random(0, ${window.innerHeight})`,
            });
            glitchOverlay.appendChild(blob);
            blobs.push(blob);

            gsap.to(blob, {
                duration: gsap.utils.random(10, 20),
                x: `random(-200, ${window.innerWidth + 200})`,
                y: `random(-200, ${window.innerHeight + 200})`,
                rotation: 'random(-360, 360)',
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
        
        return () => {
            gsap.killTweensOf(".witchy-goo-blob");
            glitchOverlay.innerHTML = '';
            glitchOverlay.classList.remove('active-effect-witchy');
            glitchOverlay.style.display = 'none';
        };
    },
    'blackhole': function(targets) {
        const { glitchOverlay, body } = targets;
        if (!glitchOverlay) return null;

        glitchOverlay.classList.add('active-effect-blackhole');
        glitchOverlay.style.display = 'block';
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const particles = [];

        for (let i = 0; i < 200; i++) {
            const particle = document.createElement('div');
            particle.className = 'blackhole-particle';
            glitchOverlay.appendChild(particle);
            
            // Начальное положение частицы по краям экрана
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (Math.max(centerX, centerY)) + Math.min(centerX, centerY);
            
            gsap.set(particle, {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                scale: gsap.utils.random(0.5, 1.5)
            });
            
            // Анимация затягивания в центр
            gsap.to(particle, {
                duration: gsap.utils.random(2, 5),
                x: centerX,
                y: centerY,
                scale: 0,
                opacity: 0,
                ease: "power2.in",
                repeat: -1,
                delay: gsap.utils.random(0, 4)
            });
            particles.push(particle);
        }

        // Анимация "стягивания" самого игрового контейнера
        const gameContainer = body.querySelector('.container-fluid');
        if (gameContainer) {
            gsap.to(gameContainer, {
                duration: 15,
                scale: 0.95,
                filter: 'blur(1px)',
                ease: "power1.inOut",
                repeat: -1,
                yoyo: true
            });
        }
        
        return () => {
            gsap.killTweensOf(".blackhole-particle");
            if(gameContainer) gsap.killTweensOf(gameContainer);
            particles.forEach(p => p.remove());
            if (gameContainer) {
                gsap.set(gameContainer, { clearProps: "all" });
            }
            if (glitchOverlay) {
                glitchOverlay.classList.remove('active-effect-blackhole');
                glitchOverlay.style.display = 'none';
            }
        };
    },

    'cosmic': function(targets) {
        const { glitchOverlay } = targets;
        if (!glitchOverlay) return null;

        glitchOverlay.classList.add('active-effect-cosmic');
        glitchOverlay.style.display = 'block';
        const elements = [];

        // Создаем звезды
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'cosmic-star';
            const size = gsap.utils.random(1, 3);
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${gsap.utils.random(0, 100)}%`;
            star.style.left = `${gsap.utils.random(0, 100)}%`;
            star.style.animationDelay = `${gsap.utils.random(0, 4)}s`;
            glitchOverlay.appendChild(star);
            elements.push(star);
        }
        
        // Создаем туманности
        for (let i = 0; i < 5; i++) {
            const nebula = document.createElement('div');
            nebula.className = 'cosmic-nebula';
            const size = gsap.utils.random(300, 600);
            nebula.style.width = `${size}px`;
            nebula.style.height = `${size}px`;
            nebula.style.top = `${gsap.utils.random(-20, 80)}%`;
            nebula.style.left = `${gsap.utils.random(-20, 80)}%`;
            nebula.style.background = `radial-gradient(ellipse, hsla(${gsap.utils.random(200, 260)}, 100%, 70%, 0.3) 0%, transparent 70%)`;
            glitchOverlay.appendChild(nebula);
            elements.push(nebula);

            gsap.to(nebula, {
                duration: gsap.utils.random(20, 40),
                opacity: gsap.utils.random(0.2, 0.5),
                rotation: '+=360',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }

        return () => {
            gsap.killTweensOf(".cosmic-nebula");
            elements.forEach(el => el.remove());
            if (glitchOverlay) {
                glitchOverlay.classList.remove('active-effect-cosmic');
                glitchOverlay.style.display = 'none';
            }
        };
    },

    'russian': function(targets) {
        const gameWrapper = document.getElementById('gameWrapper');
        if (!gameWrapper) return null;

        gameWrapper.classList.add('visual-effect-russian-drunk');

        return () => {
            if (gameWrapper) {
                gameWrapper.classList.remove('visual-effect-russian-drunk');
            }
        };
    },

    'berserk': function(targets) {
            const { glitchOverlay } = targets;
            if (!glitchOverlay) return null;

            glitchOverlay.classList.add('active-effect-berserk');
            
            const brand = document.createElement('div');
            brand.className = 'berserk-brand';
            glitchOverlay.appendChild(brand);

            const tl = gsap.timeline({ repeat: -1, yoyo: true });

            tl.fromTo(brand, {
                opacity: 0.7,
                scale: 1,
                // Начальное положение в центре
                x: "-50%", 
                y: "-50%"
            }, {
                duration: 2.5,
                opacity: 1,
                scale: 1.05,
                // Анимация кровавого свечения фильтра
                filter: "drop-shadow(0 0 15px rgba(255, 20, 20, 1)) saturate(1.8) contrast(1.3)",
                ease: "power1.inOut"
            })
            // Добавляем эффект "кровотечения" - легкое дрожание и смещение
            .to(brand, {
                duration: 0.1,
                x: "-51%", // Сдвиг на 1%
                y: "-49%",
                repeat: 3,
                yoyo: true,
                ease: "rough({ template: none.out, strength: 1, points: 20, taper: 'none', randomize: true, clamp: false})"
            }, "-=0.5");

            return () => {
                tl.kill();
                if (brand.parentNode) brand.remove();
                if (glitchOverlay) glitchOverlay.classList.remove('active-effect-berserk');
            };
        },

    'bee': function(targets) {
            const { glitchOverlay } = targets;
            if (!glitchOverlay) return null;

            glitchOverlay.classList.add('active-effect-bee');
            const bees = [];

            for (let i = 0; i < 15; i++) {
                const bee = document.createElement('div');
                bee.className = 'bee-particle';
                glitchOverlay.appendChild(bee);
                bees.push(bee);

                // Запускаем анимацию для каждой пчелы
                gsap.to(bee, {
                    duration: gsap.utils.random(3, 6),
                    x: `random(0, ${window.innerWidth})`,
                    y: `random(0, ${window.innerHeight})`,
                    rotation: "random(-45, 45)",
                    ease: "power1.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: gsap.utils.random(0, 5)
                });
            }

            return () => {
                bees.forEach(bee => {
                    gsap.killTweensOf(bee);
                    if (bee.parentNode) bee.remove();
                });
                if (glitchOverlay) glitchOverlay.classList.remove('active-effect-bee');
            };
        },
        
        'epic_alt_1': function(targets) {
            const { glitchOverlay } = targets;
            if (!glitchOverlay) return null;
            
            const container = document.createElement('div');
            container.className = 'velocity-line-container';
            glitchOverlay.appendChild(container);

            const lines = [];
            
            for (let i = 0; i < 20; i++) {
                const line = document.createElement('div');
                line.className = 'velocity-line';
                container.appendChild(line);
                lines.push(line);

                gsap.fromTo(line, {
                    y: `random(0, ${window.innerHeight})`,
                    x: `random(-${window.innerWidth}, -100)`,
                    width: "random(100, 400)",
                    opacity: "random(0.3, 0.8)"
                }, {
                    duration: gsap.utils.random(0.5, 1.5),
                    x: `+=${window.innerWidth * 2}`,
                    ease: "none", // Используем "none" для равномерной скорости, как у ветра
                    repeat: -1,
                    delay: gsap.utils.random(0, 1.5)
                });
            }

            return () => {
                lines.forEach(line => gsap.killTweensOf(line));
                if (container.parentNode) container.remove();
            };
        },

        'legendary_alt_1': function(targets) {
            const { glitchOverlay } = targets;
            if (!glitchOverlay) return null;

            const particles = [];
            const colors = ["#f06292", "#f8bbd0", "#ff4081", "#ffeb3b", "#4fc3f7"];

            for (let i = 0; i < 150; i++) {
                const particle = document.createElement('div');
                particle.className = 'confetti-particle';
                particle.style.backgroundColor = gsap.utils.random(colors);
                glitchOverlay.appendChild(particle);
                particles.push(particle);

                gsap.fromTo(particle, {
                    x: `random(0, ${window.innerWidth})`,
                    y: -20,
                    opacity: 1
                }, {
                    duration: gsap.utils.random(3, 7),
                    y: window.innerHeight + 20,
                    opacity: 0,
                    rotationX: "random(0, 360)",
                    rotationY: "random(0, 360)",
                    ease: "power1.in",
                    repeat: -1,
                    delay: gsap.utils.random(0, 6)
                });
            }

            return () => {
                particles.forEach(p => gsap.killTweensOf(p));
                glitchOverlay.innerHTML = ''; // Быстрый способ очистить все частицы
            };
        },
        'neon': function(targets) {
            const { glitchOverlay } = targets;
            if (!glitchOverlay) return null;
            
            const container = document.createElement('div');
            container.className = 'neon-border-container';
            
            const sides = ['top', 'right', 'bottom', 'left'];
            sides.forEach(side => {
                const tube = document.createElement('div');
                tube.className = `neon-tube neon-tube-${side}`;
                container.appendChild(tube);
            });

            glitchOverlay.appendChild(container);
            glitchOverlay.classList.add('active-effect-neon');

            return () => {
                if(container.parentNode) container.remove();
                if(glitchOverlay) glitchOverlay.classList.remove('active-effect-neon');
            };
        },

        // 'inversion': function(targets) { ... }
        // ... другие эффекты ...
    }
};