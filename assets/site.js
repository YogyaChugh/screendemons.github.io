// Store links. Set `android` to the Play Store URL the day the app is published and every
// "Android" button on the site turns into a real "Get it on Google Play" button.
const STORES = {
  ios: 'https://apps.apple.com/app/id6796334366',
  android: null, // 'https://play.google.com/store/apps/details?id=com.screendemons.app'
};

document.querySelectorAll('[data-store="ios"]').forEach((a) => {
  a.href = STORES.ios;
});
document.querySelectorAll('[data-store="android"]').forEach((a) => {
  if (STORES.android) {
    a.href = STORES.android;
    a.removeAttribute('aria-disabled');
    const label = a.querySelector('.two');
    if (label) label.innerHTML = '<small>Get it on</small>Google Play';
  } else {
    a.href = '#waitlist';
  }
});

// Fade things in as they scroll into view.
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('in'));
}

// "What does scrolling cost you?" Same sums as the app's onboarding.
const age = document.getElementById('age');
const hours = document.getElementById('hours');
if (age && hours) {
  const LIFE_END = 80;
  const WAKING = 16;
  const GREEN = 2;
  const trim = (n) => String(Math.round(n * 10) / 10);
  const span = (days) => {
    if (days >= 60) return `${Math.round(days / 30)} months`;
    if (days >= 1) return `${trim(days)} days`;
    return `${Math.round(days * 24)} h`;
  };
  const $ = (id) => document.getElementById(id);
  const update = () => {
    const a = Number(age.value);
    const h = Number(hours.value);
    const years = ((LIFE_END - a) * h) / 24;
    const winBack = ((LIFE_END - a) * Math.max(0, h - GREEN)) / 24;
    $('ageOut').textContent = a;
    $('hoursOut').textContent = `${trim(h)} h`;
    $('years').textContent = trim(years);
    $('ageText').textContent = a;
    $('share').textContent = `${Math.round((h / WAKING) * 100)}%`;
    $('week').textContent = span((h * 7) / 24);
    $('month').textContent = span((h * 30) / 24);
    $('year').textContent = span((h * 365) / 24);
    $('win').innerHTML =
      h > GREEN
        ? `Keep your demon <strong>green (under ${GREEN} h)</strong> and you <strong>win back ${trim(winBack)} years</strong>.`
        : `You’re already <strong>under ${GREEN} h</strong>. Keep your demon green.`;
    age.setAttribute('aria-valuetext', `${a} years old`);
    hours.setAttribute('aria-valuetext', `${trim(h)} hours a day`);
  };
  age.addEventListener('input', update);
  hours.addEventListener('input', update);
  update();
}

// Waitlist (Android launch). Posts to the same form service as before.
const form = document.getElementById('waitlistForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('statusMsg');
    btn.disabled = true;
    btn.textContent = 'Joining…';
    status.className = 'status';
    status.textContent = '';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) {
        status.className = 'status ok';
        status.textContent = 'You’re on the list. We’ll email you when it’s live.';
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        status.className = 'status err';
        status.textContent = data.errors ? data.errors.map((x) => x.message).join(', ') : 'Something went wrong. Please try again.';
      }
    } catch {
      status.className = 'status err';
      status.textContent = 'Something went wrong. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Notify me';
    }
  });
}
