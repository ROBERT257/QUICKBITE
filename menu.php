<?php
include 'db.php';

// Check for DB connection and query errors
if (!$conn) {
  die("Connection failed: " . mysqli_connect_error());
}

$query = "SELECT * FROM menu_items";  // Replace with your actual table name
$result = $conn->query($query);

// Check query success
if (!$result) {
  die("Query failed: " . $conn->error);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Menu - QuickBite</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <section class="menu-section">
    <h2>Our Menu</h2>
    <div class="menu-items">
      <?php while($row = $result->fetch_assoc()): ?>
        <div class="menu-item">
          <img src="<?= htmlspecialchars($row['image']) ?>" alt="<?= htmlspecialchars($row['name']) ?>">
          
           <h3><?= htmlspecialchars($row['name']) ?></h3>
<p class="price">KSh <?= number_format($row['price'], 2) ?></p>

           <p><?= htmlspecialchars($row['description']) ?></p>

        </div>
      <?php endwhile; ?>
    </div>
  </section>
</body>
</html>
