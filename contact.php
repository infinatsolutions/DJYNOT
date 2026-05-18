<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$config = [
    'recipient_email' => 'djynotlive@icloud.com',
    'from_email' => 'no-reply@djynot.live',
    'source_label' => 'djynot.live contact form',
];

$configPath = __DIR__ . '/config.php';
if (is_file($configPath)) {
    $customConfig = require $configPath;
    if (is_array($customConfig)) {
        $config = array_merge($config, $customConfig);
    }
}

function respond(bool $success, string $message, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput ?: '', true);
if (!is_array($data)) {
    $data = $_POST;
}

function cleanField(array $data, string $key, int $maxLength = 255, bool $preserveLines = false): string {
    $value = isset($data[$key]) ? trim((string)$data[$key]) : '';
    $value = strip_tags($value);
    $value = str_replace(["\0", '%0a', '%0d'], '', $value);

    if ($preserveLines) {
        $value = preg_replace("/\r\n|\r/", "\n", $value) ?? $value;
        $value = preg_replace("/\n{3,}/", "\n\n", $value) ?? $value;
    } else {
        $value = str_replace(["\r", "\n"], ' ', $value);
        $value = preg_replace('/\s+/', ' ', $value) ?? $value;
    }

    if (strlen($value) > $maxLength) {
        $value = substr($value, 0, $maxLength);
    }

    return trim($value);
}

function hasHeaderInjection(string $value): bool {
    return preg_match('/[\r\n]/', $value) === 1;
}

$fields = [
    'fullName' => cleanField($data, 'fullName', 100),
    'email' => cleanField($data, 'email', 120),
    'phone' => cleanField($data, 'phone', 30),
    'eventDate' => cleanField($data, 'eventDate', 30),
    'eventType' => cleanField($data, 'eventType', 100),
    'eventLocation' => cleanField($data, 'eventLocation', 140),
    'guestCount' => cleanField($data, 'guestCount', 12),
    'preferredService' => cleanField($data, 'preferredService', 80),
    'preferredContactMethod' => cleanField($data, 'preferredContactMethod', 20),
    'message' => cleanField($data, 'message', 2000, true),
    'website' => cleanField($data, 'website', 100),
];

if ($fields['website'] !== '') {
    respond(false, 'Spam check failed.', 400);
}

$required = ['fullName', 'email', 'phone', 'eventDate', 'eventType', 'eventLocation', 'guestCount', 'preferredService', 'preferredContactMethod', 'message'];
foreach ($required as $key) {
    if ($fields[$key] === '') {
        respond(false, 'Please complete all required fields.', 422);
    }
}

if (!filter_var($fields['email'], FILTER_VALIDATE_EMAIL) || hasHeaderInjection($fields['email'])) {
    respond(false, 'Please provide a valid email address.', 422);
}

if (!preg_match('/^[0-9+()\-.\s]{7,20}$/', $fields['phone'])) {
    respond(false, 'Please provide a valid phone number.', 422);
}

$guestCount = filter_var($fields['guestCount'], FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1, 'max_range' => 50000],
]);
if ($guestCount === false) {
    respond(false, 'Please provide a valid estimated guest count.', 422);
}

$recipient = (string)$config['recipient_email'];
$from = (string)$config['from_email'];
$source = (string)$config['source_label'];
$subject = 'New DJ YNOT Booking Request';

if (!filter_var($recipient, FILTER_VALIDATE_EMAIL) || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Form email configuration is invalid.', 500);
}

$emailBody = "New DJ YNOT booking request\n\n"
    . "Full Name: {$fields['fullName']}\n"
    . "Email Address: {$fields['email']}\n"
    . "Phone Number: {$fields['phone']}\n"
    . "Event Date: {$fields['eventDate']}\n"
    . "Event Type: {$fields['eventType']}\n"
    . "Event Location: {$fields['eventLocation']}\n"
    . "Estimated Guest Count: {$guestCount}\n"
    . "Preferred Service: {$fields['preferredService']}\n"
    . "Preferred Contact Method: {$fields['preferredContactMethod']}\n"
    . "Message:\n{$fields['message']}\n\n"
    . "Source: {$source}\n"
    . "Submitted At: " . date('Y-m-d H:i:s T') . "\n"
    . "IP Address: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unavailable') . "\n";

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: DJ YNOT Website <' . $from . '>',
    'Reply-To: ' . $fields['email'],
    'X-Mailer: PHP/' . phpversion(),
];

// Some shared hosts disable mail() or require verified sender domains.
// If mail delivery fails, ask your host for SMTP requirements or use FREEFORM endpoint mode.
$sent = @mail($recipient, $subject, $emailBody, implode("\r\n", $headers));

if (!$sent) {
    respond(false, 'Unable to send right now. Please try again or contact by phone/email.', 500);
}

respond(true, 'Booking request sent successfully.');
