# DJ YNOT Website

A production-ready, static-first website for **DJ YNOT** — a premium event entertainment brand offering live DJ services, karaoke nights, musical bingo, private parties, bar/lounge events, birthdays, and custom experiences.

## Tech stack

- HTML5
- CSS3 (no framework, no build process)
- Vanilla JavaScript
- PHP fallback for contact form delivery via `mail()`
- No Node, React, Python, Composer, database, or paid dependencies

## File structure

```text
dj-ynot-website/
├── index.html
├── contact.php
├── config.example.php
├── README.md
├── .htaccess
└── assets/
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── main.js
    └── images/
        ├── README.md
        ├── about-placeholder.svg
        ├── hero-placeholder.svg
        └── services-placeholder.svg
```

## What is included

- Mobile-first, premium dark nightlife visual system
- Commercial-quality CSS hero animation with turntable, mixer, lasers, glow, and equalizer motion
- Image placeholder structure for future real event photos
- Semantic homepage sections for services, experiences, event types, about, benefits, genres, FAQ, and booking
- Accessible sticky navigation and keyboard-friendly mobile menu
- Field-level contact form validation with accessible error messaging
- FREEFORM-ready endpoint option with PHP fallback
- Secure PHP validation, sanitization, honeypot protection, and JSON responses
- SEO metadata, Open Graph tags, Twitter metadata, canonical URL, and JSON-LD schema
- Optional Apache `.htaccess` with safe headers, compression, and caching

## Deploy on shared hosting

1. Open your hosting control panel and locate `public_html`.
2. Upload `index.html` to `public_html`.
3. Upload `contact.php` to `public_html`.
4. Upload the entire `assets/` folder to `public_html`.
5. Upload `.htaccess` only if your host uses Apache and supports these directives.
   - HTTPS redirect is intentionally commented out until a valid TLS certificate is installed.
6. Visit `https://djynot.live` once SSL is installed, or `http://djynot.live` while SSL is being provisioned.
7. Submit a booking request test.
8. Confirm the message arrives at `djynotlive@icloud.com`.

## Upload with cPanel or FTP

- **cPanel File Manager**: drag and drop files into `public_html`.
- **FTP/SFTP**: use credentials from the hosting provider and upload files into `public_html`.
- Confirm permissions allow the web server to read `.html`, `.css`, `.js`, `.svg`, and `.php` files.

## Contact form behavior

The form in `index.html` is enhanced by `assets/js/main.js`.

- If `FREEFORM_ENDPOINT` is configured, JavaScript sends URL-encoded form data to that endpoint.
- If `FREEFORM_ENDPOINT` is empty, JavaScript posts to `contact.php`.
- PHP fallback tries to accept JSON, multipart/form-data, or URL-encoded requests.
- The form includes a honeypot field named `website`. Any value in this field is rejected as spam.

Payload fields:

- `fullName`
- `email`
- `phone`
- `eventDate`
- `eventType`
- `eventLocation`
- `guestCount`
- `preferredService`
- `preferredContactMethod`
- `message`
- `website`
- `recipient` (`djynotlive@icloud.com`)
- `source` (`djynot.live contact form`)

## FREEFORM setup option

1. Open `assets/js/main.js`.
2. Set the endpoint:
   ```js
   const FREEFORM_ENDPOINT = "https://your-freeform-endpoint";
   ```
3. Configure the FREEFORM workflow to forward submissions to `djynotlive@icloud.com`.
4. Keep private API keys or credentials out of browser JavaScript.
5. If FREEFORM requires private credentials, leave `FREEFORM_ENDPOINT` empty and use `contact.php` instead.

## PHP mail() fallback setup

Default mode works when `FREEFORM_ENDPOINT` is empty.

`contact.php`:

- accepts POST only
- returns JSON only
- validates required fields
- validates email, phone, and guest count
- blocks honeypot spam
- strips tags and limits field lengths
- prevents header injection in email headers
- sends plain-text booking details to `djynotlive@icloud.com`
- supports optional `config.php` overrides copied from `config.example.php`

## Change recipient or sender email

1. Copy `config.example.php` to `config.php`.
2. Update values in `config.php`:
   ```php
   return [
       'recipient_email' => 'djynotlive@icloud.com',
       'from_email' => 'no-reply@djynot.live',
       'source_label' => 'djynot.live contact form',
   ];
   ```
3. Use a host-approved `from_email` if your provider requires verified sender addresses.

## Test the form

1. Open the deployed site in a browser.
2. Fill all required fields and submit.
3. Confirm success state appears on the page.
4. Confirm email delivery to `djynotlive@icloud.com`.
5. Try an invalid email/phone to verify validation.
6. Use browser dev tools to fill the hidden `website` field and confirm spam rejection.
7. If testing PHP directly, send a POST request to `contact.php` with the required fields.

## If PHP mail() does not send

- Check spam/junk folder.
- Confirm `contact.php` exists in the same directory as `index.html`.
- Confirm PHP is enabled on the hosting plan.
- Confirm `mail()` is enabled by the hosting provider.
- Use a verified sender email if required by the host.
- Ask the host whether SMTP is mandatory.
- If SMTP is required, replace `mail()` with host-provided SMTP logic or use a FREEFORM endpoint.

## TLS certificate fix (Chrome NET::ERR_CERT_COMMON_NAME_INVALID)

If Chrome shows **"Your connection is not private"** with `NET::ERR_CERT_COMMON_NAME_INVALID`, the server certificate does not match the hostname being visited. This is a hosting/TLS configuration issue, not a JavaScript or PHP bug.

Fix on hosting panel:

1. Issue/install SSL for **djynot.live**.
2. Also issue/install SSL for **www.djynot.live** if the `www` hostname is enabled.
3. Ensure this site’s virtual host is bound to that certificate.
4. Wait for certificate provisioning to complete.
5. Verify both URLs after provisioning:
   - `https://djynot.live`
   - `https://www.djynot.live` (if enabled)
6. Only after certificate validation passes should you enable HTTP→HTTPS redirect in `.htaccess` by uncommenting the rewrite block.

## Customize copy and images

- Edit section copy directly in `index.html`.
- Replace placeholder SVGs in `assets/images/` with optimized real event images.
- Keep image dimensions reasonable and prefer WebP/SVG/JPG under 300 KB where possible.
- Keep verified contact details accurate:
  - Email: `djynot@iCloud.com`
  - Phone: `415-506-9668`
  - Booking recipient: `djynotlive@icloud.com`

## Accessibility checklist

- Semantic sections and heading hierarchy
- Skip link for keyboard users
- Keyboard-accessible mobile menu with `aria-expanded` and `aria-controls`
- Visible focus states
- Form labels with field-level error text
- `aria-live` submission feedback
- Reduced-motion support through `prefers-reduced-motion`
- No text embedded in images
- High-contrast foreground text on dark backgrounds

## SEO checklist

- Unique page title and meta description
- Canonical URL
- Open Graph metadata
- Twitter card metadata
- JSON-LD `EntertainmentBusiness` schema
- Crawlable content for services, events, genres, and booking intent
- No invented address, hours, testimonials, awards, or social media links

## Final launch checklist

- [ ] Files uploaded to `public_html`
- [ ] SSL certificate valid for `djynot.live`
- [ ] SSL certificate valid for `www.djynot.live` if used
- [ ] Optional HTTPS redirect enabled only after SSL validation
- [ ] Navigation and mobile menu work
- [ ] Contact links (`mailto`, `tel`) work
- [ ] Form validation works
- [ ] Form submission returns a success/error state properly
- [ ] Test booking email arrives at `djynotlive@icloud.com`
- [ ] `.htaccess` compatibility confirmed
- [ ] Placeholder images replaced when real brand/event photos are available

## Basic rate-limit guidance

For higher spam resistance, add host-level rate limiting through your hosting provider, WAF, ModSecurity, or Cloudflare so one IP cannot submit excessive requests in a short time.
