const FREEFORM_ENDPOINT = "";
const PHP_FALLBACK_ENDPOINT = "contact.php";

(() => {
  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const year = document.getElementById('year');
  const form = document.getElementById('booking-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');

  if (year) year.textContent = new Date().getFullYear();

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  function setFeedback(message, kind = 'error') {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.style.color = kind === 'success' ? '#9af7c1' : '#ff8080';
  }

  function validateForm(data) {
    if (data.website) return 'Spam detected.';
    const required = ['fullName', 'email', 'phone', 'eventDate', 'eventType', 'eventLocation', 'guestCount', 'preferredService', 'preferredContactMethod', 'message'];
    for (const key of required) {
      if (!data[key] || !String(data[key]).trim()) return 'Please complete all required fields.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Please enter a valid email address.';
    if (!/^[0-9+()\-\.\s]{7,20}$/.test(data.phone)) return 'Please enter a valid phone number.';
    return '';
  }

  async function postJson(endpoint, payload) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { message: text || '' }; }

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Unable to send your request right now.');
    }

    return data;
  }

  async function postFormEncoded(endpoint, payload) {
    const body = new URLSearchParams(payload);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body
    });

    if (!response.ok) {
      throw new Error('Submission endpoint returned an error.');
    }

    return { success: true, message: 'Booking request sent successfully.' };
  }

  async function submitBooking(event) {
    event.preventDefault();

    if (window.location.protocol === 'file:') {
      setFeedback('Form submission is disabled on file:// previews. Upload to hosting or run a local server.');
      return;
    }

    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get('fullName') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      eventDate: String(formData.get('eventDate') || '').trim(),
      eventType: String(formData.get('eventType') || '').trim(),
      eventLocation: String(formData.get('eventLocation') || '').trim(),
      guestCount: String(formData.get('guestCount') || '').trim(),
      preferredService: String(formData.get('preferredService') || '').trim(),
      preferredContactMethod: String(formData.get('preferredContactMethod') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      website: String(formData.get('website') || '').trim(),
      recipient: 'djynotlive@icloud.com',
      source: 'djynot.live contact form'
    };

    const error = validateForm(payload);
    if (error) return setFeedback(error);

    const endpoint = FREEFORM_ENDPOINT.trim() || PHP_FALLBACK_ENDPOINT;
    const usingFreeform = Boolean(FREEFORM_ENDPOINT.trim());

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    setFeedback('');

    try {
      const result = usingFreeform
        ? await postFormEncoded(endpoint, payload)
        : await postJson(endpoint, payload);

      form.reset();
      setFeedback(result.message || 'Booking request sent successfully.', 'success');
    } catch (err) {
      const msg = err && err.message ? err.message : 'Unable to send your request at this time.';
      if (/Failed to fetch/i.test(msg)) {
        setFeedback('Connection issue detected. If FREEFORM is not set, confirm contact.php is deployed. You can also configure FREEFORM_ENDPOINT in assets/js/main.js.');
      } else {
        setFeedback(msg);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Booking Request';
    }
  }

  if (form) form.addEventListener('submit', submitBooking);
})();
