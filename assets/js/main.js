const FREEFORM_ENDPOINT = "";

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

  function validateForm(data) {
    if (data.website) return 'Spam detected.';
    const required = ['fullName', 'email', 'phone', 'eventDate', 'eventType', 'eventLocation', 'guestCount', 'preferredService', 'preferredContactMethod', 'message'];
    for (const key of required) {
      if (!data[key] || !String(data[key]).trim()) return 'Please complete all required fields.';
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    if (!emailOk) return 'Please enter a valid email address.';
    const phoneOk = /^[0-9+()\-\.\s]{7,20}$/.test(data.phone);
    if (!phoneOk) return 'Please enter a valid phone number.';
    return '';
  }

  async function submitBooking(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      fullName: (formData.get('fullName') || '').toString().trim(),
      email: (formData.get('email') || '').toString().trim(),
      phone: (formData.get('phone') || '').toString().trim(),
      eventDate: (formData.get('eventDate') || '').toString().trim(),
      eventType: (formData.get('eventType') || '').toString().trim(),
      eventLocation: (formData.get('eventLocation') || '').toString().trim(),
      guestCount: (formData.get('guestCount') || '').toString().trim(),
      preferredService: (formData.get('preferredService') || '').toString().trim(),
      preferredContactMethod: (formData.get('preferredContactMethod') || '').toString().trim(),
      message: (formData.get('message') || '').toString().trim(),
      website: (formData.get('website') || '').toString().trim(),
      recipient: 'djynotlive@iCloud.com',
      source: 'djynot.live contact form'
    };

    const error = validateForm(payload);
    if (error) {
      feedback.textContent = error;
      feedback.style.color = '#ff8080';
      return;
    }

    const endpoint = FREEFORM_ENDPOINT.trim() || 'contact.php';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    feedback.textContent = '';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to send your request at this time.');
      }

      form.reset();
      feedback.textContent = data.message || 'Booking request sent successfully.';
      feedback.style.color = '#9af7c1';
    } catch (err) {
      feedback.textContent = err.message || 'Unable to send your request at this time.';
      feedback.style.color = '#ff8080';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Booking Request';
    }
  }

  if (form) form.addEventListener('submit', submitBooking);
})();
