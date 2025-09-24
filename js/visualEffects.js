// js/visualEffects.js

const VisualEffects = {
    // Отладка (true — подробные логи)
    debug: false,

    // Активный cleanup текущего эффекта
    activeCleanupFunction: null,

    // Музыка по умолчанию
    defaultMusicTrack: "audio/vibeOst1.mp3",

    // Карта музыки для эффектов
    effectMusicMap: {
        error: "audio/error-sfx.mp3",
        timestop: "audio/timestop-sfx.mp3",
        motivation: "audio/motivation-sfx.mp3",
        smokinsexystyle: "audio/smokinsexystyle-sfx.mp3",
        uranium_alt_1: "audio/altUranium-sfx.mp3"
        // при необходимости добавляйте новые
    },

    // Воспроизведение трека (без автозапуска при volume=0 или ручной паузе)
    playMusic(trackSrc, audioEl, isUserInitiatedPlay = false) {
        if (!audioEl) { console.warn("VisualEffects.playMusic: audioEl is missing"); return; }
        if (!trackSrc) { console.warn("VisualEffects.playMusic: trackSrc is missing"); return; }

        const wasManuallyPausedByPlayer = audioEl.wasManuallyPaused === true;
        const volumeIsZero = (audioEl.volume || 0) === 0;
        const currentFullSrc = audioEl.currentSrc || "";
        const isSameTrack = currentFullSrc.endsWith(trackSrc);

        // Уже играет — ничего не делаем
        if (isSameTrack && !audioEl.paused && !isUserInitiatedPlay) {
            if (this.debug) console.log("VisualEffects.playMusic: same track already playing");
            return;
        }

        // Трек тот же, на паузе вручную — не запускаем без user-init
        if (isSameTrack && audioEl.paused && !isUserInitiatedPlay && wasManuallyPausedByPlayer) {
            if (this.debug) console.log("VisualEffects.playMusic: paused manually; skip auto play");
            return;
        }

        const attemptPlay = () => {
            if (volumeIsZero) {
                if (this.debug) console.log("VisualEffects.playMusic: volume is 0 -> skip play");
                return;
            }
            if (isUserInitiatedPlay || !wasManuallyPausedByPlayer) {
                const p = audioEl.play();
                if (p && typeof p.catch === 'function') {
                    p.catch(err => console.warn("VisualEffects.playMusic: play() failed:", err));
                }
            } else {
                if (this.debug) console.log("VisualEffects.playMusic: delayed due to manual pause");
            }
        };

        if (!isSameTrack || !currentFullSrc || audioEl.src === window.location.href) {
            audioEl.src = trackSrc;
            if (this.debug) console.log("VisualEffects.playMusic: set src, wait canplaythrough", trackSrc);
            audioEl.addEventListener('canplaythrough', attemptPlay, { once: true });
            audioEl.addEventListener('error', (e) => console.error("VisualEffects.playMusic: audio error:", e), { once: true });
            audioEl.load();
        } else {
            if (this.debug) console.log("VisualEffects.playMusic: same src, attempt direct play");
            attemptPlay();
        }
    },

    // Переключение на дефолтный трек (мягкая логика)
    switchToDefaultMusic(audioEl, isInitialLoad = false) {
        if (!audioEl) return;
        const isAlreadyDefault = audioEl.currentSrc && audioEl.currentSrc.endsWith(this.defaultMusicTrack);
        const shouldPlayNow = !isInitialLoad && audioEl.wasManuallyPaused !== true && (audioEl.volume || 0) > 0;

        if (!isAlreadyDefault) {
            this.playMusic(this.defaultMusicTrack, audioEl, shouldPlayNow && audioEl.paused);
        } else if (audioEl.paused && shouldPlayNow) {
            this.playMusic(this.defaultMusicTrack, audioEl, true);
        } else if (isInitialLoad && (!audioEl.currentSrc || !audioEl.currentSrc.endsWith(this.defaultMusicTrack))) {
            audioEl.src = this.defaultMusicTrack;
            audioEl.load();
            if (this.debug) console.log("VisualEffects.switchToDefaultMusic: set default on initial load");
        } else {
            if (this.debug) console.log("VisualEffects.switchToDefaultMusic: no change");
        }
    },

    // Очистка overlay/классов перед применением нового эффекта
    _resetOverlay(body, glitchOverlay) {
        // Удаляем классы вида visual-effect-* у body
        if (body) {
            [...body.classList].forEach(cls => {
                if (cls.startsWith('visual-effect-')) body.classList.remove(cls);
            });
        }
        // Очищаем overlay: классы active-effect-*, дочерние элементы, скрываем
        if (glitchOverlay) {
            [...glitchOverlay.classList].forEach(cls => {
                if (cls.startsWith('active-effect-')) glitchOverlay.classList.remove(cls);
            });
            if (glitchOverlay.childNodes.length) {
                while (glitchOverlay.firstChild) glitchOverlay.firstChild.remove();
            }
            glitchOverlay.style.display = 'none';
        }
    },

    // Вспомогательный: создать scope-контейнер внутри overlay
    _createScope(glitchOverlay, overlayClass = null) {
        if (!glitchOverlay) return null;
        glitchOverlay.style.display = 'block';
        if (overlayClass) glitchOverlay.classList.add(overlayClass);
        const scope = document.createElement('div');
        scope.className = 've-scope';
        glitchOverlay.appendChild(scope);
        return scope;
    },

    // Вспомогательный: завершить/очистить scope
    _cleanupScope(glitchOverlay, scope, overlayClass = null) {
        try {
            if (typeof gsap !== 'undefined') {
                gsap.killTweensOf(scope);
                if (scope && scope.querySelectorAll) {
                    gsap.killTweensOf(scope.querySelectorAll('*'));
                }
            }
        } catch (e) { /* ignore */ }

        if (scope && scope.parentNode) scope.remove();
        if (glitchOverlay && overlayClass) glitchOverlay.classList.remove(overlayClass);
        if (glitchOverlay && glitchOverlay.childNodes.length === 0) {
            glitchOverlay.style.display = 'none';
        }
    },

    // Применить визуальный эффект (или снять, если effectId пуст)
    apply(effectId, targetElements, isInitialLoad = false) {
        // Снимаем предыдущий эффект
        if (this.activeCleanupFunction) {
            try { this.activeCleanupFunction(); } catch (e) { console.warn("VisualEffects.cleanup error:", e); }
            this.activeCleanupFunction = null;
        }

        const { body, glitchOverlay, audioPlayer } = targetElements || {};

        // Чистим overlay/классы
        this._resetOverlay(body, glitchOverlay);

        // Музыка
        if (audioPlayer) {
            const musicForThisEffect = effectId ? this.effectMusicMap[effectId] : null;
            const targetTrack = musicForThisEffect || this.defaultMusicTrack;
            if (isInitialLoad) {
                if (!audioPlayer.currentSrc || !audioPlayer.currentSrc.endsWith(targetTrack)) {
                    audioPlayer.src = targetTrack;
                    audioPlayer.load();
                    if (this.debug) console.log("VisualEffects.apply: set music src on initial load:", targetTrack);
                }
            } else {
                this.playMusic(targetTrack, audioPlayer, false);
            }
        }

        if (!effectId) {
            if (this.debug) console.log("VisualEffects.apply: cleared all effects");
            return;
        }

        const effectFunction = this.effects[effectId];
        if (typeof effectFunction === 'function') {
            const cleanup = effectFunction.call(this, targetElements, isInitialLoad);
            if (typeof cleanup === 'function') {
                this.activeCleanupFunction = cleanup;
            }
        } else {
            console.log(`VisualEffects: no effect defined for ID '${effectId}'`);
        }
    },

    // Список эффектов
    effects: {
        // JACKPOT
        jackpot(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-jackpot';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            if (typeof gsap === 'undefined') {
                // Fallback: просто вспышка текста
                const label = document.createElement('div');
                label.textContent = 'JACKPOT!';
                Object.assign(label.style, {
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    fontSize: '64px', color: '#2ecc71', textShadow: '0 0 10px #2ecc71', fontWeight: 'bold'
                });
                scope.appendChild(label);
                return () => this._cleanupScope(glitchOverlay, scope, overlayClass);
            }

            const reelHeight = 350;
            const reelItemsCount = 24;
            const cardImagePath = 'img/effects/jackpot1.png';

            const container = document.createElement('div');
            container.className = 'jackpot-slots-container';
            scope.appendChild(container);

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
                container.appendChild(slot);
                reels.push(reel);
            }

            const tl = gsap.timeline();
            tl.from(container, { duration: 0.5, opacity: 0, scale: 0.9, ease: "back.out(1.7)" })
              .to(reels, { y: `-=${reelHeight * (reelItemsCount - 5)}`, duration: 1.6, ease: "power1.in", stagger: 0.12 });

            const stopReel = (reelIndex, pos) => {
                const reel = reels[reelIndex];
                const offset = Math.floor(Math.random() * 5 - 2);
                const finalY = -(pos + offset) * reelHeight;
                return gsap.to(reel, { y: finalY, duration: 1.6, ease: "back.out(1.2)" });
            };
            tl.add(stopReel(1, 12), "-=0.4")
              .add(stopReel(0, 12), ">-1.6")
              .add(stopReel(2, 12), ">-1.6")
              .to(container, { duration: 0.6, opacity: 0, ease: "power1.in" }, ">+=0.2");

            // Аура после
            tl.call(() => {
                const aura = document.createElement('div');
                aura.className = 'jackpot-aura-container';
                scope.appendChild(aura);
                for (let i = 0; i < 60; i++) {
                    const p = document.createElement('div');
                    p.className = 'jackpot-aura-particle';
                    aura.appendChild(p);
                    const isLeft = Math.random() > 0.5;
                    gsap.set(p, {
                        x: isLeft ? gsap.utils.random(-80, window.innerWidth * 0.15) : gsap.utils.random(window.innerWidth * 0.85, window.innerWidth + 80),
                        y: gsap.utils.random(-80, window.innerHeight + 80),
                        scale: gsap.utils.random(0.2, 1.2),
                        opacity: 0.8
                    });
                    gsap.to(p, {
                        duration: gsap.utils.random(2.5, 4.5),
                        x: `+=${(isLeft ? 1 : -1) * gsap.utils.random(40, 100)}`,
                        y: `+=${gsap.utils.random(-120, 120)}`,
                        opacity: 0,
                        scale: `*=${gsap.utils.random(0.7, 1.8)}`,
                        ease: "power2.out",
                        repeat: -1,
                        delay: gsap.utils.random(0, 2)
                    });
                }
            });

            return () => {
                try { tl.kill(); } catch (e) {}
                this._cleanupScope(glitchOverlay, scope, overlayClass);
            };
        },

        // ERROR (глитч)
        error(targets) {
            const { glitchOverlay, body } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-error';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const gameWrapper = document.getElementById('gameWrapper') || body || document.body;

            if (typeof gsap === 'undefined') {
                // Fallback: статические цветные слои
                const red = document.createElement('div');
                red.style.cssText = 'position:absolute;inset:0;background:rgba(255,0,0,.15);mix-blend-mode:screen';
                const cyan = document.createElement('div');
                cyan.style.cssText = 'position:absolute;inset:0;background:rgba(0,255,255,.15);mix-blend-mode:screen';
                scope.appendChild(red); scope.appendChild(cyan);
                return () => this._cleanupScope(glitchOverlay, scope, overlayClass);
            }

            const redLayer = document.createElement('div');
            redLayer.className = 'glitch-color-layer red';
            scope.appendChild(redLayer);

            const cyanLayer = document.createElement('div');
            cyanLayer.className = 'glitch-color-layer cyan';
            scope.appendChild(cyanLayer);

            const tl = gsap.timeline({
                repeat: -1,
                repeatDelay: Math.random() * 0.5 + 0.1,
                onRepeat: () => tl.repeatDelay(Math.random() * 0.5 + 0.1)
            });

            // Дрожание контейнера
            if (gameWrapper) {
                tl.to(gameWrapper, {
                    duration: 0.03,
                    x: () => gsap.utils.random(-3, 3) + "px",
                    y: () => gsap.utils.random(-3, 3) + "px",
                    rotation: () => gsap.utils.random(-0.2, 0.2) + "deg",
                    ease: "steps(1)",
                    repeat: 2,
                    yoyo: true
                }, 0);
            }

            // Цветные слои
            tl.fromTo(redLayer, { opacity: 0, x: () => gsap.utils.random(-10, 10) + "px" },
                { duration: 0.05, opacity: () => Math.random() * 0.3 + 0.1, x: 0, ease: "steps(1)", repeat: 1, yoyo: true }, "<0.02");
            tl.fromTo(cyanLayer, { opacity: 0, x: () => gsap.utils.random(-10, 10) + "px" },
                { duration: 0.05, opacity: () => Math.random() * 0.3 + 0.1, x: 0, ease: "steps(1)", repeat: 1, yoyo: true }, "<0.03");

            // Глитч-линии
            const createLine = () => {
                if (!scope.isConnected) return;
                const line = document.createElement('div');
                line.className = 'glitch-line';
                line.style.height = `${gsap.utils.random(1, 8)}px`;
                line.style.top = `${gsap.utils.random(0, 100)}%`;
                scope.appendChild(line);
                const ltl = gsap.timeline({ onComplete: () => line.remove() });
                ltl.to(line, { duration: gsap.utils.random(0.05, 0.15), x: 0, opacity: gsap.utils.random(0.2, 0.5), ease: 'steps(3)' })
                   .to(line, { duration: gsap.utils.random(0.03, 0.1), x: Math.random() > 0.5 ? "100%" : "-100%", opacity: 0, ease: 'steps(2)', delay: gsap.utils.random(0, 0.1) });
            };
            tl.call(createLine, null, ">0.01").call(createLine, null, ">0.03").call(createLine, null, ">0.05");

            return () => {
                try { tl.kill(); } catch (e) {}
                this._cleanupScope(glitchOverlay, scope, overlayClass);
            };
        },

        // URANIUM (простой body-класс)
        uranium(targets) {
            const { body } = targets || {};
            if (!body) return null;
            body.classList.add('visual-effect-uranium');
            return () => {
                body.classList.remove('visual-effect-uranium');
            };
        },

        // TIMESTOP (PIXI с fallback)
        timestop(targets) {
            const { glitchOverlay } = targets || {};
            const gameWrapper = document.getElementById('gameWrapper');
            if (!glitchOverlay || !gameWrapper) return () => {};

            // Fallback без PIXI
            if (typeof PIXI === 'undefined' || typeof gsap === 'undefined') {
                const tl = typeof gsap !== 'undefined' ? gsap.timeline() : null;
                if (tl) {
                    tl.to(gameWrapper, { '--invert': 1, duration: 1.2, ease: 'power2.inOut' })
                      .to(gameWrapper, { '--invert': 0, '--grayscale': 1, '--brightness': 0.9, duration: 1.2, ease: 'power2.inOut' }, '>');
                }
                return () => {
                    if (tl) try { tl.kill(); } catch (e) {}
                    if (typeof gsap !== 'undefined') {
                        gsap.to(gameWrapper, { '--grayscale': 0, '--brightness': 1, duration: 0.6, onComplete: () => {
                            gameWrapper.style.cssText = gameWrapper.style.cssText.replace(/--\w+:\s*[^;]+;/g, '');
                        }});
                    } else {
                        gameWrapper.style.filter = '';
                    }
                };
            }

            const overlayClass = 'active-effect-timestop';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const zaWarudoText = document.createElement('div');
            zaWarudoText.textContent = 'ZA WARUDO!';
            Object.assign(zaWarudoText.style, {
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontFamily: "'Impact', 'Arial Black', sans-serif", fontSize: 'clamp(60px, 10vw, 150px)',
                color: 'rgba(255, 235, 59, 0.9)', zIndex: '10000', opacity: '0', pointerEvents: 'none',
                textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 0 0 25px rgba(0,0,0,0.7)',
            });
            scope.appendChild(zaWarudoText);

            const pixiApp = new PIXI.Application({
                width: window.innerWidth, height: window.innerHeight, backgroundAlpha: 0,
                resizeTo: window, autoDensity: true, resolution: window.devicePixelRatio || 1
            });
            scope.appendChild(pixiApp.view);
            glitchOverlay.style.zIndex = '9998';

            const fragmentShader = `
                precision mediump float; uniform float u_time; uniform vec2 u_resolution;
                void main() {
                    vec2 uv = gl_FragCoord.xy / u_resolution.xy; vec2 center = vec2(0.5, 0.5); float dist = distance(uv, center);
                    float waveFront = u_time * 0.7; float waveWidth = 0.04; float edgeSoftness = 0.005;
                    float ring = smoothstep(waveFront - waveWidth - edgeSoftness, waveFront - waveWidth, dist) - smoothstep(waveFront, waveFront + edgeSoftness, dist);
                    if (ring > 0.0) {
                        vec3 c1=vec3(1.,.9,.3), c2=vec3(.5,.7,1.); vec2 tc=normalize(center-uv); float sa=.008*ring;
                        float g1d=distance(uv+tc*sa,center), g1i=smoothstep(waveFront-waveWidth,waveFront,g1d)-smoothstep(waveFront,waveFront+edgeSoftness,g1d);
                        float g2d=distance(uv-tc*sa,center), g2i=smoothstep(waveFront-waveWidth,waveFront,g2d)-smoothstep(waveFront,waveFront+edgeSoftness,g2d);
                        gl_FragColor = vec4((c1*g1i)+(c2*g2i), ring*0.7);
                    } else { discard; }
                }
            `;
            const filter = new PIXI.Filter(null, fragmentShader, { u_time: 0.0, u_resolution: [pixiApp.screen.width, pixiApp.screen.height] });
            const quad = new PIXI.Container();
            quad.filterArea = pixiApp.screen;
            quad.filters = [filter];
            pixiApp.stage.addChild(quad);

            const tl = gsap.timeline();
            const uniforms = filter.uniforms;

            tl.addLabel("expand")
              .to(uniforms, { u_time: 3.0, duration: 2.8, ease: "power2.inOut" }, "expand")
              .fromTo(zaWarudoText, { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, "expand+=0.2")
              .to(zaWarudoText, { opacity: 0, scale: 0.8, duration: 0.7, ease: 'power2.in' }, ">+=0.8")
              .to(gameWrapper, { '--invert': 1, '--hue-rotate': '180deg', '--saturate': 0.8, '--contrast': 1.1, duration: 2.8, ease: 'power2.inOut' }, "expand")
              .addLabel("contract", ">-1.2")
              .to(uniforms, { u_time: -0.2, duration: 1.2, ease: "power3.in" }, "contract")
              .to(gameWrapper, { '--invert': 0, '--hue-rotate': '0deg', '--saturate': 1, '--grayscale': 1, '--brightness': 0.9, '--contrast': 1.1, duration: 2.0, ease: 'sine.inOut' }, "contract");

            return () => {
                try { tl.kill(); } catch (e) {}
                gsap.to(gameWrapper, {
                    '--grayscale': 0, '--brightness': 1, duration: 0.8,
                    onComplete: () => { gameWrapper.style.cssText = gameWrapper.style.cssText.replace(/--\w+:\s*[^;]+;/g, ''); }
                });
                try { pixiApp.destroy(true, { children: true, texture: true, baseTexture: true }); } catch (e) {}
                this._cleanupScope(glitchOverlay, scope, overlayClass);
            };
        },

        // SSS (Dante)
        smokinsexystyle(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-sss';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const container = document.createElement('div');
            Object.assign(container.style, { position: 'absolute', top: '20px', right: '20px', zIndex: '10' });
            const sssText = document.createElement('div');
            sssText.textContent = 'SSS';
            Object.assign(sssText.style, {
                fontFamily: "'Pirata One','Arial Black',sans-serif", fontSize: 'clamp(40px,8vw,100px)', color: '#FFD700',
                WebkitTextStroke: '2px #4A2A00', textShadow: '0 0 15px rgba(255,165,0,0.7), 0 0 30px rgba(255,100,0,0.5)'
            });
            const sub = document.createElement('div');
            sub.textContent = "Smokin' Sexy Style!!";
            Object.assign(sub.style, { fontFamily: "'Pirata One',cursive", fontSize: 'clamp(16px,3vw,30px)', color: '#FF8C00', textAlign: 'center', marginTop: '-10px', textShadow: '1px 1px 2px #000' });

            container.appendChild(sssText);
            container.appendChild(sub);
            scope.appendChild(container);

            if (typeof gsap !== 'undefined') {
                const tl = gsap.timeline();
                tl.from(container, { duration: 0.7, x: '+=50px', opacity: 0, scale: 0.8, ease: 'back.out(1.7)' })
                  .to(sssText, {
                      duration: 1.2,
                      css: { textShadow: '0 0 25px rgba(255,165,0,1), 0 0 45px rgba(255,100,0,0.8)' },
                      repeat: -1, yoyo: true, ease: 'power1.inOut'
                  }, "-=0.3");
                return () => { try { tl.kill(); } catch (e) {} this._cleanupScope(glitchOverlay, scope, overlayClass); };
            }

            return () => this._cleanupScope(glitchOverlay, scope, overlayClass);
        },

        // MOTIVATION (slashes)
        motivation(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-motivation';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const svgNS = "http://www.w3.org/2000/svg";
            let intervalId = null;

            const createSlash = () => {
                if (!scope.isConnected) return;
                const svg = document.createElementNS(svgNS, "svg");
                Object.assign(svg.style, { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' });
                scope.appendChild(svg);

                const line = document.createElementNS(svgNS, "line");
                const startX = Math.random() * glitchOverlay.offsetWidth;
                const startY = Math.random() * glitchOverlay.offsetHeight;
                const length = (Math.random() * 1600) + 400;
                const angle = Math.random() * Math.PI * 2;
                const endX = startX + Math.cos(angle) * length;
                const endY = startY + Math.sin(angle) * length;

                line.setAttribute("x1", String(startX));
                line.setAttribute("y1", String(startY));
                line.setAttribute("x2", String(startX));
                line.setAttribute("y2", String(startY));

                const hue = 180 + Math.random() * 60;
                line.style.stroke = `hsl(${hue},100%,${Math.round(60 + Math.random() * 20)}%)`;
                line.style.strokeWidth = String(2 + Math.random() * 3);
                line.style.strokeLinecap = "round";
                line.style.filter = `drop-shadow(0 0 ${Math.round(3 + Math.random() * 8)}px ${line.style.stroke})`;
                svg.appendChild(line);

                if (typeof gsap !== 'undefined') {
                    gsap.timeline({ onComplete: () => svg.remove() })
                        .to(line, { attr: { x2: endX, y2: endY }, duration: 0.15, ease: "power2.out" })
                        .to(line, { opacity: 0, duration: 0.4, delay: 0.1 }, ">");
                } else {
                    // Простейший fallback
                    setTimeout(() => svg.remove(), 600);
                }
            };

            if (intervalId) clearInterval(intervalId);
            const delay = 300 + Math.random() * 500;
            intervalId = setInterval(createSlash, delay);
            createSlash();

            return () => {
                if (intervalId) clearInterval(intervalId);
                this._cleanupScope(glitchOverlay, scope, overlayClass);
            };
        },

        // URANIUM ALT 1 (простые классы)
        uranium_alt_1(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;
            const overlayClass = 'active-effect-uranium unstable-version';
            glitchOverlay.style.display = 'block';
            glitchOverlay.classList.add('active-effect-uranium', 'unstable-version');

            return () => {
                glitchOverlay.classList.remove('active-effect-uranium', 'unstable-version');
                glitchOverlay.style.display = 'none';
            };
        },

        // WITCHY
        witchy(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-witchy';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const blobs = [];
            const count = 20;
            for (let i = 0; i < count; i++) {
                const blob = document.createElement('div');
                blob.className = 'witchy-goo-blob';
                const size = 50 + Math.random() * 200;
                blob.style.width = size + 'px';
                blob.style.height = size + 'px';
                scope.appendChild(blob);
                blobs.push(blob);

                if (typeof gsap !== 'undefined') {
                    gsap.set(blob, { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight });
                    gsap.to(blob, {
                        duration: 10 + Math.random() * 10,
                        x: `random(-200, ${window.innerWidth + 200})`,
                        y: `random(-200, ${window.innerHeight + 200})`,
                        rotation: 'random(-360, 360)',
                        repeat: -1, yoyo: true, ease: "sine.inOut"
                    });
                }
            }

            return () => {
                this._cleanupScope(glitchOverlay, scope, overlayClass);
            };
        },

        // BLACKHOLE
        blackhole(targets) {
            const { glitchOverlay, body } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-blackhole';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const particles = [];
            const count = 200;
            for (let i = 0; i < count; i++) {
                const p = document.createElement('div');
                p.className = 'blackhole-particle';
                scope.appendChild(p);
                particles.push(p);

                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * Math.max(centerX, centerY) + Math.min(centerX, centerY);
                if (typeof gsap !== 'undefined') {
                    gsap.set(p, { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius, scale: Math.random() + 0.5, opacity: 1 });
                    gsap.to(p, {
                        duration: 2 + Math.random() * 3,
                        x: centerX, y: centerY, scale: 0, opacity: 0, ease: "power2.in", repeat: -1, delay: Math.random() * 4
                    });
                } else {
                    p.style.left = (centerX + Math.cos(angle) * radius) + 'px';
                    p.style.top = (centerY + Math.sin(angle) * radius) + 'px';
                }
            }

            // Лёгкое дыхание основного контейнера
            const gameContainer = body ? body.querySelector('.container-fluid') : null;
            if (gameContainer && typeof gsap !== 'undefined') {
                gsap.to(gameContainer, { duration: 15, scale: 0.95, filter: 'blur(1px)', ease: "power1.inOut", repeat: -1, yoyo: true });
            }

            return () => {
                if (typeof gsap !== 'undefined') {
                    if (gameContainer) gsap.killTweensOf(gameContainer);
                }
                this._cleanupScope(glitchOverlay, scope, overlayClass);
            };
        },

        // COSMIC
        cosmic(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-cosmic';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const elements = [];

            // Звезды
            const stars = 50;
            for (let i = 0; i < stars; i++) {
                const star = document.createElement('div');
                star.className = 'cosmic-star';
                const size = 1 + Math.random() * 2;
                Object.assign(star.style, {
                    width: `${size}px`, height: `${size}px`,
                    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`
                });
                scope.appendChild(star);
                elements.push(star);
            }
            // Туманности
            const nebulas = 5;
            for (let i = 0; i < nebulas; i++) {
                const nebula = document.createElement('div');
                nebula.className = 'cosmic-nebula';
                const size = 300 + Math.random() * 300;
                nebula.style.width = `${size}px`;
                nebula.style.height = `${size}px`;
                nebula.style.top = `${-20 + Math.random() * 100}%`;
                nebula.style.left = `${-20 + Math.random() * 100}%`;
                nebula.style.background = `radial-gradient(ellipse, hsla(${200 + Math.random() * 60}, 100%, 70%, 0.3) 0%, transparent 70%)`;
                scope.appendChild(nebula);
                elements.push(nebula);

                if (typeof gsap !== 'undefined') {
                    gsap.to(nebula, {
                        duration: 20 + Math.random() * 20,
                        opacity: 0.2 + Math.random() * 0.3,
                        rotation: '+=360',
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut'
                    });
                }
            }

            return () => {
                this._cleanupScope(glitchOverlay, scope, overlayClass);
            };
        },

        // RUSSIAN
        russian(targets) {
            const gameWrapper = document.getElementById('gameWrapper');
            if (!gameWrapper) return null;
            gameWrapper.classList.add('visual-effect-russian-drunk');
            return () => { gameWrapper.classList.remove('visual-effect-russian-drunk'); };
        },

        // BERSERK
        berserk(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-berserk';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const brand = document.createElement('div');
            brand.className = 'berserk-brand';
            scope.appendChild(brand);

            let tl = null;
            if (typeof gsap !== 'undefined') {
                tl = gsap.timeline({ repeat: -1, yoyo: true });
                tl.fromTo(brand, { opacity: 0.7, scale: 1, x: "-50%", y: "-50%" },
                                  { duration: 2.5, opacity: 1, scale: 1.05, filter: "drop-shadow(0 0 15px rgba(255,20,20,1)) saturate(1.8) contrast(1.3)", ease: "power1.inOut" })
                  .to(brand, { duration: 0.1, x: "-51%", y: "-49%", repeat: 3, yoyo: true, ease: "power1.inOut" }, "-=0.5");
            }
            return () => { try { tl && tl.kill(); } catch (e) {} this._cleanupScope(glitchOverlay, scope, overlayClass); };
        },

        // BEE
        bee(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-bee';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            // Настройка фонового тайла (на случай, если CSS не применился/хочешь другой размер)
            const prevImg  = glitchOverlay.style.backgroundImage;
            const prevSize = glitchOverlay.style.backgroundSize;
            const prevRep  = glitchOverlay.style.backgroundRepeat;

            // Оставь путь/размеры под свой тайл
            glitchOverlay.style.backgroundImage  = "url('img/effects/honeycomb.png')";
            glitchOverlay.style.backgroundSize   = '72px 72px';
            glitchOverlay.style.backgroundRepeat = 'repeat';

            const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
            const vw = () => window.innerWidth;
            const vh = () => window.innerHeight;

            // Адаптивная плотность пчёл, но жёсткий верхний лимит
            const maxByWidth = Math.ceil(vw() / 500) + 4; // 5..10
            const COUNT = Math.max(5, Math.min(10, maxByWidth)) * (reduceMotion ? 0.5 : 1);
            const bees = [];
            const tweens = [];

            function spawnBee() {
                const b = document.createElement('div');
                b.className = 'bee-particle'; // у тебя уже есть стили
                b.style.position = 'absolute';
                b.style.pointerEvents = 'none';
                scope.appendChild(b);
                bees.push(b);

                const startX = Math.random() * vw();
                const startY = Math.random() * vh();
                const dx = (120 + Math.random() * 160) * (Math.random() < 0.5 ? -1 : 1);
                const dy = (80  + Math.random() * 120) * (Math.random() < 0.5 ? -1 : 1);
                const rot = Math.random() * 60 - 30;

                if (typeof gsap !== 'undefined') {
                gsap.set(b, { x: startX, y: startY, rotate: Math.random() * 360, transformOrigin: '50% 50%' });
                const t = gsap.to(b, {
                    duration: 5 + Math.random() * 4,
                    x: `+=${dx}`,
                    y: `+=${dy}`,
                    rotation: `+=${rot}`,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1,
                    overwrite: 'auto'
                });
                tweens.push(t);
                } else {
                // fallback: без GSAP — простое плавание через CSS transition
                b.style.transform = `translate(${startX}px, ${startY}px) rotate(${Math.random() * 360}deg)`;
                b.style.transition = 'transform 6s ease-in-out';
                let nx = startX, ny = startY, r = 0;
                const it = setInterval(() => {
                    nx = Math.max(0, Math.min(vw() - 12, nx + dx));
                    ny = Math.max(0, Math.min(vh() - 12, ny + dy));
                    r += rot;
                    b.style.transform = `translate(${nx}px, ${ny}px) rotate(${r}deg)`;
                    // меняем направление
                    dx *= -1; dy *= -1; rot *= -1;
                }, 6000);
                tweens.push({ kill: () => clearInterval(it) });
                }
            }

            for (let i = 0; i < COUNT; i++) spawnBee();

            // Экономия: пауза при скрытии вкладки
            const onVis = () => {
                const paused = document.hidden;
                tweens.forEach(t => t?.paused && t.paused(paused));
            };
            document.addEventListener('visibilitychange', onVis);

            return () => {
                try { tweens.forEach(t => t?.kill && t.kill()); } catch (e) {}
                bees.forEach(b => { try { b.remove(); } catch (e) {} });
                document.removeEventListener('visibilitychange', onVis);
                // вернуть фоновые стили
                glitchOverlay.style.backgroundImage  = prevImg;
                glitchOverlay.style.backgroundSize   = prevSize;
                glitchOverlay.style.backgroundRepeat = prevRep;
                this._cleanupScope(glitchOverlay, scope, overlayClass);
            };
        },

        // EPIC ALT 1 (velocity lines)
        epic_alt_1(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-epic-alt-1';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const container = document.createElement('div');
            container.className = 'velocity-line-container';
            scope.appendChild(container);

            const lines = [];
            for (let i = 0; i < 20; i++) {
                const line = document.createElement('div');
                line.className = 'velocity-line';
                container.appendChild(line);
                lines.push(line);

                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(line, {
                        y: `random(0, ${window.innerHeight})`,
                        x: `random(-${window.innerWidth}, -100)`,
                        width: "random(100, 400)",
                        opacity: "random(0.3, 0.8)"
                    }, {
                        duration: 0.5 + Math.random(),
                        x: `+=${window.innerWidth * 2}`,
                        ease: "none",
                        repeat: -1,
                        delay: Math.random() * 1.5
                    });
                }
            }

            return () => { this._cleanupScope(glitchOverlay, scope, overlayClass); };
        },

        // LEGENDARY ALT 1 (конфетти)
        legendary_alt_1(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-legendary-alt-1';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const colors = ["#f06292", "#f8bbd0", "#ff4081", "#ffeb3b", "#4fc3f7"];
            for (let i = 0; i < 120; i++) {
                const p = document.createElement('div');
                p.className = 'confetti-particle';
                p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                scope.appendChild(p);

                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(p, {
                        x: `random(0, ${window.innerWidth})`,
                        y: -20, opacity: 1
                    }, {
                        duration: 3 + Math.random() * 4,
                        y: window.innerHeight + 20,
                        opacity: 0,
                        rotationX: "random(0, 360)",
                        rotationY: "random(0, 360)",
                        ease: "power1.in",
                        repeat: -1,
                        delay: Math.random() * 6
                    });
                }
            }

            return () => { this._cleanupScope(glitchOverlay, scope, overlayClass); };
        },

        // NEON
        neon(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-neon';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const container = document.createElement('div');
            container.className = 'neon-border-container';
            const sides = ['top', 'right', 'bottom', 'left'];
            sides.forEach(side => {
                const tube = document.createElement('div');
                tube.className = `neon-tube neon-tube-${side}`;
                container.appendChild(tube);
            });
            scope.appendChild(container);

            return () => { this._cleanupScope(glitchOverlay, scope, overlayClass); };
        },
       
        // ALT-ERROR (Corrupted Core) — максимальный глитч (без reduceMotion, без backdrop-filter)
        error_alt_1(targets) {
        const { glitchOverlay } = targets || {};
        if (!glitchOverlay) return null;

        const overlayClass = 'active-effect-error-alt';
        const scope = this._createScope(glitchOverlay, overlayClass);
        if (!scope) return null;

        // Фиксируем локальный контейнер
        Object.assign(scope.style, {
            position: 'absolute',
            inset: '0',
            pointerEvents: 'none'
        });

        const hasGSAP = typeof gsap !== 'undefined';
        const rand = (a,b)=>Math.random()*(b-a)+a;

        // Локальные стили (без backdrop/mix overlay-«ковров»)
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .g2-layer{position:absolute;inset:0;pointer-events:none}
            .g2-r,.g2-c{position:absolute;inset:0;mix-blend-mode:screen;opacity:.45}
            .g2-r{background:rgba(255,0,0,.18)}
            .g2-c{background:rgba(0,255,255,.16)}
            .g2-scan{background:repeating-linear-gradient(transparent 0 2px,rgba(0,0,0,.22) 2px 3px);opacity:.42}
            .g2-noise{background:repeating-conic-gradient(rgba(255,255,255,.035) 0% 10%, transparent 10% 20%);opacity:.12}
            .g2-slice{
            position:absolute;left:0;width:100%;height:8px;opacity:0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,.26), transparent);
            filter: saturate(1.25) contrast(1.05);
            }
            .g2-vbar{
            position:absolute;top:0;bottom:0;width:10px;opacity:0;
            background: linear-gradient(180deg, transparent, rgba(255,255,255,.18), transparent);
            filter: saturate(1.3) contrast(1.1);
            }
            .g2-block{
            position:absolute;width:18px;height:10px;opacity:.0; border-radius:2px;
            background: linear-gradient(90deg, rgba(255,64,64,.55), rgba(0,255,255,.45));
            box-shadow: 0 0 10px rgba(255,64,64,.6), 0 0 10px rgba(0,255,255,.5);
            }
            .g2-title{
            position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
            font-family:"Courier New",monospace;font-weight:700;letter-spacing:.26em;
            color:#ff6e40; text-shadow:0 0 8px #ff6e40, -1px 0 #00e5ff, 1px 0 #e91e63;
            opacity:.9;white-space:nowrap;user-select:none;pointer-events:none;
            }
            .g2-ghost{ position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); pointer-events:none; white-space:nowrap;
                        font-family:"Courier New",monospace; font-weight:700; letter-spacing:.26em; opacity:.55; }
            .g2-ghost.r{ color:#ff6e40; text-shadow: 0 0 10px #ff6e40; mix-blend-mode:screen; }
            .g2-ghost.c{ color:#00e5ff; text-shadow: 0 0 10px #00e5ff; mix-blend-mode:screen; }
        `;
        scope.appendChild(styleEl);

        // Базовые слои
        const scan  = document.createElement('div');  scan.className  = 'g2-layer g2-scan';  scope.appendChild(scan);
        const noise = document.createElement('div');  noise.className = 'g2-layer g2-noise'; scope.appendChild(noise);
        const red   = document.createElement('div');  red.className   = 'g2-layer g2-r';     scope.appendChild(red);
        const cyan  = document.createElement('div');  cyan.className  = 'g2-layer g2-c';     scope.appendChild(cyan);

        // Заголовок + фантомы
        const label = document.createElement('div');  label.className = 'g2-title'; label.textContent = 'CORRUPTED CORE'; scope.appendChild(label);
        const ghostR = document.createElement('div'); ghostR.className = 'g2-ghost r'; ghostR.textContent = 'CORRUPTED CORE'; scope.appendChild(ghostR);
        const ghostC = document.createElement('div'); ghostC.className = 'g2-ghost c'; ghostC.textContent = 'CORRUPTED CORE'; scope.appendChild(ghostC);

        // Коллекции для очистки
        const tweens = [];
        const timers = [];

        // Спавны
        const spawnSlice = () => {
            const h = 6 + Math.random()*18;
            const y = Math.random() * (scope.clientHeight - h);
            const s = document.createElement('div');
            s.className = 'g2-slice'; s.style.top = `${y}px`; s.style.height = `${h}px`;
            scope.appendChild(s);
            if (hasGSAP) {
            const dx = (Math.random()*2-1) * 180;
            const tl = gsap.timeline({ onComplete: () => s.remove() });
            tl.set(s, { opacity: .7, x: 0 })
                .to(s, { duration: 0.055, x: dx, ease: 'steps(4)' })
                .to(s, { duration: 0.085, x: 0,  opacity: 0, ease: 'steps(3)' });
            tweens.push(tl);
            } else {
            s.style.opacity = '.7'; s.style.transform = 'translateX(100px)';
            setTimeout(()=>s.remove(), 200);
            }
        };

        const spawnVBar = () => {
            const x = Math.random() * scope.clientWidth;
            const w = 6 + Math.random()*14;
            const b = document.createElement('div');
            b.className = 'g2-vbar'; b.style.left = `${x}px`; b.style.width = `${w}px`;
            scope.appendChild(b);
            if (hasGSAP) {
            const tl = gsap.timeline({ onComplete: () => b.remove() });
            tl.set(b, { opacity: .5 })
                .to(b, { duration: 0.16, opacity: 0, ease: 'power1.in' });
            tweens.push(tl);
            } else {
            b.style.opacity = '.5'; setTimeout(()=>b.remove(), 170);
            }
        };

        const spawnBlock = () => {
            const bw = 12 + Math.random()*28;
            const bh = 6  + Math.random()*16;
            const bx = Math.random() * (scope.clientWidth  - bw);
            const by = Math.random() * (scope.clientHeight - bh);
            const blk = document.createElement('div');
            blk.className = 'g2-block';
            Object.assign(blk.style, { left: `${bx}px`, top: `${by}px`, width: `${bw}px`, height: `${bh}px` });
            scope.appendChild(blk);
            if (hasGSAP) {
            const dx = (Math.random()*2-1) * 60;
            const dy = (Math.random()*2-1) * 30;
            const tl = gsap.timeline({ onComplete: () => blk.remove() });
            tl.set(blk, { opacity: .75, x: 0, y: 0, skewX: rand(-12,12) })
                .to(blk, { duration: 0.08, x: dx, y: dy, ease: 'steps(2)' })
                .to(blk, { duration: 0.10, x: 0,  y: 0,  opacity: 0, ease: 'steps(2)' });
            tweens.push(tl);
            } else {
            blk.style.opacity = '.7'; setTimeout(()=>blk.remove(), 180);
            }
        };

        if (hasGSAP) {
            // RGB‑сдвиг
            tweens.push(gsap.timeline({ repeat:-1, yoyo:true })
            .to(red,  { duration: .12, x:-3, y: 3, ease:'sine.inOut' })
            .to(red,  { duration: .12, x: 0, y: 0, ease:'sine.inOut' }));
            tweens.push(gsap.timeline({ repeat:-1, yoyo:true })
            .to(cyan, { duration: .12, x: 3, y:-3, ease:'sine.inOut' })
            .to(cyan, { duration: .12, x: 0, y: 0, ease:'sine.inOut' }));

            // Дрожание кадра
            tweens.push(gsap.timeline({ repeat:-1 })
            .to(scope, { duration: .06, x: 1.6, y:-1.2, rotation:-0.25, ease:'steps(1)' })
            .to(scope, { duration: .06, x:-1.2, y: 1.4, rotation: 0.25, ease:'steps(1)' })
            .to(scope, { duration: .06, x: 0,   y: 0,   rotation: 0,    ease:'steps(1)' }));

            // «Дыхание» сканлайнов и шум
            tweens.push(gsap.to(scan,  { duration: 1.0, opacity: .3, yoyo:true, repeat:-1, ease:'sine.inOut' }));
            tweens.push(gsap.to(noise, { duration: .9,  opacity: .18, yoyo:true, repeat:-1, ease:'sine.inOut' }));

            // Надпись и фантомы (мини‑джиттер)
            tweens.push(gsap.timeline({ repeat:-1, yoyo:true })
            .to(label, { duration:.1, skewX: rand(-4,4), skewY: rand(-2,2), ease:'steps(1)' })
            .to(label, { duration:.1, skewX: 0, skewY: 0, ease:'steps(1)' }));
            tweens.push(gsap.timeline({ repeat:-1, yoyo:true })
            .to(ghostR, { duration:.08, x:'+=2', y:'+=1', opacity:.6, ease:'steps(1)' })
            .to(ghostR, { duration:.08, x:'-=2', y:'-=1', opacity:.45, ease:'steps(1)' }));
            tweens.push(gsap.timeline({ repeat:-1, yoyo:true })
            .to(ghostC, { duration:.08, x:'-=2', y:'-=1', opacity:.6, ease:'steps(1)' })
            .to(ghostC, { duration:.08, x:'+=2', y:'+=1', opacity:.45, ease:'steps(1)' }));

            // Потоки всплесков
            timers.push(setInterval(() => { const n = Math.random() < 0.35 ? 3 : 1; for (let i=0;i<n;i++) spawnSlice(); }, 95));
            timers.push(setInterval(() => { if (Math.random() < 0.7) spawnVBar(); }, 220));
            timers.push(setInterval(() => { const n = 2 + Math.floor(Math.random()*4); for (let i=0;i<n;i++) spawnBlock(); }, 240));
        } else {
            // Fallback без GSAP — хотя бы срезы и надпись
            timers.push(setInterval(spawnSlice, 120));
        }

        // Очистка
        return () => {
            try { timers.forEach(id => clearInterval(id)); } catch(e){}
            try { tweens.forEach(t => { try { t.kill(); } catch(e){} }); } catch(e){}
            try { styleEl.remove(); } catch(e){}
            this._cleanupScope(glitchOverlay, scope, overlayClass);
        };
        },

        // 1) Silken — «лёгкие лепестки» и шёлковые ленты
        silken(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;
            const scope = this._createScope(glitchOverlay, 'active-effect-silken');
            if (!scope) return null;

            const hasGSAP = typeof gsap !== 'undefined';
            const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
            const PETALS = reduceMotion ? 10 : 18;

            const styleEl = document.createElement('style');
            styleEl.textContent = `
            .ve-silk-petal {
                position:absolute; width:14px; height:10px;
                background: radial-gradient(circle at 30% 30%, #f8bbd0 0%, #ec407a 75%, #e91e63 100%);
                border-radius: 55% 70% 60% 85% / 60% 70% 60% 70%;
                filter: drop-shadow(0 0 4px rgba(236, 64, 122, 0.5));
                opacity: .95; pointer-events:none; will-change: transform, opacity;
            }
            .ve-silk-ribbon {
                position:absolute; width:180px; height:8px;
                background: linear-gradient(90deg, rgba(244,143,177,.0), rgba(244,143,177,.55), rgba(244,143,177,0));
                filter: blur(0.5px); border-radius: 6px; opacity: .55; pointer-events:none;
                will-change: transform, opacity;
            }
            @media (prefers-reduced-motion: reduce) {
                .ve-silk-ribbon { opacity: .35; }
            }
            `;
            scope.appendChild(styleEl);

            const petals = [];
            const ribbons = [];
            const tweens = [];
            const timers = [];

            const vw = () => window.innerWidth;
            const vh = () => window.innerHeight;
            const rand = (a,b)=>Math.random()*(b-a)+a;

            function spawnPetal() {
                const p = document.createElement('div');
                p.className = 've-silk-petal';
                p.style.left = rand(-50, vw()+50) + 'px';
                p.style.top = '-20px';
                scope.appendChild(p);
                petals.push(p);

                const dur = rand(8, 14) * (reduceMotion ? 1.2 : 1);
                const x = parseFloat(p.style.left);
                const yEnd = vh() + 40;
                const xDrift = x + rand(-120, 120);

                if (hasGSAP) {
                    const t = gsap.to(p, {
                        duration: dur,
                        x: xDrift - x,
                        y: yEnd,
                        rotation: rand(-180, 180),
                        ease: 'sine.inOut',
                        onComplete: () => {
                            p.remove();
                            petals.splice(petals.indexOf(p), 1);
                            if (!reduceMotion) spawnPetal();
                        }
                    });
                    tweens.push(t);
                } else {
                    p.style.transition = `transform ${dur}s linear, opacity 1s linear`;
                    const timer = setTimeout(()=>{
                        p.style.transform = `translate(${(xDrift - x)}px, ${yEnd}px) rotate(${rand(-180,180)}deg)`;
                        setTimeout(()=>{ p.remove(); }, dur*1000 + 1000);
                    }, 30);
                    timers.push(timer);
                }
            }

            function spawnRibbon() {
                const r = document.createElement('div');
                r.className = 've-silk-ribbon';
                r.style.left = rand(-100, vw()-80) + 'px';
                r.style.top = rand(0, vh()*0.6) + 'px';
                r.style.transform = `rotate(${rand(-12,12)}deg)`;
                scope.appendChild(r);
                ribbons.push(r);

                if (hasGSAP && !reduceMotion) {
                    const t = gsap.to(r, {
                        duration: rand(6,10),
                        x: rand(-120, 120),
                        y: rand(30, 80),
                        opacity: rand(0.25, 0.55),
                        ease: 'sine.inOut', yoyo: true, repeat: -1
                    });
                    tweens.push(t);
                }
            }

            for (let i=0;i<PETALS;i++) spawnPetal();
            for (let i=0;i<(reduceMotion?1:3);i++) spawnRibbon();

            return () => {
                if (hasGSAP) tweens.forEach(t=>{ try{t.kill();}catch(e){} });
                timers.forEach(id=>clearTimeout(id));
                try{ styleEl.remove(); }catch(e){}
                this._cleanupScope(glitchOverlay, scope, 'active-effect-silken');
            };
        },

        // 2) Lava — «угольки» и тепловая рябь
        lava(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;
            const scope = this._createScope(glitchOverlay, 'active-effect-lava');
            if (!scope) return null;

            const hasGSAP = typeof gsap !== 'undefined';
            const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
            const EMBERS = reduceMotion ? 16 : 32;

            const styleEl = document.createElement('style');
            styleEl.textContent = `
            .ve-lava-heat {
                position:absolute; inset:0; pointer-events:none;
                background: linear-gradient(180deg, rgba(255,153,0,0.06), rgba(255,87,34,0.03));
                filter: contrast(1.06) saturate(1.06);
            }
            .ve-ember {
                position:absolute; width:3px; height:3px; border-radius:50%;
                background:#FF9800; box-shadow:0 0 8px #FF6D00, 0 0 12px rgba(255,87,34,.6);
                pointer-events:none; opacity:.9; will-change:transform,opacity;
            }
            @media (prefers-reduced-motion: reduce) { .ve-lava-heat{opacity:.4} }
            `;
            scope.appendChild(styleEl);

            const heat = document.createElement('div');
            heat.className = 've-lava-heat';
            scope.appendChild(heat);

            const tweens = [];
            const embers = [];

            if (hasGSAP && !reduceMotion) {
                const t = gsap.to(heat, { duration: 4, y: -10, yoyo:true, repeat:-1, ease:'sine.inOut' });
                tweens.push(t);
            }

            const vw = () => window.innerWidth;
            const vh = () => window.innerHeight;
            const rand = (a,b)=>Math.random()*(b-a)+a;

            function spawnEmber() {
                const e = document.createElement('div');
                e.className = 've-ember';
                e.style.left = rand(0, vw()) + 'px';
                e.style.top = (vh() + rand(0, 40)) + 'px';
                scope.appendChild(e);
                embers.push(e);

                const dur = rand(2.5, 4.5) * (reduceMotion ? 1.2 : 1);
                const xDrift = rand(-30, 30);
                const yUp = -vh() - 60;

                if (hasGSAP) {
                    const t = gsap.to(e, {
                        duration: dur,
                        x: `+=${xDrift}`, y: yUp,
                        opacity: rand(0.2, 0.6),
                        ease:'power2.out',
                        onComplete: () => {
                            e.remove();
                            embers.splice(embers.indexOf(e),1);
                            if (!reduceMotion) spawnEmber();
                        }
                    });
                    tweens.push(t);
                } else {
                    e.style.transition = `transform ${dur}s ease-out, opacity ${dur}s linear`;
                    const tm = setTimeout(()=>{
                        e.style.transform = `translate(${xDrift}px, ${yUp}px)`;
                        e.style.opacity = '0.3';
                        setTimeout(()=>{ e.remove(); }, dur*1000+100);
                    }, 20);
                    embers.push(e);
                }
            }

            for (let i=0;i<EMBERS;i++) spawnEmber();

            return () => {
                if (hasGSAP) tweens.forEach(t=>{ try{t.kill();}catch(e){} });
                embers.forEach(e=>{ try{e.remove();}catch(_){} });
                try{ styleEl.remove(); }catch(_){}
                this._cleanupScope(glitchOverlay, scope, 'active-effect-lava');
            };
        },

        // 3) Shroom — «споры» и редкие «пыхи»
        shroom(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;
            const scope = this._createScope(glitchOverlay, 'active-effect-shroom');
            if (!scope) return null;

            const hasGSAP = typeof gsap !== 'undefined';
            const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;

            const styleEl = document.createElement('style');
            styleEl.textContent = `
            .ve-spore {
                position:absolute; width:3px; height:3px; border-radius:50%;
                background: #FFE082; box-shadow: 0 0 6px #FFD54F;
                opacity:.9; pointer-events:none; will-change:transform,opacity;
            }
            `;
            scope.appendChild(styleEl);

            const spores = [];
            const tweens = [];
            const timers = [];

            const vw = () => window.innerWidth;
            const vh = () => window.innerHeight;
            const rand = (a,b)=>Math.random()*(b-a)+a;

            function spawnSpore() {
                const s = document.createElement('div');
                s.className = 've-spore';
                s.style.left = rand(0, vw()) + 'px';
                s.style.top  = (vh() + rand(0, 40)) + 'px';
                scope.appendChild(s);
                spores.push(s);

                const dur = rand(5, 9) * (reduceMotion ? 1.2 : 1);
                const xDrift = rand(-50,50);
                const yUp = -vh() - 30;

                if (hasGSAP) {
                    const t = gsap.to(s, {
                        duration: dur,
                        x: `+=${xDrift}`, y: yUp,
                        opacity: rand(0.25, 0.7),
                        ease: 'sine.inOut',
                        onComplete: () => { s.remove(); spores.splice(spores.indexOf(s),1); if (!reduceMotion) spawnSpore(); }
                    });
                    tweens.push(t);
                } else {
                    s.style.transition = `transform ${dur}s ease-in-out, opacity ${dur}s linear`;
                    const tm = setTimeout(()=>{
                        s.style.transform = `translate(${xDrift}px, ${yUp}px)`;
                        s.style.opacity = '0.3';
                        setTimeout(()=>{ s.remove(); }, dur*1000+100);
                    }, 20);
                    timers.push(tm);
                }
            }

            function puffCluster() {
                const cx = rand(50, vw()-50);
                const cy = rand(vh()*0.5, vh()-40);
                const count = reduceMotion ? 8 : 14;
                for (let i=0;i<count;i++) {
                    const s = document.createElement('div');
                    s.className = 've-spore';
                    s.style.left = cx + 'px';
                    s.style.top  = cy + 'px';
                    scope.appendChild(s);
                    spores.push(s);

                    if (hasGSAP) {
                        const t = gsap.to(s, {
                            duration: rand(1.2, 2.0),
                            x: rand(-60,60),
                            y: rand(-80,-10),
                            opacity: 0,
                            ease: 'power1.out',
                            onComplete: () => { s.remove(); spores.splice(spores.indexOf(s),1); }
                        });
                        tweens.push(t);
                    } else {
                        s.style.transition = `transform 1.5s ease-out, opacity 1.5s linear`;
                        const tm = setTimeout(()=>{
                            s.style.transform = `translate(${rand(-60,60)}px, ${rand(-80,-10)}px)`;
                            s.style.opacity = '0';
                            setTimeout(()=>{ s.remove(); }, 1600);
                        }, 20);
                        timers.push(tm);
                    }
                }
            }

            for (let i=0;i<(reduceMotion?12:22);i++) spawnSpore();
            const puffT = setInterval(puffCluster, reduceMotion ? 5000 : 3500);
            timers.push(puffT);

            return () => {
                timers.forEach(id=>clearInterval(id));
                if (hasGSAP) tweens.forEach(t=>{ try{t.kill();}catch(e){} });
                spores.forEach(s=>{ try{s.remove();}catch(_){ } });
                try{ styleEl.remove(); }catch(_){}
                this._cleanupScope(glitchOverlay, scope, 'active-effect-shroom');
            };
        },


        // 5) Doctor — «ЭКГ» линия и лёгкие сердечки
        doctor(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;
            const scope = this._createScope(glitchOverlay, 'active-effect-doctor');
            if (!scope) return null;

            const hasGSAP = typeof gsap !== 'undefined';
            const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;

            const svgNS = 'http://www.w3.org/2000/svg';
            const styleEl = document.createElement('style');
            styleEl.textContent = `
            .ve-ekg { position:absolute; left:0; right:0; bottom:10%; height:120px; pointer-events:none; }
            .ve-ekg path { stroke: #e91e63; stroke-width: 2; fill: none; filter: drop-shadow(0 0 4px rgba(233,30,99,0.8)); }
            .ve-heart { position:absolute; font-size: 16px; color: #ff1744; text-shadow: 0 0 6px rgba(255,23,68,0.8); pointer-events:none; opacity:0; }
            @media (prefers-reduced-motion: reduce){ .ve-ekg path { filter:none; } }
            `;
            scope.appendChild(styleEl);

            const svg = document.createElementNS(svgNS, 'svg');
            svg.classList.add('ve-ekg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '120');
            scope.appendChild(svg);

            const path = document.createElementNS(svgNS, 'path');
            svg.appendChild(path);

            function buildEKGPath(width) {
                const baseline = 70;
                let p = `M 0 ${baseline}`;
                const step = 80;
                for (let x=0; x<=width + step; x+=step) {
                    p += ` L ${x+25} ${baseline}`;
                    p += ` L ${x+35} ${baseline}`;
                    p += ` L ${x+40} ${baseline-30}`;
                    p += ` L ${x+45} ${baseline+30}`;
                    p += ` L ${x+50} ${baseline}`;
                    p += ` L ${x+80} ${baseline}`;
                }
                return p;
            }

            function layout() {
                const w = window.innerWidth;
                const d = buildEKGPath(w);
                path.setAttribute('d', d);
                const len = path.getTotalLength ? path.getTotalLength() : w*2;
                path.style.strokeDasharray = `${len}`;
                path.style.strokeDashoffset = `${len}`;
                return len;
            }

            const totalLen = layout();
            const onResize = () => layout();
            window.addEventListener('resize', onResize);

            const tweens = [];
            if (hasGSAP) {
                const speed = reduceMotion ? 6 : 4;
                const t = gsap.to(path, {
                    strokeDashoffset: 0,
                    duration: speed,
                    ease: 'none',
                    repeat: -1
                });
                tweens.push(t);
            } else {
                let offs = totalLen;
                let stopped = false;
                let ekgTimerId = 0;
                const tick = () => {
                    if (stopped) return;
                    offs -= 8;
                    if (offs <= 0) offs = totalLen;
                    path.style.strokeDashoffset = `${offs}`;
                    ekgTimerId = setTimeout(tick, reduceMotion ? 60 : 30);
                };
                ekgTimerId = setTimeout(tick, 60);
                tweens.push({ kill(){ stopped = true; clearTimeout(ekgTimerId); } });
            }

            const hearts = [];
            const timers = [];
            function spawnHeart() {
                const h = document.createElement('div');
                h.className = 've-heart';
                h.textContent = '❤';
                h.style.left = (window.innerWidth * 0.2 + Math.random()*window.innerWidth*0.6) + 'px';
                h.style.top  = (window.innerHeight * 0.25 + Math.random()*window.innerHeight*0.2) + 'px';
                scope.appendChild(h);
                hearts.push(h);

                if (hasGSAP && !reduceMotion) {
                    const t = gsap.timeline({
                        onComplete: ()=>{ h.remove(); hearts.splice(hearts.indexOf(h),1); }
                    });
                    t.to(h, { duration: 0.2, opacity: 1, scale: 1.0, ease:'sine.out' })
                    .to(h, { duration: 0.8, y: -20, opacity: 0, ease:'sine.in' });
                    tweens.push(t);
                } else {
                    h.style.transition = 'opacity .2s linear, transform 1s ease-in';
                    setTimeout(()=>{ h.style.opacity='1'; h.style.transform='translateY(-20px)'; }, 10);
                    const tm = setTimeout(()=>{ h.remove(); }, 1100);
                    timers.push(tm);
                }
            }
            const heartInterval = setInterval(spawnHeart, reduceMotion ? 1600 : 900);
            timers.push(heartInterval);

            return () => {
                window.removeEventListener('resize', onResize);
                timers.forEach(id => clearInterval(id));
                if (hasGSAP) tweens.forEach(t=>{ try{t.kill();}catch(e){} });
                hearts.forEach(h=>{ try{h.remove();}catch(_){ } });
                try{ styleEl.remove(); }catch(_){}
                this._cleanupScope(glitchOverlay, scope, 'active-effect-doctor');
            };
        },
        // BLEACHED — оранжевые «слэши» + пульсирующие кольца
        bleached(targets) {
        const { glitchOverlay } = targets || {};
        if (!glitchOverlay) return null;
        const overlayClass = 'active-effect-bleached';
        const scope = this._createScope(glitchOverlay, overlayClass);
        if (!scope) return null;

        // фиксируем контейнер
        Object.assign(scope.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });

        const hasGSAP = typeof gsap !== 'undefined';

        // локальный стиль
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .bl-slice{position:absolute;width:2px;height:160px;background:linear-gradient(180deg,#ff6a00,#ffe0b2);box-shadow:0 0 12px #ff6a00;opacity:.95;transform-origin:center}
            .bl-ring{position:absolute;border:2px solid rgba(255,106,0,.6);border-radius:50%;box-shadow:0 0 16px rgba(255,106,0,.6);opacity:.35}
        `;
        scope.appendChild(styleEl);

        const tweens = [];
        const timers = [];

        const spawnSlash = () => {
            const d = document.createElement('div');
            d.className = 'bl-slice';
            scope.appendChild(d);
            const x = Math.random()*scope.clientWidth, y = Math.random()*scope.clientHeight;
            d.style.left = `${x}px`; d.style.top = `${y}px`; d.style.transform = `rotate(${Math.random()*360}deg)`;
            if (hasGSAP) {
            const tl = gsap.timeline({ onComplete:() => d.remove() });
            tl.fromTo(d,{scaleY:.2,opacity:0},{duration:.22,scaleY:1.4,opacity:1,ease:'power2.out'})
                .to(d,{duration:.32,opacity:0,scaleY:.1,ease:'power2.in'});
            tweens.push(tl);
            } else {
            d.style.opacity = '1'; setTimeout(()=>{ d.style.opacity='0'; setTimeout(()=>d.remove(), 160); }, 120);
            }
        };

        const spawnRing = () => {
            const r = document.createElement('div');
            r.className = 'bl-ring';
            const size = 80 + Math.random()*160;
            r.style.width = `${size}px`; r.style.height = `${size}px`;
            r.style.left = `${Math.random()*(scope.clientWidth - size)}px`;
            r.style.top  = `${Math.random()*(scope.clientHeight - size)}px`;
            scope.appendChild(r);
            if (hasGSAP) {
            const tl = gsap.timeline({ onComplete:()=>r.remove() });
            tl.fromTo(r,{scale:.2,opacity:.15},{duration:.8,scale:1.35,opacity:.0,ease:'sine.out'});
            tweens.push(tl);
            } else {
            setTimeout(()=>r.remove(), 800);
            }
        };

        // потоки
        timers.push(setInterval(() => { for (let i=0;i<2;i++) spawnSlash(); }, 110));
        timers.push(setInterval(() => { spawnRing(); }, 300));

        // автоостанова для one‑shot использования (если включаешь кнопкой — эффект всё равно чисто снимается через cleanup)
        const killer = setTimeout(()=>{ timers.forEach(clearInterval); }, 2000);

        return () => {
            try { timers.forEach(clearInterval); clearTimeout(killer); } catch(e){}
            try { tweens.forEach(t => { try{t.kill();}catch(e){} }); } catch(e){}
            try { styleEl.remove(); } catch(e){}
            this._cleanupScope(glitchOverlay, scope, overlayClass);
        };
        },

        // AFRO — неоновый эквалайзер + фиолетовые искры
        afro(targets) {
        const { glitchOverlay } = targets || {};
        if (!glitchOverlay) return null;
        const overlayClass = 'active-effect-afro';
        const scope = this._createScope(glitchOverlay, overlayClass);
        if (!scope) return null;

        Object.assign(scope.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
        const hasGSAP = typeof gsap !== 'undefined';

        // контейнер барабанов
        const barWrap = document.createElement('div');
        Object.assign(barWrap.style, {
            position:'absolute', bottom:'10%', left:'10%', right:'10%', height:'22%',
            display:'flex', gap:'8px', alignItems:'flex-end', pointerEvents:'none'
        });
        scope.appendChild(barWrap);

        const bars = [];
        for (let i=0;i<24;i++){
            const b = document.createElement('div');
            Object.assign(b.style,{
            flex:'1 1 auto', height:'10%',
            background:'linear-gradient(180deg,#e1bee7,#7b1fa2)',
            boxShadow:'0 0 12px #7b1fa2', borderRadius:'4px', opacity:.95
            });
            barWrap.appendChild(b); bars.push(b);
            if (hasGSAP) {
            const t = gsap.to(b,{
                height:`${30+Math.random()*70}%`, duration:0.4+Math.random()*0.6,
                yoyo:true, repeat:-1, ease:'sine.inOut', delay:Math.random()*0.4
            });
            // запомним для cleanup
            b._tw = t;
            }
        }

        // искры
        const sparks = [];
        const spawnSpark = () => {
            const s = document.createElement('div');
            Object.assign(s.style,{
            position:'absolute', width:'6px', height:'6px', borderRadius:'50%',
            background:'#b388ff', boxShadow:'0 0 8px #b388ff',
            left:`${10+Math.random()*80}%`, top:`${15+Math.random()*60}%`, opacity:.9
            });
            scope.appendChild(s); sparks.push(s);
            if (hasGSAP) {
            gsap.to(s,{ y:-40-Math.random()*40, opacity:0, duration:0.8, ease:'power1.out', onComplete:()=>s.remove() });
            } else { setTimeout(()=>s.remove(),800); }
        };
        const sparkTimer = setInterval(spawnSpark, 90);
        const killer = setTimeout(()=>clearInterval(sparkTimer), 2000);

        return () => {
            try { clearInterval(sparkTimer); clearTimeout(killer); } catch(e){}
            if (hasGSAP) bars.forEach(b=>{ try{ b._tw && b._tw.kill(); }catch(e){} });
            sparks.forEach(s=>{ try{s.remove();}catch(e){} });
            barWrap.remove?.();
            this._cleanupScope(glitchOverlay, scope, overlayClass);
        };
        },
            
    }
};