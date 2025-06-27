<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "quickbite_db";

// Create connection
$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Get data from form
$username = $_POST['name'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
  die("All fields are required.");
}

// Check if username already exists
$check = $conn->prepare("SELECT * FROM users WHERE username = ?");
$check->bind_param("s", $username);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
  die("Username already taken. Please choose another one.");
}

// Insert user into database
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'user')");
$stmt->bind_param("ss", $username, $hashedPassword);

if ($stmt->execute()) {
  echo "Signup successful. <a href='login.html'>Click here to login</a>.";
} else {
  echo "Signup failed. Please try again.";
}

$stmt->close();
$conn->close();
?>
