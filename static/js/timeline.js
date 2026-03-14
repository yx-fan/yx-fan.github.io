/**
 * Timeline dynamic layout:
 * 1. Circle at exact date (uniform scale), card top aligns when not pushed
 * 2. When card pushed for overlap, circle stays at date via margin-top offset
 * 3. Year labels: uniform scale for accuracy
 */
(function () {
  const PX_PER_MONTH = 12;       // uniform scale for circle & year accuracy
  const REF_MONTHS = 2026 * 12 + 3;
  const MIN_GAP_CARDS = 28;       // min px between same-side cards
  const TOP_PADDING = 20;
  const CIRCLE_SIZE = 25;

  function parseDate(str) {
    const m = str.match(/(\d{4})\.(\d{1,2})/);
    if (!m) return null;
    return { year: parseInt(m[1], 10), month: parseInt(m[2], 10) };
  }

  function dateToMonths(d) {
    return d.year * 12 + d.month;
  }

  function init() {
    const container = document.querySelector('.timeline');
    if (!container) return;

    const items = Array.from(container.querySelectorAll('.timeline-item'));
    const ruler = container.querySelector('.timeline-ruler');
    const yearSpans = ruler ? Array.from(ruler.querySelectorAll('.timeline-year')) : [];

    if (items.length === 0) return;

    const cards = items.map((el, idx) => {
      const startStr = el.getAttribute('data-start-date');
      const parsed = parseDate(startStr || '');
      return {
        el,
        start: parsed,
        startMonths: parsed ? dateToMonths(parsed) : 0,
        isLeft: idx % 2 === 0,
      };
    }).filter(c => c.start);

    if (cards.length === 0) return;

    cards.sort((a, b) => b.startMonths - a.startMonths);

    // Uniform scale: date -> Y (so circles and year labels are accurate)
    const dateToY = (months) => (REF_MONTHS - months) * PX_PER_MONTH;

    // 1. Assign card Y with overlap prevention (same-side only)
    let lastLeftBottom = -1;
    let lastRightBottom = -1;
    let maxBottom = 0;

    for (const card of cards) {
      const desiredY = dateToY(card.startMonths);
      const prevBottom = card.isLeft ? lastLeftBottom : lastRightBottom;
      const minY = prevBottom < 0 ? CIRCLE_SIZE / 2 : prevBottom + MIN_GAP_CARDS + CIRCLE_SIZE / 2;
      const y = Math.max(desiredY, minY);

      card.el.style.top = (TOP_PADDING + y - CIRCLE_SIZE / 2) + 'px';
      const h = card.el.offsetHeight;
      const cardBottom = y - CIRCLE_SIZE / 2 + h;

      if (card.isLeft) lastLeftBottom = cardBottom;
      else lastRightBottom = cardBottom;
      maxBottom = Math.max(maxBottom, cardBottom);

      // Circle at exact date: when card pushed down, pull circle up
      const circle = card.el.querySelector('.timeline-circle-left, .timeline-circle-right');
      if (circle) {
        const offset = desiredY - y;
        circle.style.marginTop = offset + 'px';
      }
    }

    const totalHeight = maxBottom + 80;
    container.style.minHeight = (TOP_PADDING + totalHeight) + 'px';
    const itemsWrap = container.querySelector('.timeline-items');
    if (itemsWrap) itemsWrap.style.minHeight = (TOP_PADDING + totalHeight) + 'px';

    // 2. Year positions: uniform scale (Jan 1 of each year)
    const minYear = Math.min(...cards.map(c => c.start.year));
    const topYear = Math.max(...cards.map(c => c.start.year), new Date().getFullYear() + 1);
    const yearToTop = new Map();
    for (let y = topYear; y >= minYear; y--) {
      yearToTop.set(y, dateToY(y * 12 + 1));
    }

    // 3. Apply year positions
    for (const span of yearSpans) {
      const y = parseInt(span.getAttribute('data-year') || span.textContent.trim(), 10);
      const top = yearToTop.get(y);
      if (top !== undefined) span.style.top = (TOP_PADDING + top) + 'px';
    }

    if (ruler) ruler.style.height = (TOP_PADDING + totalHeight) + 'px';
  }

  function run() {
    if (document.querySelector('.timeline')) init();
  }
  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run);
  }
})();
