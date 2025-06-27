<?php
require __DIR__ . '/vendor/autoload.php';

use AfricasTalking\SDK\AfricasTalking;

// ✅ Sandbox credentials from your Africa's Talking account
$username = 'sandbox';
$apiKey   = 'atsk_faeec71a04b06a84aa0c1317881a5bafb3fc300f2286c4b10dfc961c913c2614ab02e6d8';

// Initialize the SDK
$AT = new AfricasTalking($username, $apiKey);

// Get the SMS service
$sms = $AT->sms();

// Recipient & message
$to = '+254742326193';
$message = '🚨 New Order Received! Check your Elizabeth Food dashboard for details.';

// Send the SMS
try {
    $sms->send([
        'to'      => $to,
        'message' => $message
    ]);
    echo "✅ SMS sent successfully!";
} catch (Exception $e) {
    echo "❌ Error sending SMS: " . $e->getMessage();
}
