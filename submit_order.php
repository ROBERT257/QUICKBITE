<?php
include 'db.php'; // This connects to MySQL

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Get all form inputs safely
    $item_name = $_POST['food_item'];
    $quantity = $_POST['quantity'];
    $instructions = $_POST['instructions'];
    $address = $_POST['address'];
    $phone = $_POST['phone'];
    $payment = $_POST['payment'];

    // Prepare SQL insert
    $stmt = $conn->prepare("INSERT INTO orders (item_name, quantity, instructions, address, phone_number, payment_option) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sissss", $item_name, $quantity, $instructions, $address, $phone, $payment);

    if ($stmt->execute()) {
        echo "<script>alert('✅ Order placed successfully!'); window.location.href='index.html';</script>";
    } else {
        echo "❌ Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
} else {
    echo "❌ Invalid request method.";
}
?>
