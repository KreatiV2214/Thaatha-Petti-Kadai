<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database file path
$dbFile = 'database.json';

// Initialize database if it doesn't exist
function initDatabase($dbFile) {
    if (!file_exists($dbFile)) {
        $data = [
            'products' => [],
            'categories' => [],
            'cart' => []
        ];
        file_put_contents($dbFile, json_encode($data, JSON_PRETTY_PRINT));
        return $data;
    }
    return json_decode(file_get_contents($dbFile), true);
}

// Save database
function saveDatabase($dbFile, $data) {
    file_put_contents($dbFile, json_encode($data, JSON_PRETTY_PRINT));
}

// Get request data
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

// Initialize database
$db = initDatabase($dbFile);

try {
    switch ($action) {
        case 'get_products':
            echo json_encode(['success' => true, 'data' => $db['products']]);
            break;

        case 'get_categories':
            echo json_encode(['success' => true, 'data' => $db['categories']]);
            break;

        case 'get_cart':
            echo json_encode(['success' => true, 'data' => $db['cart']]);
            break;

        case 'add_product':
            $product = $input;
            $product['id'] = $product['id'] ?? time();
            $db['products'][] = $product;
            saveDatabase($dbFile, $db);
            echo json_encode(['success' => true, 'data' => $product]);
            break;

        case 'update_product':
            $product = $input;
            $found = false;
            foreach ($db['products'] as $key => $p) {
                if ($p['id'] == $product['id']) {
                    $db['products'][$key] = $product;
                    $found = true;
                    break;
                }
            }
            if ($found) {
                saveDatabase($dbFile, $db);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Product not found']);
            }
            break;

        case 'delete_product':
            $productId = $input['id'];
            $found = false;
            foreach ($db['products'] as $key => $p) {
                if ($p['id'] == $productId) {
                    unset($db['products'][$key]);
                    $found = true;
                    break;
                }
            }
            if ($found) {
                $db['products'] = array_values($db['products']);
                saveDatabase($dbFile, $db);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Product not found']);
            }
            break;

        case 'add_category':
            $category = $input;
            $category['id'] = $category['id'] ?? time();
            $db['categories'][] = $category;
            saveDatabase($dbFile, $db);
            echo json_encode(['success' => true, 'data' => $category]);
            break;

        case 'update_category':
            $category = $input;
            $found = false;
            foreach ($db['categories'] as $key => $c) {
                if ($c['id'] == $category['id']) {
                    $db['categories'][$key] = $category;
                    $found = true;
                    break;
                }
            }
            if ($found) {
                saveDatabase($dbFile, $db);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Category not found']);
            }
            break;

        case 'delete_category':
            $categoryId = $input['id'];
            $found = false;
            foreach ($db['categories'] as $key => $c) {
                if ($c['id'] == $categoryId) {
                    unset($db['categories'][$key]);
                    $found = true;
                    break;
                }
            }
            if ($found) {
                $db['categories'] = array_values($db['categories']);
                saveDatabase($dbFile, $db);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Category not found']);
            }
            break;

        case 'add_to_cart':
            $cartItem = $input;
            $cartItem['id'] = $cartItem['id'] ?? time();
            $db['cart'][] = $cartItem;
            saveDatabase($dbFile, $db);
            echo json_encode(['success' => true, 'data' => $cartItem]);
            break;

        case 'update_cart_item':
            $cartItem = $input;
            $found = false;
            foreach ($db['cart'] as $key => $c) {
                if ($c['id'] == $cartItem['id']) {
                    $db['cart'][$key] = $cartItem;
                    $found = true;
                    break;
                }
            }
            if ($found) {
                saveDatabase($dbFile, $db);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Cart item not found']);
            }
            break;

        case 'delete_cart_item':
            $cartItemId = $input['id'];
            $found = false;
            foreach ($db['cart'] as $key => $c) {
                if ($c['id'] == $cartItemId) {
                    unset($db['cart'][$key]);
                    $found = true;
                    break;
                }
            }
            if ($found) {
                $db['cart'] = array_values($db['cart']);
                saveDatabase($dbFile, $db);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Cart item not found']);
            }
            break;

        case 'clear_cart':
            $db['cart'] = [];
            saveDatabase($dbFile, $db);
            echo json_encode(['success' => true]);
            break;

        case 'get_all':
            echo json_encode(['success' => true, 'data' => $db]);
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
