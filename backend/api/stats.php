<?php
/**
 * API Endpoint para Estatísticas de Eventos
 * 
 * Endpoint: GET /backend/api/stats.php
 * 
 * Query Parameters:
 * - start_date: YYYY-MM-DD (opcional)
 * - end_date: YYYY-MM-DD (opcional)
 * - event_type: tipo de evento (opcional)
 * - event_name: nome do evento (opcional)
 * - group_by: 'day', 'hour', 'type', 'name' (opcional)
 * - api_key: chave de API (obrigatório)
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: X-API-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

require_once __DIR__ . '/../config/database.php';

/**
 * Valida API Key
 */
function validateApiKey($apiKey, $db) {
    $stmt = $db->prepare("SELECT id FROM api_keys WHERE api_key = ? AND active = 1");
    $stmt->execute([$apiKey]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

try {
    $apiKey = $_GET['api_key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? '';
    
    if (empty($apiKey)) {
        throw new Exception('API key não fornecida');
    }
    
    $apiKeyInfo = validateApiKey($apiKey, $db);
    if (!$apiKeyInfo) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'API key inválida']);
        exit;
    }
    
    // Parâmetros de filtro
    $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
    $endDate = $_GET['end_date'] ?? date('Y-m-d');
    $eventType = $_GET['event_type'] ?? null;
    $eventName = $_GET['event_name'] ?? null;
    $groupBy = $_GET['group_by'] ?? 'day';
    
    // Query base
    $where = ["created_at BETWEEN ? AND ?"];
    $params = [$startDate . ' 00:00:00', $endDate . ' 23:59:59'];
    
    if ($eventType) {
        $where[] = "event_type = ?";
        $params[] = $eventType;
    }
    
    if ($eventName) {
        $where[] = "event_name = ?";
        $params[] = $eventName;
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Total de eventos
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM events WHERE $whereClause");
    $stmt->execute($params);
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Por tipo
    $stmt = $db->prepare("
        SELECT event_type, COUNT(*) as count 
        FROM events 
        WHERE $whereClause
        GROUP BY event_type
        ORDER BY count DESC
    ");
    $stmt->execute($params);
    $byType = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $byType[$row['event_type']] = (int)$row['count'];
    }
    
    // Por nome
    $stmt = $db->prepare("
        SELECT event_name, COUNT(*) as count 
        FROM events 
        WHERE $whereClause
        GROUP BY event_name
        ORDER BY count DESC
        LIMIT 10
    ");
    $stmt->execute($params);
    $byName = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $byName[$row['event_name']] = (int)$row['count'];
    }
    
    // Por data (agrupado)
    $dateFormat = $groupBy === 'hour' ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d';
    $stmt = $db->prepare("
        SELECT DATE_FORMAT(created_at, ?) as date, COUNT(*) as count
        FROM events
        WHERE $whereClause
        GROUP BY DATE_FORMAT(created_at, ?)
        ORDER BY date ASC
    ");
    $stmt->execute([$dateFormat, ...$params, $dateFormat]);
    $byDate = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $byDate[] = [
            'date' => $row['date'],
            'count' => (int)$row['count'],
        ];
    }
    
    // Top eventos
    $stmt = $db->prepare("
        SELECT event_name, COUNT(*) as count
        FROM events
        WHERE $whereClause
        GROUP BY event_name
        ORDER BY count DESC
        LIMIT 5
    ");
    $stmt->execute($params);
    $topEvents = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $topEvents[] = [
            'name' => $row['event_name'],
            'count' => (int)$row['count'],
        ];
    }
    
    echo json_encode([
        'success' => true,
        'total_events' => (int)$total,
        'by_type' => $byType,
        'by_name' => $byName,
        'by_date' => $byDate,
        'top_events' => $topEvents,
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
}

