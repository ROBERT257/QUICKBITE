<?php
include 'db.php'; // your DB connection

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Your login logic goes here
    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
      $stmt->bind_result($user_id, $hashed_password);
      $stmt->fetch();

      if (password_verify($password, $hashed_password)) {
        echo "✅ Login successful!";
        // Redirect or start session here
      } else {
        echo "❌ Incorrect password";
      }
    } else {
      echo "❌ User not found.";
    }

    $stmt->close();
  } else {
    echo "❌ Please fill out both username and password.";
  }
} else {
  echo "🚫 Invalid request method.";
}
?>
