<?php
/**
 * Cart integration for BOGO deals
 * Applies discounts to WooCommerce cart during checkout
 */

if (!defined('ABSPATH')) {
    exit;
}

class Mantle_BOGO_Cart {

    private static $instance = null;
    private static $calculated_discount = null;

    public static function get_instance() {
        if (self::$instance == null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Add negative fee to cart for BOGO discount (works for both traditional and Store API)
        add_action('woocommerce_cart_calculate_fees', array($this, 'apply_bogo_discount'), 20);

        // CRITICAL: Force cart fee calculation on every Store API request
        add_action('woocommerce_store_api_cart_update_customer_from_request', array($this, 'force_fee_calculation'), 5);
        add_action('woocommerce_store_api_cart_select_shipping_rate', array($this, 'force_fee_calculation'), 5);
        add_action('woocommerce_store_api_cart_apply_coupon', array($this, 'force_fee_calculation'), 5);
        add_action('woocommerce_store_api_cart_remove_coupon', array($this, 'force_fee_calculation'), 5);
        add_action('woocommerce_store_api_cart_update_item', array($this, 'force_fee_calculation'), 5);
        add_action('woocommerce_store_api_cart_remove_item', array($this, 'force_fee_calculation'), 5);
        add_action('woocommerce_store_api_cart_add_item', array($this, 'force_fee_calculation'), 5);

        // Hook into checkout process
        add_action('woocommerce_store_api_checkout_update_order_from_request', array($this, 'apply_discount_to_order'), 10, 2);
        add_action('woocommerce_checkout_order_created', array($this, 'apply_discount_after_order_created'), 5);

        // Force fees on REST API init for Store API
        add_action('rest_api_init', array($this, 'maybe_force_fee_on_rest'));
    }

    /**
     * Force fee calculation when REST API initializes (for Store API)
     */
    public function maybe_force_fee_on_rest() {
        // Check if this is a Store API request
        if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], '/wc/store/') !== false) {
            $this->force_fee_calculation();
        }
    }

    /**
     * Force fee calculation by triggering cart totals recalculation
     */
    public function force_fee_calculation() {
        if (function_exists('WC') && WC()->cart) {
            // Remove existing BOGO fees first to avoid duplicates
            $fees = WC()->cart->get_fees();
            foreach ($fees as $key => $fee) {
                if (strpos($fee->name, 'BOGO') !== false || strpos($fee->name, 'Holiday Discount') !== false) {
                    unset($fees[$key]);
                }
            }

            // Trigger recalculation
            WC()->cart->calculate_fees();
            WC()->cart->calculate_totals();
        }
    }

    /**
     * Calculate and apply BOGO discount as a negative fee
     */
    public function apply_bogo_discount($cart) {
        if (is_admin() && !defined('DOING_AJAX') && !defined('REST_REQUEST')) {
            return;
        }

        // Check if we already added a BOGO fee
        $fees = $cart->get_fees();
        foreach ($fees as $fee) {
            if (strpos($fee->name, 'BOGO') !== false || strpos($fee->name, 'Holiday Discount') !== false) {
                return; // Already applied
            }
        }

        // Get cart items in the format expected by the engine
        $cart_items = array();
        foreach ($cart->get_cart() as $cart_item) {
            $product_id = $cart_item['variation_id'] ? $cart_item['variation_id'] : $cart_item['product_id'];
            $cart_items[] = array(
                'product_id' => $product_id,
                'quantity' => $cart_item['quantity']
            );
        }

        if (empty($cart_items)) {
            return;
        }

        // Calculate discount using the BOGO engine
        $validation = Mantle_BOGO_Engine::validate_cart($cart_items);

        if (!empty($validation['total_discount']) && $validation['total_discount'] > 0) {
            $discount_amount = $validation['total_discount'];

            // Store for later use
            self::$calculated_discount = $validation;

            // Build discount label from deal names
            $deal_names = array();
            foreach ($validation['deals_applied'] as $deal) {
                $deal_names[] = $deal['deal_name'];
            }
            $label = !empty($deal_names) ? implode(', ', $deal_names) : 'Holiday Discount';

            // Apply as negative fee (discount)
            $cart->add_fee($label, -$discount_amount, false);
        }
    }

    /**
     * Apply discount to order during Store API checkout
     */
    public function apply_discount_to_order($order, $request) {
        // Get order items to calculate discount
        $cart_items = array();
        foreach ($order->get_items() as $item) {
            $product_id = $item->get_variation_id() ? $item->get_variation_id() : $item->get_product_id();
            $cart_items[] = array(
                'product_id' => $product_id,
                'quantity' => $item->get_quantity()
            );
        }

        if (empty($cart_items)) {
            return;
        }

        // Check if BOGO fee already exists
        foreach ($order->get_fees() as $fee) {
            if (strpos($fee->get_name(), 'BOGO') !== false || strpos($fee->get_name(), 'Holiday Discount') !== false) {
                return; // Already applied
            }
        }

        // Calculate discount
        $validation = Mantle_BOGO_Engine::validate_cart($cart_items);

        if (!empty($validation['total_discount']) && $validation['total_discount'] > 0) {
            $discount_amount = $validation['total_discount'];

            // Build discount label
            $deal_names = array();
            foreach ($validation['deals_applied'] as $deal) {
                $deal_names[] = $deal['deal_name'];
            }
            $label = !empty($deal_names) ? implode(', ', $deal_names) : 'Holiday Discount';

            // Add fee to order
            $fee = new WC_Order_Item_Fee();
            $fee->set_name($label);
            $fee->set_amount(-$discount_amount);
            $fee->set_total(-$discount_amount);
            $fee->set_tax_status('none');
            $order->add_item($fee);

            // Recalculate totals
            $order->calculate_totals();
        }
    }

    /**
     * Apply discount after order is created (fallback for Store API)
     */
    public function apply_discount_after_order_created($order) {
        // Get order items to calculate discount
        $cart_items = array();
        foreach ($order->get_items() as $item) {
            $product_id = $item->get_variation_id() ? $item->get_variation_id() : $item->get_product_id();
            $cart_items[] = array(
                'product_id' => $product_id,
                'quantity' => $item->get_quantity()
            );
        }

        if (empty($cart_items)) {
            return;
        }

        // Check if BOGO fee already exists
        foreach ($order->get_fees() as $fee) {
            if (strpos($fee->get_name(), 'BOGO') !== false || strpos($fee->get_name(), 'Holiday Discount') !== false) {
                return; // Already applied
            }
        }

        // Calculate discount
        $validation = Mantle_BOGO_Engine::validate_cart($cart_items);

        if (!empty($validation['total_discount']) && $validation['total_discount'] > 0) {
            $discount_amount = $validation['total_discount'];

            // Build discount label
            $deal_names = array();
            foreach ($validation['deals_applied'] as $deal) {
                $deal_names[] = $deal['deal_name'];
            }
            $label = !empty($deal_names) ? implode(', ', $deal_names) : 'Holiday Discount';

            // Add fee to order
            $fee = new WC_Order_Item_Fee();
            $fee->set_name($label);
            $fee->set_amount(-$discount_amount);
            $fee->set_total(-$discount_amount);
            $fee->set_tax_status('none');
            $order->add_item($fee);

            // Recalculate and save
            $order->calculate_totals();
            $order->save();
        }
    }

    /**
     * Hook into fee item creation
     */
    public function maybe_add_bogo_fee_to_order($item, $item_key, $fee, $order) {
        // This fires for each fee - we can use it to verify fees are being added
        return;
    }

    /**
     * Get the last calculated discount (for reference)
     */
    public static function get_calculated_discount() {
        return self::$calculated_discount;
    }
}
