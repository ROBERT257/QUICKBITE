<?php
include 'db.php';
$result = $conn->query("SELECT * FROM contact_messages");
?>

<h2>Contact Form Submissions</h2>
<table border="1">
  <tr>
    <th>Name</th><th>Email</th><th>Message</th><th>Date</th>
  </tr>

  <?php while($row = $result->fetch_assoc()): ?>
  <tr>
    <td><?= $row['name'] ?></td>
    <td><?= $row['email'] ?></td>
    <td><?= $row['message'] ?></td>
    <td><?= $row['submitted_at'] ?></td>
  </tr>
  <?php endwhile; ?>
</table>
