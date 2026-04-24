# DJ YNOT Website

## 1. Project overview
A production-ready, mobile-first marketing website for **DJ YNOT** built for shared hosting environments using only HTML, CSS, JavaScript, and optional PHP form handling.

## 2. Tech stack
- HTML5
- CSS3 (no framework)
- Vanilla JavaScript
- PHP (contact form fallback using `mail()`)

## 3. File structure
```
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
        └── README.md
```

## 4. How to deploy on shared hosting
1. Open your hosting control panel and locate `public_html`.
2. Upload `index.html` to `public_html`.
3. Upload `contact.php` to `public_html`.
4. Upload the entire `assets/` folder to `public_html`.
5. Upload `.htaccess` only if your host uses Apache and supports these directives.
6. Visit `https://djynot.live`.
7. Submit a booking request test.
8. Confirm the message arrives at `djynotlive@iCloud.com`.

## 5. How to upload via cPanel or FTP
- **cPanel File Manager**: drag and drop files into `public_html`.
- **FTP/SFTP**: use credentials from hosting provider and upload files into `public_html`.

## 6. How the contact form works
The form in `index.html` is handled by `assets/js/main.js`.
- If `FREEFORM_ENDPOINT` is configured, JS sends JSON to that endpoint.
- If `FREEFORM_ENDPOINT` is empty, JS sends JSON to `contact.php`.

Payload fields sent:
- fullName
- email
- phone
- eventDate
- eventType
- eventLocation
- guestCount
- preferredService
- preferredContactMethod
- message
- website (honeypot)
- recipient (`djynotlive@iCloud.com`)
- source (`djynot.live contact form`)

## 7. FREEFORM setup option
1. Open `assets/js/main.js`.
2. Set:
   ```js
   const FREEFORM_ENDPOINT = "https://your-freeform-endpoint";
   ```
3. Keep private credentials out of client-side code.
4. If FREEFORM requires server-side secrets, use `contact.php` mode instead.

## 8. PHP mail() fallback setup
Default mode works when `FREEFORM_ENDPOINT` is empty.

`contact.php`:
- accepts POST only
- validates required fields
- validates email and phone format
- blocks honeypot spam
- sanitizes and limits lengths
- sends plain text email to `djynotlive@iCloud.com`
- returns JSON success/error response

## 9. How to change recipient email
- Edit `contact.php` and update `$recipient`.
- Optional: duplicate `config.example.php` as `config.php` and load values from it.

## 10. How to test the form
1. Open `https://djynot.live`.
2. Fill all required fields.
3. Submit form.
4. Verify success message appears.
5. Confirm email delivery to inbox.
6. Try invalid email/phone to verify validation.
7. Fill honeypot manually in dev tools to verify spam rejection.

## 11. If PHP mail() does not send
- Check spam/junk folder.
- Confirm `mail()` is enabled on host.
- Ensure sender domain is verified if host requires it.
- Ask host whether SMTP is mandatory.
- If SMTP is required, replace `mail()` logic with host SMTP settings or use FREEFORM endpoint mode.

## 12. How to customize website copy
- Edit text content in `index.html` sections.
- Keep contact information accurate:
  - Email: `djynot@iCloud.com`
  - Phone: `415-506-9668`
  - Booking recipient: `djynotlive@iCloud.com`

## 13. Accessibility checklist
- Semantic sections and heading order
- Keyboard accessible mobile menu
- Visible focus states
- Form labels and required fields
- `aria-expanded` and `aria-controls` for nav toggle
- `aria-live` status messaging for submission feedback
- Reduced motion support via `prefers-reduced-motion`

## 14. SEO checklist
- Unique title and meta description
- Meta keywords
- Canonical URL
- Open Graph tags
- Twitter card tags
- JSON-LD `EntertainmentBusiness` schema
- Crawlable semantic content with internal anchors

## 15. Final launch checklist
- [ ] Files uploaded to `public_html`
- [ ] HTTPS valid on `https://djynot.live`
- [ ] Navigation and mobile menu work
- [ ] Contact links (`mailto`, `tel`) work
- [ ] Form submits and returns success/error state properly
- [ ] Test booking email arrives at `djynotlive@iCloud.com`
- [ ] `.htaccess` compatibility confirmed
- [ ] No placeholder content remains

## Basic rate-limit guidance
For higher spam resistance, add host-level rate limiting (WAF/ModSecurity/Cloudflare) so one IP cannot submit excessive requests in a short time.
