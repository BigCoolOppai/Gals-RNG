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

            // Отключаем старый фоновый паттерн из CSS (вернём назад в cleanup)
            const prevBg = glitchOverlay.style.background;
            const prevBgImg = glitchOverlay.style.backgroundImage;
            const prevAnim = glitchOverlay.style.animation;
            glitchOverlay.style.background = 'transparent';
            glitchOverlay.style.backgroundImage = 'none';
            glitchOverlay.style.animation = 'none';

            const hasGSAP = typeof gsap !== 'undefined';
            const hasMP = hasGSAP && typeof window.MotionPathPlugin !== 'undefined';
            if (hasGSAP && hasMP && gsap.registerPlugin) {
                gsap.registerPlugin(window.MotionPathPlugin);
            }
            const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;

            // ---------- Реальные "соты" (SVG) ----------
            const svgNS = 'http://www.w3.org/2000/svg';
            const honeySvg = document.createElementNS(svgNS, 'svg');
            Object.assign(honeySvg, { id: 'beeHoneycombSvg' });
            Object.assign(honeySvg.style, {
                position: 'absolute',
                inset: '0',
                pointerEvents: 'none',
                opacity: '0.35'
            });
            honeySvg.setAttribute('width', '100%');
            honeySvg.setAttribute('height', '100%');
            scope.appendChild(honeySvg);

            const honeyGroup = document.createElementNS(svgNS, 'g');
            honeySvg.appendChild(honeyGroup);

            function buildHoneycomb() {
                while (honeyGroup.firstChild) honeyGroup.firstChild.remove();

                const W = window.innerWidth;
                const H = window.innerHeight;

                // Плоско-верхние шестиугольники (flat-top)
                const r = reduceMotion ? 10 : 14;                   // "радиус" (от центра до угла по X)
                const w = 2 * r;                                    // ширина
                const h = Math.sqrt(3) * r;                         // высота
                const xStep = 0.75 * w;                             // шаг по X между центрами
                const yStep = h;                                    // шаг по Y между центрами
                const cols = Math.ceil(W / xStep) + 2;
                const rows = Math.ceil(H / yStep) + 2;

                function hexPoints(cx, cy, r) {
                    const halfH = (Math.sqrt(3) * r) / 2;
                    return [
                        [cx - r,     cy],
                        [cx - r/2,   cy - halfH],
                        [cx + r/2,   cy - halfH],
                        [cx + r,     cy],
                        [cx + r/2,   cy + halfH],
                        [cx - r/2,   cy + halfH]
                    ];
                }

                for (let c = 0; c < cols; c++) {
                    for (let rIdx = 0; rIdx < rows; rIdx++) {
                        const cx = c * xStep + r;                                  // небольшой отступ от левого края
                        const cy = rIdx * yStep + (c % 2 ? yStep / 2 : 0);         // смещение каждой второй колонки

                        const poly = document.createElementNS(svgNS, 'polygon');
                        poly.setAttribute(
                            'points',
                            hexPoints(cx, cy, r)
                                .map(p => p.join(','))
                                .join(' ')
                        );
                        poly.setAttribute('fill', 'rgba(255,193,7,0.06)');         // мягкая заливка соты
                        poly.setAttribute('stroke', 'rgba(255,193,7,0.20)');       // контур
                        poly.setAttribute('stroke-width', '1');
                        honeyGroup.appendChild(poly);
                    }
                }
            }

            buildHoneycomb();

            // Лёгкое "дыхание" фона
            let honeyTween = null;
            if (hasGSAP && !reduceMotion) {
                honeyTween = gsap.to(honeyGroup, {
                    x: '-=20',
                    y: '+=12',
                    yoyo: true,
                    repeat: -1,
                    duration: 8,
                    ease: 'sine.inOut'
                });
            }

            // При ресайзе пересобираем сетку
            const onResize = () => {
                buildHoneycomb();
            };
            window.addEventListener('resize', onResize);

            // ---------- Пчёлы (SVG) ----------
            const BEE_COUNT = reduceMotion ? 6 : 14;
            const bees = [];

            const vw = () => window.innerWidth;
            const vh = () => window.innerHeight;
            const margin = 40;
            const rand = (min, max) => Math.random() * (max - min) + min;

            function createBeeSVG(scale = 1) {
                // Контейнер, который будем двигать по кривой
                const wrap = document.createElement('div');
                Object.assign(wrap.style, {
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: `${28 * scale}px`,
                    height: `${22 * scale}px`,
                    transform: `translate(${rand(margin, vw() - margin)}px, ${rand(margin, vh() - margin)}px)`,
                    willChange: 'transform'
                });

                const svg = document.createElementNS(svgNS, 'svg');
                svg.setAttribute('width', 28 * scale);
                svg.setAttribute('height', 22 * scale);
                svg.setAttribute('viewBox', '0 0 28 22');
                svg.style.overflow = 'visible';

                // Группа всей пчелы
                const g = document.createElementNS(svgNS, 'g');
                svg.appendChild(g);

                // Тело (эллипс)
                const body = document.createElementNS(svgNS, 'ellipse');
                body.setAttribute('cx', '14');
                body.setAttribute('cy', '11');
                body.setAttribute('rx', '9');
                body.setAttribute('ry', '6');
                body.setAttribute('fill', '#FFC107');
                g.appendChild(body);

                // Полоски (3 тёмные полоски)
                const stripes = [8, 12, 16].map((x) => {
                    const r = document.createElementNS(svgNS, 'rect');
                    r.setAttribute('x', String(x));
                    r.setAttribute('y', '5.2');
                    r.setAttribute('width', '2.5');
                    r.setAttribute('height', '11.6');
                    r.setAttribute('fill', '#4E342E');
                    r.setAttribute('opacity', '0.9');
                    g.appendChild(r);
                    return r;
                });

                // Голова
                const head = document.createElementNS(svgNS, 'circle');
                head.setAttribute('cx', '7');
                head.setAttribute('cy', '11');
                head.setAttribute('r',  '4');
                head.setAttribute('fill', '#3D2B1F');
                g.appendChild(head);

                // Жало
                const sting = document.createElementNS(svgNS, 'polygon');
                sting.setAttribute('points', '22,11 26,10 22,12');
                sting.setAttribute('fill', '#3D2B1F');
                g.appendChild(sting);

                // Крылышки (две группы для удобного вращения)
                const leftWingG  = document.createElementNS(svgNS, 'g');
                const rightWingG = document.createElementNS(svgNS, 'g');
                g.appendChild(leftWingG);
                g.appendChild(rightWingG);

                const leftWing = document.createElementNS(svgNS, 'path');
                leftWing.setAttribute('d', 'M12 8 C 9 5, 7 6, 7.2 8.8 C 7.4 11.2, 9.8 10.6, 12 9 Z');
                leftWing.setAttribute('fill', 'rgba(255,255,255,0.9)');
                leftWing.setAttribute('stroke', 'rgba(255,255,255,0.6)');
                leftWing.setAttribute('stroke-width', '0.5');
                leftWingG.appendChild(leftWing);

                const rightWing = document.createElementNS(svgNS, 'path');
                rightWing.setAttribute('d', 'M16 8 C 19 5, 21 6, 20.8 8.8 C 20.6 11.2, 18.2 10.6, 16 9 Z');
                rightWing.setAttribute('fill', 'rgba(255,255,255,0.9)');
                rightWing.setAttribute('stroke', 'rgba(255,255,255,0.6)');
                rightWing.setAttribute('stroke-width', '0.5');
                rightWingG.appendChild(rightWing);

                // Точки поворота крыльев
                leftWingG.style.transformOrigin  = `${12 * scale}px ${8 * scale}px`;
                rightWingG.style.transformOrigin = `${16 * scale}px ${8 * scale}px`;

                wrap.appendChild(svg);
                scope.appendChild(wrap);

                // Взмах крыльев
                if (hasGSAP && !reduceMotion) {
                    gsap.to(leftWingG,  { rotate: 15, duration: 0.08, yoyo: true, repeat: -1, ease: 'sine.inOut' });
                    gsap.to(rightWingG, { rotate:-15, duration: 0.08, yoyo: true, repeat: -1, ease: 'sine.inOut' });
                }

                return wrap;
            }

            function randomPathFrom(x0, y0) {
                const end = { x: rand(margin, vw() - margin), y: rand(margin, vh() - margin) };
                const c1  = { x: rand(margin, vw() - margin), y: rand(margin, vh() - margin) };
                const c2  = { x: rand(margin, vw() - margin), y: rand(margin, vh() - margin) };
                return [{ x: x0, y: y0 }, c1, c2, end];
            }

            function trail(beeWrap) {
                if (!hasGSAP || reduceMotion || Math.random() > 0.04) return;
                const dot = document.createElement('div');
                Object.assign(dot.style, {
                    position: 'absolute',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#FFC107',
                    boxShadow: '0 0 6px #FFC107',
                    left: '0px',
                    top: '0px',
                    pointerEvents: 'none',
                    opacity: '0.9'
                });
                scope.appendChild(dot);
                const x = gsap.getProperty(beeWrap, 'x') || 0;
                const y = gsap.getProperty(beeWrap, 'y') || 0;
                gsap.set(dot, { x, y });
                gsap.to(dot, { duration: 0.6, opacity: 0, y: '-=10', ease: 'sine.out', onComplete() { dot.remove(); } });
            }

            function fly(beeWrap) {
                if (!(hasGSAP && hasMP)) {
                    // Fallback без MotionPath: плавные линейные перелёты
                    const dur = rand(800, 1600);
                    const x = rand(margin, vw() - margin);
                    const y = rand(margin, vh() - margin);
                    beeWrap.style.transition = `transform ${dur}ms ease-in-out`;
                    beeWrap.style.transform  = `translate(${x}px, ${y}px)`;
                    const t = setTimeout(() => fly(beeWrap), dur + rand(200, 500));
                    beeWrap._fallbackTimer = t;
                    return;
                }

                const x0 = gsap.getProperty(beeWrap, 'x') || rand(margin, vw() - margin);
                const y0 = gsap.getProperty(beeWrap, 'y') || rand(margin, vh() - margin);
                const path = randomPathFrom(x0, y0);
                const dur = rand(6, 12) * (reduceMotion ? 1.2 : 1);

                const tween = gsap.to(beeWrap, {
                    duration: dur,
                    ease: 'sine.inOut',
                    motionPath: { path, curviness: 1.5, autoRotate: true },
                    onUpdate: () => trail(beeWrap),
                    onComplete: () => fly(beeWrap)
                });
                beeWrap._tween = tween;
            }

            for (let i = 0; i < BEE_COUNT; i++) {
                const scale = rand(0.9, 1.2);
                const bee = createBeeSVG(scale);
                bees.push(bee);
                fly(bee);
            }

            // ---------- Очистка ----------
            return () => {
                if (hasGSAP) {
                    try { honeyTween && honeyTween.kill(); } catch (e) {}
                    bees.forEach(b => { try { b._tween && b._tween.kill(); } catch(e){} });
                } else {
                    bees.forEach(b => { if (b._fallbackTimer) clearTimeout(b._fallbackTimer); });
                }
                window.removeEventListener('resize', onResize);

                // Вернём фоновые стили overlay назад
                glitchOverlay.style.background = prevBg;
                glitchOverlay.style.backgroundImage = prevBgImg;
                glitchOverlay.style.animation = prevAnim;

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
        // ЖЁСТКИЙ ГЛИТЧ ДЛЯ ALT-ERROR (Corrupted Core)
        error_alt_1(targets) {
            const { glitchOverlay } = targets || {};
            if (!glitchOverlay) return null;

            const overlayClass = 'active-effect-error-alt';
            const scope = this._createScope(glitchOverlay, overlayClass);
            if (!scope) return null;

            const hasGSAP = typeof gsap !== 'undefined';
            const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
            const supportsBackdrop =
                typeof CSS !== 'undefined' &&
                (CSS.supports('backdrop-filter', 'contrast(1.2)') || CSS.supports('-webkit-backdrop-filter', 'contrast(1.2)'));

            // Локальные стили (без внешнего CSS)
            const styleEl = document.createElement('style');
            styleEl.textContent = `
            .ve-ea-layer{position:absolute;inset:0;pointer-events:none}
            .ve-ea-scan{background:repeating-linear-gradient(transparent 0 2px,rgba(0,0,0,.18) 2px 3px);opacity:.55;mix-blend-mode:multiply}
            .ve-ea-rgb{mix-blend-mode:screen;opacity:.45}
            .ve-ea-rgb.red{background:rgba(255,0,0,.18)}
            .ve-ea-rgb.cyan{background:rgba(0,255,255,.16)}
            .ve-ea-vignette{box-shadow:inset 0 0 120px rgba(0,0,0,.4)}
            .ve-ea-text{
                position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                font-family: "Courier New", monospace;font-weight:700;letter-spacing:.25em;
                color:#ff3d00;text-shadow:0 0 6px #ff6e40,-1px 0 #00e5ff,1px 0 #e91e63;
                opacity:.85;white-space:nowrap;user-select:none;pointer-events:none
            }
            .ve-ea-slice{
                position:absolute;left:0;width:100%;
                background:rgba(255,255,255,0.001); /* триггер для backdrop-filter */
                mix-blend-mode:normal;
            }
            .ve-ea-block{
                position:absolute;
                background:rgba(255,255,255,.06);
                mix-blend-mode:overlay;
                opacity:.0
            }
            @media (prefers-reduced-motion: reduce){
                .ve-ea-scan{opacity:.35}
            }
            `;
            scope.appendChild(styleEl);

            // Базовые слои
            const scan = document.createElement('div');  scan.className = 've-ea-layer ve-ea-scan'; scope.appendChild(scan);
            const rgbR = document.createElement('div');  rgbR.className = 've-ea-layer ve-ea-rgb red';  scope.appendChild(rgbR);
            const rgbC = document.createElement('div');  rgbC.className = 've-ea-layer ve-ea-rgb cyan'; scope.appendChild(rgbC);
            const vign = document.createElement('div');  vign.className = 've-ea-layer ve-ea-vignette'; scope.appendChild(vign);
            const label = document.createElement('div'); label.className = 've-ea-text'; label.textContent = 'CORRUPTED CORE'; scope.appendChild(label);

            const timers = [];
            const tweens = [];
            const liveNodes = new Set();

            // Микро‑дрожь всего кадра
            if (hasGSAP && !reduceMotion) {
                const shake = gsap.timeline({ repeat: -1 });
                shake.to(scope, { duration: 0.06, x:  1.5, y: -1.0, rotation: -0.2, ease: 'steps(1)' })
                    .to(scope, { duration: 0.06, x: -1.0, y:  1.2, rotation:  0.2, ease: 'steps(1)' })
                    .to(scope, { duration: 0.06, x:  0,    y:  0,   rotation:  0,   ease: 'steps(1)' });
                tweens.push(shake);
            }

            // Постоянный RGB split
            if (hasGSAP) {
                const d = reduceMotion ? 0.18 : 0.12;
                const off = reduceMotion ? 1.0 : 2.6;
                const tl = gsap.timeline({ repeat: -1, yoyo: true });
                tl.to(rgbR, { duration: d, x: -off, y:  off, ease: 'sine.inOut' }, 0)
                .to(rgbC, { duration: d, x:  off, y: -off, ease: 'sine.inOut' }, 0);
                tweens.push(tl);
            }

            // Лёгкая пульсация сканлайнов/текста
            if (hasGSAP && !reduceMotion) {
                tweens.push(gsap.to(scan,  { duration: 1.2, opacity: 0.35, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
                tweens.push(gsap.to(label, { duration: 0.8, opacity: 0.65, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
            }

            // Создание "среза" (горизонтальной полосы) с искажением фона
            function spawnSlice(burst = false) {
                const slice = document.createElement('div');
                slice.className = 've-ea-slice';
                const h = burst ? (Math.random() * 60 + 18) : (Math.random() * 28 + 10);
                const top = Math.random() * (window.innerHeight - h);
                slice.style.top = `${top}px`;
                slice.style.height = `${h}px`;

                // Настоящее искажение фона — backdrop-filter
                if (supportsBackdrop) {
                    const baseBF = 'contrast(1.35) saturate(1.5) hue-rotate(-12deg) brightness(1.08)';
                    const burstBF = 'invert(1) contrast(1.6) saturate(1.6) hue-rotate(180deg)';
                    slice.style.backdropFilter = burst ? burstBF : baseBF;
                    slice.style.webkitBackdropFilter = burst ? burstBF : baseBF;
                } else {
                    // Fallback без backdrop-filter
                    slice.style.background = 'linear-gradient(90deg, rgba(255,255,255,.05), rgba(255,255,255,.01))';
                    slice.style.mixBlendMode = 'overlay';
                }

                scope.appendChild(slice);
                liveNodes.add(slice);

                if (hasGSAP) {
                    const dx1 = (Math.random() * 2 - 1) * (burst ? 180 : 90);
                    const dx2 = (Math.random() * 2 - 1) * (burst ? 220 : 110);
                    const t = gsap.timeline({
                        onComplete: () => { liveNodes.delete(slice); slice.remove(); }
                    });
                    const step = 'steps(6)';
                    t.to(slice, { duration: 0.08, x: dx1, ease: step })
                    .to(slice, { duration: 0.06, x: -dx2, ease: step })
                    .to(slice, { duration: 0.05, x: 0,    ease: step });
                    tweens.push(t);
                } else {
                    slice.style.transition = 'transform 80ms steps(6, end)';
                    slice.style.transform  = `translateX(${(Math.random()*120-60)|0}px)`;
                    const h1 = setTimeout(() => { slice.style.transform = `translateX(${(Math.random()*140-70)|0}px)`; }, 90);
                    const h2 = setTimeout(() => { slice.style.transform = `translateX(0px)`; }, 160);
                    const h3 = setTimeout(() => { liveNodes.delete(slice); slice.remove(); }, 230);
                    timers.push(h1,h2,h3);
                }
            }

            // Мелкие блок‑глитчи (дешёвые пиксельные “квадраты”)
            function spawnBlock() {
                const b = document.createElement('div');
                b.className = 've-ea-block';
                const w = Math.random() * 120 + 40;
                const h = Math.random() * 40 + 14;
                const x = Math.random() * (window.innerWidth  - w);
                const y = Math.random() * (window.innerHeight - h);
                Object.assign(b.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
                scope.appendChild(b);
                liveNodes.add(b);

                if (hasGSAP && !reduceMotion) {
                    const t = gsap.timeline({
                        onComplete: () => { liveNodes.delete(b); b.remove(); }
                    });
                    t.to(b, { duration: 0.06, opacity: 0.6, ease: 'steps(3)' })
                    .to(b, { duration: 0.08, opacity: 0.0, ease: 'steps(3)' });
                    tweens.push(t);
                } else {
                    b.style.opacity = '0.5';
                    const h1 = setTimeout(() => { b.style.opacity = '0'; }, 90);
                    const h2 = setTimeout(() => { liveNodes.delete(b); b.remove(); }, 180);
                    timers.push(h1,h2);
                }
            }

            // Постоянный поток мелких срезов
            const baseInterval = reduceMotion ? 200 : 120;
            const sliceT = setInterval(() => {
                const count = 1 + (reduceMotion ? 0 : Math.floor(Math.random() * 2)); // 1–2
                for (let i = 0; i < count; i++) spawnSlice(false);
                if (Math.random() < 0.25 && !reduceMotion) spawnBlock();
            }, baseInterval);
            timers.push(sliceT);

            // Периодические «взрывы» глитча
            function burst() {
                const c = reduceMotion ? 6 : 12;
                for (let i = 0; i < c; i++) spawnSlice(true);

                if (hasGSAP) {
                    const amp = gsap.timeline();
                    amp.to([rgbR, rgbC], { duration: 0.08, x: (i,el)=> el===rgbR ? -12 : 12, y: (i,el)=> el===rgbR ? 12 : -12, ease:'steps(5)' })
                    .to([rgbR, rgbC], { duration: 0.12, x: 0, y: 0, ease:'steps(5)' });
                    tweens.push(amp);

                    const txt = gsap.timeline();
                    txt.to(label, { duration: 0.06, x: -6, skewX: -8, ease:'steps(2)' })
                    .to(label, { duration: 0.06, x:  6, skewX:  8, ease:'steps(2)' })
                    .to(label, { duration: 0.06, x:  0, skewX:  0, ease:'steps(2)' });
                    tweens.push(txt);

                    const frame = gsap.timeline();
                    frame.to(scope, { duration: 0.04, x: 3, y: -2, rotation: 0.5, ease:'steps(1)' })
                        .to(scope, { duration: 0.04, x:-3, y:  2, rotation:-0.5, ease:'steps(1)' })
                        .to(scope, { duration: 0.04, x: 0, y:  0, rotation: 0,   ease:'steps(1)' });
                    tweens.push(frame);
                }
            }
            const burstT = setInterval(burst, reduceMotion ? 3000 : 2000);
            timers.push(burstT);

            // Очистка
            return () => {
                timers.forEach(id => {
                    try {
                        if (typeof id === 'number') clearInterval(id);
                        else clearTimeout(id);
                    } catch(e){}
                });
                if (hasGSAP) {
                    tweens.forEach(t => { try { t.kill(); } catch(e){} });
                }
                liveNodes.forEach(n => { try { n.remove(); } catch(e){} });
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
            
    }
};