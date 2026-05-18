const FREEFORM_ENDPOINT = "";
const PHP_FALLBACK_ENDPOINT = "contact.php";

(() => {
  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const year = document.getElementById('year');
  const form = document.getElementById('booking-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');
  const revealItems = document.querySelectorAll('.reveal');

  const fieldRules = {
    fullName: { label: 'Full name', required: true },
    email: { label: 'Email address', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
    phone: { label: 'Phone number', required: true, pattern: /^[0-9+()\-.\s]{7,20}$/, message: 'Enter a valid phone number.' },
    eventDate: { label: 'Event date', required: true },
    eventType: { label: 'Event type', required: true },
    eventLocation: { label: 'Event location', required: true },
    guestCount: { label: 'Estimated guest count', required: true, min: 1, max: 50000 },
    preferredService: { label: 'Preferred service', required: true },
    preferredContactMethod: { label: 'Preferred contact method', required: true },
    message: { label: 'Event details', required: true }
  };

  if (year) year.textContent = new Date().getFullYear();

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  function closeMenu() {
    if (!menuBtn || !nav) return;
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }

  function setFeedback(message, kind = 'error') {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.style.color = kind === 'success' ? '#9af7c1' : '#ff8f9b';
  }

  function setFieldError(name, message) {
    const input = form?.elements[name];
    const errorNode = document.getElementById(`${name}-error`);
    if (!input || !errorNode) return;

    errorNode.textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    input.setAttribute('aria-describedby', `${name}-error`);
  }

  function clearFieldErrors() {
    Object.keys(fieldRules).forEach((name) => setFieldError(name, ''));
  }

  function validatePayload(payload) {
    const errors = {};

    if (payload.website) {
      errors.website = 'Spam detected.';
      return errors;
    }

    Object.entries(fieldRules).forEach(([name, rule]) => {
      const value = String(payload[name] || '').trim();
      if (rule.required && !value) {
        errors[name] = `${rule.label} is required.`;
        return;
      }
      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors[name] = rule.message;
      }
      if (value && name === 'guestCount') {
        const count = Number(value);
        if (!Number.isFinite(count) || count < rule.min || count > rule.max) {
          errors[name] = `Enter a guest count between ${rule.min} and ${rule.max}.`;
        }
      }
    });

    return errors;
  }

  function focusFirstInvalid(errors) {
    const firstInvalidName = Object.keys(errors).find((name) => name !== 'website');
    if (firstInvalidName && form?.elements[firstInvalidName]) {
      form.elements[firstInvalidName].focus();
    }
  }

  async function parseJsonOrText(response) {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (_) {
      return { message: text || '' };
    }
  }

  async function post(endpoint, payload, contentType) {
    let body;
    const headers = { Accept: 'application/json' };

    if (contentType === 'json') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(payload);
    } else if (contentType === 'multipart') {
      body = new FormData();
      Object.entries(payload).forEach(([key, value]) => body.append(key, value));
    } else {
      headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
      body = new URLSearchParams(payload);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers,
      body
    });

    const data = await parseJsonOrText(response);
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Unable to send your request right now.');
    }

    return data;
  }

  function sendViaBeacon(endpoint, payload) {
    if (!('sendBeacon' in navigator)) return false;
    const blob = new Blob([new URLSearchParams(payload).toString()], {
      type: 'application/x-www-form-urlencoded;charset=UTF-8'
    });
    return navigator.sendBeacon(endpoint, blob);
  }

  function getPhpEndpoint() {
    const resolved = form?.action ? form.action : new URL(PHP_FALLBACK_ENDPOINT, window.location.href).toString();
    if (window.location.protocol === 'https:' && resolved.startsWith('http:')) {
      return resolved.replace(/^http:/, 'https:');
    }
    return resolved;
  }

  function getPayload() {
    const formData = new FormData(form);
    return {
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
  }

  async function submitBooking(event) {
    event.preventDefault();

    if (window.location.protocol === 'file:') {
      setFeedback('Form submission is disabled on file:// previews. Upload to hosting or use a local server URL like http://localhost.');
      return;
    }

    clearFieldErrors();
    const payload = getPayload();
    const validationErrors = validatePayload(payload);

    if (Object.keys(validationErrors).length) {
      Object.entries(validationErrors).forEach(([name, message]) => setFieldError(name, message));
      setFeedback(validationErrors.website || 'Please fix the highlighted fields and try again.');
      focusFirstInvalid(validationErrors);
      return;
    }

    const usingFreeform = Boolean(FREEFORM_ENDPOINT.trim());
    const endpoint = usingFreeform ? FREEFORM_ENDPOINT.trim() : getPhpEndpoint();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    setFeedback('Sending your booking request...', 'success');

    try {
      let result;

      if (usingFreeform) {
        result = await post(endpoint, payload, 'urlencoded');
      } else {
        try {
          result = await post(endpoint, payload, 'json');
        } catch (_) {
          try {
            result = await post(endpoint, payload, 'multipart');
          } catch (_) {
            result = await post(endpoint, payload, 'urlencoded');
          }
        }
      }

      form.reset();
      clearFieldErrors();
      setFeedback(result.message || 'Booking request sent successfully.', 'success');
    } catch (error) {
      if (!usingFreeform && sendViaBeacon(endpoint, payload)) {
        form.reset();
        clearFieldErrors();
        setFeedback('Booking request queued successfully. If you do not hear back soon, please call 415-506-9668.', 'success');
      } else {
        setFeedback('Submission could not be completed from this browser session. If HTTPS shows a certificate warning, install a valid certificate for djynot.live on the host first, then retry. You can also call 415-506-9668 or email djynot@iCloud.com.');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Booking Request';
    }
  }

  if (form) {
    form.addEventListener('submit', submitBooking);
    Object.keys(fieldRules).forEach((name) => {
      const input = form.elements[name];
      if (input) {
        input.addEventListener('input', () => setFieldError(name, ''));
        input.addEventListener('change', () => setFieldError(name, ''));
      }
    });
  }
})();
