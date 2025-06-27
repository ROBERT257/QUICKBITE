<?php
include 'db.php';

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Fetch messages from contact table
$query = "SELECT * FROM contact";
$result = $conn->query($query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact Messages - Admin</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <section class="admin-messages">
    <h2>Contact Messages</h2>
    <?php if ($result && $result->num_rows > 0): ?>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <?php while($row = $result->fetch_assoc()): ?>
            <tr>
              <td><?= htmlspecialchars($row['name']) ?></td>
              <td><?= htmlspecialchars($row['email']) ?></td>
              <td><?= htmlspecialchars($row['message']) ?></td>
            </tr>
          <?php endwhile; ?>
        </tbody>
      </table>
    <?php else: ?>
      <p>No messages found.</p>
    <?php endif; ?>
  </section>
</body>
</html>
