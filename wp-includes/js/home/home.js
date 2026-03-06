
document.addEventListener('DOMContentLoaded', function () {
    
    // 获取所有一级菜单的 <a> 元素（根据需要调整选择器）
    const menuLinks = document.querySelectorAll('#primary-menu > li.menu-item > a');
    
    menuLinks.forEach(link => {
      // 临时强制加粗以测量宽度
      const originalWeight = link.style.fontWeight;
      link.style.fontWeight = '700';
      
      // 获取加粗后的实际宽度（包括内边距）
      const boldWidth = link.offsetWidth;
      
      // 恢复原字体粗细
      link.style.fontWeight = originalWeight;
      
      // 设置固定宽度（加粗后的宽度）
      link.style.width = boldWidth + 'px';
      // 确保元素表现为块级或行内块级，使宽度生效
      link.style.display = 'inline-block';  // 或 'block'
      // 可选：文本居中
      link.style.textAlign = 'center';
      // 保持内边距，但注意宽度已包含内边距，需要调整盒模型
      link.style.boxSizing = 'content-box'; // 确保设置的width不包括padding和border
      // 或者直接保留原内边距，但需重新计算宽度包含内边距
      // 由于我们使用了offsetWidth（包含padding和border），若不想改变盒模型，可以：
      // link.style.width = (boldWidth - parseFloat(getComputedStyle(link).paddingLeft) - parseFloat(getComputedStyle(link).paddingRight)) + 'px';
      // 为简化，建议统一使用 content-box 并重新设定内边距
    });
    
    // 为防止菜单项换行，设置white-space: nowrap
    document.querySelectorAll('#primary-menu > li.menu-item').forEach(li => {
      li.style.whiteSpace = 'nowrap';
    });

    // 
    // 滚动图片
    // 
    const slider = document.getElementById('home-slider');
    const track = document.getElementById('home-imgbar');
    const prevBtn = document.getElementById('home-prev');
    const nextBtn = document.getElementById('home-next');

    if (!slider || !track) return;

    const cards = Array.from(track.querySelectorAll('.home-img-card'));
    const imgs = Array.from(track.querySelectorAll('.home-img'));
    const total = cards.length;

    if (!total) return;

    let currentIndex = 0;
    let autoTimer = null;
    const interval = 4000; // 自动切换间隔，单位 ms

    /* 给每张卡片设置模糊背景图 */
    function setCardBackgrounds() {
        cards.forEach((card) => {
            const img = card.querySelector('.home-img');
            if (!img) return;

            const src = img.currentSrc || img.src;
            if (!src) return;

            card.style.setProperty('--bg-url', `url("${src}")`);
        });
    }

    /* 滚动到指定页 */
    function goToSlide(index, smooth = true) {
        if (total === 0) return;

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

    /* 根据当前滚动位置反算所在页 */
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

    /* 按钮事件 */
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

    /* 用户手动滑动后更新 currentIndex */
    let scrollTimer = null;
    track.addEventListener('scroll', function () {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            syncIndexFromScroll();
        }, 120);
    });

    /* 鼠标移入暂停，移出继续 */
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);

    /* 触摸/拖动开始时暂停，结束后恢复 */
    track.addEventListener('pointerdown', stopAutoPlay);
    track.addEventListener('pointerup', restartAutoPlay);
    track.addEventListener('pointercancel', restartAutoPlay);
    track.addEventListener('touchstart', stopAutoPlay, { passive: true });
    track.addEventListener('touchend', restartAutoPlay, { passive: true });

    /* 图片加载完成后设置背景 */
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

    /* 窗口尺寸变化时矫正位置 */
    window.addEventListener('resize', function () {
        goToSlide(currentIndex, false);
    });

    setCardBackgrounds();
    goToSlide(0, false);
    startAutoPlay();
});
