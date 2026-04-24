<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Fixed recipient. You can move this to config.php if desired.
$recipient = 'djynotlive@icloud.com';
$subject = 'New DJ YNOT Booking Request';
$source = 'djynot.live contact form';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput ?: '', true);
if (!is_array($data)) {
    $data = $_POST;
}

function field(array $data, string $key, int $maxLen = 255): string {
    $value = isset($data[$key]) ? trim((string)$data[$key]) : '';
    $value = strip_tags($value);
    $value = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $value);
    if (mb_strlen($value) > $maxLen) {
        $value = mb_substr($value, 0, $maxLen);
    }
    return $value;
}

$fullName = field($data, 'fullName', 100);
$email = field($data, 'email', 120);
$phone = field($data, 'phone', 30);
$eventDate = field($data, 'eventDate', 30);
$eventType = field($data, 'eventType', 100);
$eventLocation = field($data, 'eventLocation', 140);
$guestCount = field($data, 'guestCount', 12);
$preferredService = field($data, 'preferredService', 80);
$preferredContactMethod = field($data, 'preferredContactMethod', 20);
$message = field($data, 'message', 2000);
$website = field($data, 'website', 100);

if ($website !== '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Spam check failed.']);
    exit;
}

$required = [$fullName, $email, $phone, $eventDate, $eventType, $eventLocation, $guestCount, $preferredService, $preferredContactMethod, $message];
foreach ($required as $value) {
    if ($value === '') {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Please complete all required fields.']);
        exit;
    }
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please provide a valid email address.']);
    exit;
}

if (!preg_match('/^[0-9+()\-\.\s]{7,20}$/', $phone)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please provide a valid phone number.']);
    exit;
}

$emailBody = "New DJ YNOT booking request\n\n"
    . "Full Name: {$fullName}\n"
    . "Email Address: {$email}\n"
    . "Phone Number: {$phone}\n"
    . "Event Date: {$eventDate}\n"
    . "Event Type: {$eventType}\n"
    . "Event Location: {$eventLocation}\n"
    . "Estimated Guest Count: {$guestCount}\n"
    . "Preferred Service: {$preferredService}\n"
    . "Preferred Contact Method: {$preferredContactMethod}\n"
    . "Message: {$message}\n"
    . "Source: {$source}\n"
    . "Submitted At: " . date('Y-m-d H:i:s T') . "\n";

$from = 'no-reply@djynot.live';
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: DJ YNOT Website <' . $from . '>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion(),
];

// Some shared hosts disable mail() or require verified sender domains.
// If mail delivery fails, ask your host for SMTP requirements or use FREEFORM endpoint mode.
$sent = @mail($recipient, $subject, $emailBody, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Unable to send right now. Please try again or contact by phone/email.']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Booking request sent successfully.']);
