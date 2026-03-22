document.addEventListener('DOMContentLoaded', function () {

    /*
     * 首页图片轮播
     */
    {
        const slider = document.getElementById('home-slider');
        const track = document.getElementById('home-imgbar');
        const prevBtn = document.getElementById('home-prev');
        const nextBtn = document.getElementById('home-next');

        if (slider && track) {
            const cards = Array.from(track.querySelectorAll('.home-img-card'));
            const imgs = Array.from(track.querySelectorAll('.home-img'));
            const total = cards.length;

            if (total > 0) {
                let currentIndex = 0;
                let autoTimer = null;
                let scrollTimer = null;
                const interval = 4000;

                function setCardBackgrounds() {
                    cards.forEach((card) => {
                        const img = card.querySelector('.home-img');
                        if (!img) return;

                        const src = img.currentSrc || img.src;
                        if (!src) return;

                        card.style.setProperty('--bg-url', `url("${src}")`);
                    });
                }

                function goToSlide(index, smooth = true) {
                    if (index < 0) index = total - 1;
                    if (index >= total) index = 0;

                    currentIndex = index;

                    const left = currentIndex * track.clientWidth;
                    track.scrollTo({
                        left,
                        behavior: smooth ? 'smooth' : 'auto'
                    });
                }

                function nextSlide() {
                    goToSlide(currentIndex + 1);
                }

                function prevSlide() {
                    goToSlide(currentIndex - 1);
                }

                function syncIndexFromScroll() {
                    const width = track.clientWidth;
                    if (!width) return;
                    currentIndex = Math.round(track.scrollLeft / width);
                }

                function startAutoPlay() {
                    stopAutoPlay();
                    autoTimer = setInterval(() => {
                        nextSlide();
                    }, interval);
                }

                function stopAutoPlay() {
                    if (autoTimer) {
                        clearInterval(autoTimer);
                        autoTimer = null;
                    }
                }

                function restartAutoPlay() {
                    stopAutoPlay();
                    startAutoPlay();
                }

                if (prevBtn) {
                    prevBtn.addEventListener('click', function () {
                        prevSlide();
                        restartAutoPlay();
                    });
                }

                if (nextBtn) {
                    nextBtn.addEventListener('click', function () {
                        nextSlide();
                        restartAutoPlay();
                    });
                }

                track.addEventListener('scroll', function () {
                    if (scrollTimer) clearTimeout(scrollTimer);
                    scrollTimer = setTimeout(() => {
                        syncIndexFromScroll();
                    }, 120);
                });

                slider.addEventListener('mouseenter', stopAutoPlay);
                slider.addEventListener('mouseleave', startAutoPlay);

                track.addEventListener('pointerdown', stopAutoPlay);
                track.addEventListener('pointerup', restartAutoPlay);
                track.addEventListener('pointercancel', restartAutoPlay);
                track.addEventListener('touchstart', stopAutoPlay, { passive: true });
                track.addEventListener('touchend', restartAutoPlay, { passive: true });

                imgs.forEach((img) => {
                    if (img.complete) {
                        const card = img.closest('.home-img-card');
                        if (card) {
                            const src = img.currentSrc || img.src;
                            if (src) card.style.setProperty('--bg-url', `url("${src}")`);
                        }
                    } else {
                        img.addEventListener('load', function () {
                            const card = img.closest('.home-img-card');
                            const src = img.currentSrc || img.src;
                            if (card && src) {
                                card.style.setProperty('--bg-url', `url("${src}")`);
                            }
                        });
                    }
                });

                window.addEventListener('resize', function () {
                    goToSlide(currentIndex, false);
                });

                setCardBackgrounds();
                goToSlide(0, false);
                startAutoPlay();
            }
        }
    }

/*
 * Research 卡片轮播
 */
{
    const researchSlider = document.querySelector('.research-slider');
    const dotsWrap = document.querySelector('.research-dots');
    const prevBtn = document.getElementById('research-prev');
    const nextBtn = document.getElementById('research-next');

    if (researchSlider && dotsWrap) {
        const researchCards = Array.from(researchSlider.querySelectorAll('li'));
        const total = researchCards.length;

        if (total > 0) {
            dotsWrap.innerHTML = '';

            researchCards.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = 'research-dot';
                dot.dataset.index = index;
                dotsWrap.appendChild(dot);
            });

            const dots = Array.from(dotsWrap.querySelectorAll('.research-dot'));
            let activeIndex = 0;
            let ticking = false;

            function normalizeIndex(index) {
                return (index + total) % total;
            }

            function setActive(index) {
                activeIndex = normalizeIndex(index);

                researchCards.forEach((card, i) => {
                    card.classList.toggle('is-active', i === activeIndex);
                });

                dots.forEach((dot, i) => {
                    dot.classList.toggle('is-active', i === activeIndex);
                });
            }

            /* 手动计算目标 scrollLeft，保证首尾都能真正居中 */
            function getCenteredScrollLeft(index) {
                const targetIndex = normalizeIndex(index);
                const card = researchCards[targetIndex];
                if (!card) return 0;

                const targetLeft =
                    card.offsetLeft - (researchSlider.clientWidth - card.offsetWidth) / 2;

                const maxScrollLeft =
                    researchSlider.scrollWidth - researchSlider.clientWidth;

                return Math.max(0, Math.min(targetLeft, maxScrollLeft));
            }

            function centerCard(index, smooth = true) {
                const targetIndex = normalizeIndex(index);
                const targetLeft = getCenteredScrollLeft(targetIndex);

                setActive(targetIndex);

                researchSlider.scrollTo({
                    left: targetLeft,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            }

            /* 根据当前 scrollLeft 反推谁在中间 */
            function getCenteredCardIndex() {
                const viewportCenter =
                    researchSlider.scrollLeft + researchSlider.clientWidth / 2;

                let bestIndex = 0;
                let minDistance = Infinity;

                researchCards.forEach((card, index) => {
                    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                    const distance = Math.abs(viewportCenter - cardCenter);

                    if (distance < minDistance) {
                        minDistance = distance;
                        bestIndex = index;
                    }
                });

                return bestIndex;
            }

            function syncFromScroll() {
                setActive(getCenteredCardIndex());
            }

            researchSlider.addEventListener('scroll', function () {
                if (!ticking) {
                    window.requestAnimationFrame(function () {
                        syncFromScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            /* 左边按钮：第一个 -> 最后一个 */
            if (prevBtn) {
                prevBtn.addEventListener('click', function () {
                    centerCard(activeIndex - 1, true);
                });
            }

            /* 右边按钮：最后一个 -> 第一个 */
            if (nextBtn) {
                nextBtn.addEventListener('click', function () {
                    centerCard(activeIndex + 1, true);
                });
            }

            dots.forEach((dot) => {
                dot.addEventListener('click', function () {
                    const index = Number(this.dataset.index);
                    centerCard(index, true);
                });
            });

            window.addEventListener('resize', function () {
                centerCard(activeIndex, false);
            });

            centerCard(0, false);
        }
    }
}

});
