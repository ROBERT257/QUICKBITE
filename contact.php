<?php
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = mysqli_real_escape_string($conn, $_POST["name"]);
    $email = mysqli_real_escape_string($conn, $_POST["email"]);
    $message = mysqli_real_escape_string($conn, $_POST["message"]);

    $sql = "INSERT INTO contact (name, email, message, created_at) 
            VALUES ('$name', '$email', '$message', NOW())";

    if ($conn->query($sql)) {
        echo "Message sent successfully!";
    } else {
        echo "Error: " . $conn->error;
    }
}
?>
