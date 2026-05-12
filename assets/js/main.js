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

  async function parseJsonOrText(response) {
    const text = await response.text();
    try { return text ? JSON.parse(text) : {}; } catch (_) { return { message: text || '' }; }
  }

  async function post(endpoint, payload, contentType) {
    let body;
    const headers = { Accept: 'application/json' };

    if (contentType === 'json') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(payload);
    } else if (contentType === 'multipart') {
      body = new FormData();
      Object.entries(payload).forEach(([k, v]) => body.append(k, v));
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

  async function submitBooking(event) {
    event.preventDefault();

    if (window.location.protocol === 'file:') {
      setFeedback('Form submission is disabled on file:// previews. Upload to hosting or use a local server URL like http://localhost.');
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

    const validationError = validateForm(payload);
    if (validationError) {
      setFeedback(validationError);
      return;
    }

    const usingFreeform = Boolean(FREEFORM_ENDPOINT.trim());
    const endpoint = usingFreeform ? FREEFORM_ENDPOINT.trim() : getPhpEndpoint();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    setFeedback('');

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
      setFeedback(result.message || 'Booking request sent successfully.', 'success');
    } catch (error) {
      // Shared-hosting firewalls can block fetch while still accepting standard form-style payloads.
      if (!usingFreeform && sendViaBeacon(endpoint, payload)) {
        form.reset();
        setFeedback('Booking request queued successfully. If you do not hear back soon, please call 415-506-9668.', 'success');
      } else {
        setFeedback('Submission could not be completed from this browser session. If HTTPS shows a certificate warning, install a valid certificate for djynot.live on the host first, then retry. You can also call 415-506-9668 or email djynot@iCloud.com.');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Booking Request';
    }
  }

  if (form) form.addEventListener('submit', submitBooking);
})();
