document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('publication-filter-input');
    const yearDropdown = document.getElementById('publication-year-filter');
    const yearToggle = document.getElementById('publication-year-toggle');
    const yearLabel = document.getElementById('publication-year-label');
    const yearMenu = document.getElementById('publication-year-menu');
    const button = document.getElementById('publication-filter-btn');
    const list = document.getElementById('publication-list');

    if (!input || !yearDropdown || !yearToggle || !yearLabel || !yearMenu || !button || !list) return;

    const items = Array.from(list.querySelectorAll('li'));
    let selectedYear = '';

    items.forEach((li, index) => {
        li.dataset.originalHtml = li.innerHTML;
        li.dataset.originalIndex = index + 1;
        li.value = index + 1;

        const year = extractYear(li.textContent);
        if (year) {
        li.dataset.year = year;
        }
    });

    populateYearMenu();

    function extractYear(text) {
        if (!text) return '';
        const matches = text.match(/\b(19|20)\d{2}\b/g);
        if (!matches || !matches.length) return '';
        return matches[matches.length - 1];
    }

    function populateYearMenu() {
        const years = Array.from(
        new Set(
            items
            .map(li => li.dataset.year)
            .filter(Boolean)
        )
        ).sort((a, b) => Number(b) - Number(a));

        years.forEach(year => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'publication-year-option';
        btn.dataset.value = year;
        btn.textContent = year;
        yearMenu.appendChild(btn);
        });
    }

    function openYearMenu() {
        yearMenu.hidden = false;
        yearToggle.setAttribute('aria-expanded', 'true');
    }

    function closeYearMenu() {
        yearMenu.hidden = true;
        yearToggle.setAttribute('aria-expanded', 'false');
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function resetItem(li) {
        li.innerHTML = li.dataset.originalHtml;
        li.style.display = '';
        li.value = Number(li.dataset.originalIndex);
    }

    function highlightMatches(root, keyword) {
        if (!keyword) return;

        const regex = new RegExp(escapeRegExp(keyword), 'gi');

        const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
            const parent = node.parentNode;
            if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE') {
                return NodeFilter.FILTER_REJECT;
            }
            return node.nodeValue.toLowerCase().includes(keyword.toLowerCase())
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT;
            }
        }
        );

        const textNodes = [];
        while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
        }

        textNodes.forEach(node => {
        const text = node.nodeValue;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        text.replace(regex, function(match, offset) {
            if (offset > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
            }

            const span = document.createElement('span');
            span.className = 'search-hit';
            span.textContent = match;
            fragment.appendChild(span);

            lastIndex = offset + match.length;
        });

        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        node.parentNode.replaceChild(fragment, node);
        });
    }

    function updateYearSelectedState() {
        const options = yearMenu.querySelectorAll('.publication-year-option');
        options.forEach(option => {
        option.classList.toggle('is-selected', option.dataset.value === selectedYear);
        });
    }

    function applyFilter() {
        const keyword = input.value.trim().toLowerCase();

        items.forEach(li => {
        resetItem(li);

        const text = li.textContent.toLowerCase();
        const liYear = li.dataset.year || '';

        const keywordMatched = keyword === '' || text.includes(keyword);
        const yearMatched = selectedYear === '' || liYear === selectedYear;

        if (keywordMatched && yearMatched) {
            li.style.display = '';
            li.value = Number(li.dataset.originalIndex);
            if (keyword !== '') {
            highlightMatches(li, keyword);
            }
        } else {
            li.style.display = 'none';
        }
        });
    }

    yearToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        if (yearMenu.hidden) {
        openYearMenu();
        } else {
        closeYearMenu();
        }
    });

    yearMenu.addEventListener('click', function (e) {
        const option = e.target.closest('.publication-year-option');
        if (!option) return;

        selectedYear = option.dataset.value || '';
        yearLabel.textContent = selectedYear || 'Years';
        updateYearSelectedState();
        closeYearMenu();
        applyFilter();
    });

    /* 年份菜单区域隐藏 */
    const header = document.querySelector('#masthead, .site-header, header');

    if (header) {
    header.addEventListener('mouseenter', function () {
        closeYearMenu();
    });
    }
    
    /* 点击别处关闭 */
    document.addEventListener('click', function (e) {
        if (!yearDropdown.contains(e.target)) {
        closeYearMenu();
        }
    });

    button.addEventListener('click', applyFilter);

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
        e.preventDefault();
        applyFilter();
        }
    });
});
