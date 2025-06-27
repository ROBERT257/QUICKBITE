<?php
// Connect to database
$conn = new mysqli("localhost", "root", "", "quickbite_db");
if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

// Fetch orders
$result = $conn->query("SELECT * FROM orders ORDER BY id DESC");
?>
<!DOCTYPE html>
<html>
<head>
    <title>Elizabeth Food - Admin Dashboard</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f0c040; color: #000; }
    </style>
</head>
<body>
    <h2>📋 Incoming Orders</h2>
    <?php if ($result->num_rows > 0): ?>
    <table>
        <tr>
            <th>ID</th>
            <th>Food Item</th>
            <th>Qty</th>
            <th>Instructions</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Payment</th>
            <th>Ordered At</th>
        </tr>
        <?php while($row = $result->fetch_assoc()): ?>
        <tr>
            <td><?= $row['id'] ?></td>
            <td><?= $row['food_item'] ?></td>
            <td><?= $row['quantity'] ?></td>
            <td><?= $row['instructions'] ?></td>
            <td><?= $row['address'] ?></td>
            <td><?= $row['phone'] ?></td>
            <td><?= $row['payment_option'] ?></td>
            <td><?= $row['created_at'] ?? '' ?></td>
        </tr>
        <?php endwhile; ?>
    </table>
    <?php else: ?>
        <p>No orders yet.</p>
    <?php endif; ?>
</body>
</html>
<?php $conn->close(); ?>
