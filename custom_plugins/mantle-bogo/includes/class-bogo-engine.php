<?php
/**
 * BOGO calculation engine
 */

if (!defined('ABSPATH')) {
    exit;
}

class Mantle_BOGO_Engine {

    /**
     * Get category IDs for a product, including parent product for variations
     */
    private static function get_product_category_ids($product) {
        $category_ids = $product->get_category_ids();

        // If no categories and this is a variation, get parent product's categories
        if (empty($category_ids) && $product->is_type('variation')) {
            $parent_id = $product->get_parent_id();
            if ($parent_id) {
                $parent_product = wc_get_product($parent_id);
                if ($parent_product) {
                    $category_ids = $parent_product->get_category_ids();
                }
            }
        }

        return $category_ids;
    }

    /**
     * Get tag IDs for a product, including parent product for variations
     */
    private static function get_product_tag_ids($product) {
        $tag_ids = $product->get_tag_ids();

        // If no tags and this is a variation, get parent product's tags
        if (empty($tag_ids) && $product->is_type('variation')) {
            $parent_id = $product->get_parent_id();
            if ($parent_id) {
                $parent_product = wc_get_product($parent_id);
                if ($parent_product) {
                    $tag_ids = $parent_product->get_tag_ids();
                }
            }
        }

        return $tag_ids;
    }

    /**
     * Check if a product matches the deal's buy criteria (categories OR tags)
     */
    private static function product_matches_buy_criteria($product, $deal) {
        $category_ids = self::get_product_category_ids($product);
        $tag_ids = self::get_product_tag_ids($product);

        // Check categories
        if (!empty($deal['buy_category_ids'])) {
            $buy_cat_ids = array_map('intval', $deal['buy_category_ids']);
            foreach ($category_ids as $cat_id) {
                if (in_array(intval($cat_id), $buy_cat_ids, true)) {
                    return true;
                }
            }
        }

        // Check tags/collections
        if (!empty($deal['buy_tag_ids'])) {
            $buy_tag_ids = array_map('intval', $deal['buy_tag_ids']);
            foreach ($tag_ids as $tag_id) {
                if (in_array(intval($tag_id), $buy_tag_ids, true)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if a product matches the deal's get criteria (categories OR tags)
     */
    private static function product_matches_get_criteria($product, $deal) {
        $category_ids = self::get_product_category_ids($product);
        $tag_ids = self::get_product_tag_ids($product);

        // Check categories
        if (!empty($deal['get_category_ids'])) {
            $get_cat_ids = array_map('intval', $deal['get_category_ids']);
            foreach ($category_ids as $cat_id) {
                if (in_array(intval($cat_id), $get_cat_ids, true)) {
                    return true;
                }
            }
        }

        // Check tags/collections
        if (!empty($deal['get_tag_ids'])) {
            $get_tag_ids = array_map('intval', $deal['get_tag_ids']);
            foreach ($tag_ids as $tag_id) {
                if (in_array(intval($tag_id), $get_tag_ids, true)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Validate cart and calculate BOGO discounts
     */
    public static function validate_cart($cart_items) {
        $active_deals = Mantle_BOGO_Database::get_active_deals();
        
        $result = array(
            'valid' => true,
            'deals_applied' => array(),
            'total_discount' => 0,
            'messages' => array()
        );
        
        if (empty($active_deals)) {
            return $result;
        }
        
        foreach ($active_deals as $deal) {
            $applied = self::apply_deal($deal, $cart_items);
            
            if ($applied) {
                $result['deals_applied'][] = $applied;
                $result['total_discount'] += $applied['discount_amount'];
                $result['messages'][] = $applied['message'];
            }
        }
        
        return $result;
    }
    
    /**
     * Apply a single deal to cart items
     */
    private static function apply_deal($deal, $cart_items) {
        switch ($deal['deal_type']) {
            case 'same_category':
                return self::apply_same_category_bogo($deal, $cart_items);
            
            case 'cross_product':
                return self::apply_cross_product_bogo($deal, $cart_items);
            
            case 'sitewide':
                return self::apply_sitewide_discount($deal, $cart_items);
            
            default:
                return null;
        }
    }
    
    /**
     * Same category BOGO: Buy X from category, get Y from same category discounted
     */
    private static function apply_same_category_bogo($deal, $cart_items) {
        // Find qualifying items
        $qualifying_items = array();
        
        foreach ($cart_items as $item) {
            $product = wc_get_product($item['product_id']);
            if (!$product) continue;

            // Check if product matches buy criteria (categories OR tags)
            if (self::product_matches_buy_criteria($product, $deal)) {
                $qualifying_items[] = array(
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => floatval($product->get_price()),
                    'name' => $product->get_name()
                );
            }
        }

        if (empty($qualifying_items)) {
            return null;
        }
        
        // Calculate total qualifying quantity
        $total_qty = 0;
        foreach ($qualifying_items as $item) {
            $total_qty += $item['quantity'];
        }
        
        // Calculate how many free items they get
        $sets = floor($total_qty / ($deal['buy_quantity'] + $deal['get_quantity']));
        $discounted_qty = $sets * $deal['get_quantity'];
        
        if ($discounted_qty == 0) {
            return null;
        }
        
        // Sort by price (discount cheapest items)
        usort($qualifying_items, function($a, $b) {
            return $a['price'] <=> $b['price'];
        });
        
        // Calculate discount amount
        $discount_amount = self::calculate_discount_amount($qualifying_items, $discounted_qty, $deal['discount_percent']);
        
        return array(
            'deal_id' => $deal['id'],
            'deal_name' => $deal['deal_name'],
            'discount_amount' => $discount_amount,
            'message' => sprintf(
                '%s: Buy %d Get %d at %s%% off',
                $deal['deal_name'],
                $deal['buy_quantity'],
                $deal['get_quantity'],
                $deal['discount_percent']
            )
        );
    }
    
    /**
     * Cross product BOGO: Buy product/category X, get product/category Y discounted
     */
    private static function apply_cross_product_bogo($deal, $cart_items) {
        $buy_items = array();
        $get_items = array();
        
        foreach ($cart_items as $item) {
            $product = wc_get_product($item['product_id']);
            if (!$product) continue;

            // Check if this is a "buy" item (matches buy criteria OR specific product IDs)
            $is_buy_item = self::product_matches_buy_criteria($product, $deal);
            if (!$is_buy_item && !empty($deal['buy_product_ids'])) {
                $buy_product_ids = array_map('intval', $deal['buy_product_ids']);
                if (in_array(intval($item['product_id']), $buy_product_ids, true)) {
                    $is_buy_item = true;
                }
            }

            // Check if this is a "get" item (matches get criteria OR specific product IDs)
            $is_get_item = self::product_matches_get_criteria($product, $deal);
            if (!$is_get_item && !empty($deal['get_product_ids'])) {
                $get_product_ids = array_map('intval', $deal['get_product_ids']);
                if (in_array(intval($item['product_id']), $get_product_ids, true)) {
                    $is_get_item = true;
                }
            }

            $item_data = array(
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => floatval($product->get_price()),
                'name' => $product->get_name()
            );
            
            if ($is_buy_item) {
                $buy_items[] = $item_data;
            }
            if ($is_get_item) {
                $get_items[] = $item_data;
            }
        }
        
        // Check if they have required buy items
        $buy_qty = 0;
        foreach ($buy_items as $item) {
            $buy_qty += $item['quantity'];
        }
        
        if ($buy_qty < $deal['buy_quantity']) {
            return null;
        }
        
        // Check if they have get items to discount
        if (empty($get_items)) {
            return null;
        }
        
        // Calculate how many get items can be discounted
        $max_discounted_qty = floor($buy_qty / $deal['buy_quantity']) * $deal['get_quantity'];
        
        $get_qty = 0;
        foreach ($get_items as $item) {
            $get_qty += $item['quantity'];
        }
        
        $actual_discounted_qty = min($max_discounted_qty, $get_qty);
        
        if ($actual_discounted_qty == 0) {
            return null;
        }
        
        // Calculate discount
        $discount_amount = self::calculate_discount_amount($get_items, $actual_discounted_qty, $deal['discount_percent']);
        
        return array(
            'deal_id' => $deal['id'],
            'deal_name' => $deal['deal_name'],
            'discount_amount' => $discount_amount,
            'message' => sprintf(
                '%s: %s%% off qualifying items',
                $deal['deal_name'],
                $deal['discount_percent']
            )
        );
    }
    
    /**
     * Sitewide discount: Apply to all items
     */
    private static function apply_sitewide_discount($deal, $cart_items) {
        $total_discount = 0;
        
        foreach ($cart_items as $item) {
            $product = wc_get_product($item['product_id']);
            if (!$product) continue;
            
            $price = floatval($product->get_price());
            $item_discount = ($price * $item['quantity'] * $deal['discount_percent']) / 100;
            $total_discount += $item_discount;
        }
        
        if ($total_discount == 0) {
            return null;
        }
        
        return array(
            'deal_id' => $deal['id'],
            'deal_name' => $deal['deal_name'],
            'discount_amount' => $total_discount,
            'message' => sprintf(
                '%s: %s%% off everything',
                $deal['deal_name'],
                $deal['discount_percent']
            )
        );
    }
    
    /**
     * Calculate discount amount for given items
     */
    private static function calculate_discount_amount($items, $discounted_qty, $discount_percent) {
        $remaining_qty = $discounted_qty;
        $total_discount = 0;
        
        foreach ($items as $item) {
            if ($remaining_qty <= 0) break;
            
            $qty_to_discount = min($item['quantity'], $remaining_qty);
            $item_discount = ($item['price'] * $qty_to_discount * $discount_percent) / 100;
            
            $total_discount += $item_discount;
            $remaining_qty -= $qty_to_discount;
        }
        
        return round($total_discount, 2);
    }
}
