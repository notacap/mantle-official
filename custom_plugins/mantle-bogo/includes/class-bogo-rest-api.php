<?php
/**
 * REST API endpoints for BOGO functionality
 *
 * Endpoints:
 * - POST /wp-json/mantle/v1/validate-cart - Validate cart items and calculate discounts
 * - GET /wp-json/mantle/v1/active-deals - Get currently active deals
 */

if (!defined('ABSPATH')) {
    exit;
}

class Mantle_BOGO_REST_API {

    /**
     * Register REST API routes
     */
    public static function register_routes() {
        // Validate cart endpoint
        register_rest_route('mantle/v1', '/validate-cart', array(
            array(
                'methods' => 'POST',
                'callback' => array(__CLASS__, 'validate_cart'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'items' => array(
                        'required' => true,
                        'type' => 'array',
                        'description' => 'Array of cart items with product_id and quantity'
                    )
                )
            ),
            // Handle CORS preflight
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_true',
                'permission_callback' => '__return_true'
            )
        ));

        // Get active deals endpoint
        register_rest_route('mantle/v1', '/active-deals', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_active_deals'),
            'permission_callback' => '__return_true'
        ));
    }
    
    /**
     * Validate cart and return applicable discounts
     */
    public static function validate_cart($request) {
        $cart_items = $request->get_param('items');
        
        if (empty($cart_items)) {
            return new WP_Error(
                'empty_cart',
                'Cart is empty',
                array('status' => 400)
            );
        }
        
        // Validate cart items structure
        foreach ($cart_items as $item) {
            if (!isset($item['product_id']) || !isset($item['quantity'])) {
                return new WP_Error(
                    'invalid_cart_item',
                    'Cart items must have product_id and quantity',
                    array('status' => 400)
                );
            }
        }
        
        // Calculate discounts
        $validation_result = Mantle_BOGO_Engine::validate_cart($cart_items);
        
        // Calculate cart totals
        $subtotal = 0;
        foreach ($cart_items as $item) {
            $product = wc_get_product($item['product_id']);
            if ($product) {
                $subtotal += floatval($product->get_price()) * $item['quantity'];
            }
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'validation' => $validation_result,
            'cart_summary' => array(
                'subtotal' => round($subtotal, 2),
                'discount' => round($validation_result['total_discount'], 2),
                'total' => round($subtotal - $validation_result['total_discount'], 2)
            )
        ));
    }
    
    /**
     * Get currently active deals
     */
    public static function get_active_deals($request) {
        $deals = Mantle_BOGO_Database::get_active_deals();
        
        // Format deals for frontend
        $formatted_deals = array();
        foreach ($deals as $deal) {
            $formatted_deals[] = array(
                'id' => $deal['id'],
                'name' => $deal['deal_name'],
                'type' => $deal['deal_type'],
                'discount_percent' => floatval($deal['discount_percent']),
                'start_date' => $deal['start_date'],
                'end_date' => $deal['end_date'],
                'description' => self::get_deal_description($deal)
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'deals' => $formatted_deals
        ));
    }
    
    /**
     * Generate human-readable deal description
     */
    private static function get_deal_description($deal) {
        switch ($deal['deal_type']) {
            case 'same_category':
                return sprintf(
                    'Buy %d Get %d at %s%% off',
                    $deal['buy_quantity'],
                    $deal['get_quantity'],
                    $deal['discount_percent']
                );
            
            case 'cross_product':
                return sprintf(
                    'Buy qualifying items, get %s%% off select products',
                    $deal['discount_percent']
                );
            
            case 'sitewide':
                return sprintf(
                    '%s%% off everything',
                    $deal['discount_percent']
                );
            
            default:
                return '';
        }
    }
}
