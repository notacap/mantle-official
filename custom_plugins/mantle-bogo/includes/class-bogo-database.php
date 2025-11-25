<?php
/**
 * Database handler for BOGO deals
 */

if (!defined('ABSPATH')) {
    exit;
}

class Mantle_BOGO_Database {
    
    private static $table_name = 'mantle_bogo_deals';
    
    /**
     * Create database table for BOGO deals
     */
    public static function create_table() {
        global $wpdb;

        $table_name = $wpdb->prefix . self::$table_name;
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            deal_name varchar(255) NOT NULL,
            deal_type varchar(50) NOT NULL,
            start_date datetime NOT NULL,
            end_date datetime NOT NULL,
            buy_category_ids text,
            buy_product_ids text,
            buy_tag_ids text,
            get_category_ids text,
            get_product_ids text,
            get_tag_ids text,
            buy_quantity int(11) DEFAULT 1,
            get_quantity int(11) DEFAULT 1,
            discount_percent decimal(5,2) NOT NULL,
            active tinyint(1) DEFAULT 1,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY active (active),
            KEY date_range (start_date, end_date)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        // Ensure new columns exist (for upgrades from older versions)
        self::maybe_add_tag_columns();
    }

    /**
     * Add tag columns if they don't exist (for upgrades)
     */
    public static function maybe_add_tag_columns() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;

        // Check if buy_tag_ids column exists
        $column_exists = $wpdb->get_results("SHOW COLUMNS FROM $table_name LIKE 'buy_tag_ids'");
        if (empty($column_exists)) {
            $wpdb->query("ALTER TABLE $table_name ADD COLUMN buy_tag_ids text AFTER buy_product_ids");
        }

        // Check if get_tag_ids column exists
        $column_exists = $wpdb->get_results("SHOW COLUMNS FROM $table_name LIKE 'get_tag_ids'");
        if (empty($column_exists)) {
            $wpdb->query("ALTER TABLE $table_name ADD COLUMN get_tag_ids text AFTER get_product_ids");
        }
    }
    
    /**
     * Get all active deals for current date
     */
    public static function get_active_deals() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::$table_name;
        $current_date = current_time('mysql');
        
        $deals = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name 
            WHERE active = 1 
            AND start_date <= %s 
            AND end_date >= %s
            ORDER BY start_date ASC",
            $current_date,
            $current_date
        ), ARRAY_A);
        
        // Parse JSON fields
        foreach ($deals as &$deal) {
            $deal['buy_category_ids'] = $deal['buy_category_ids'] ? json_decode($deal['buy_category_ids'], true) : array();
            $deal['buy_product_ids'] = $deal['buy_product_ids'] ? json_decode($deal['buy_product_ids'], true) : array();
            $deal['buy_tag_ids'] = $deal['buy_tag_ids'] ? json_decode($deal['buy_tag_ids'], true) : array();
            $deal['get_category_ids'] = $deal['get_category_ids'] ? json_decode($deal['get_category_ids'], true) : array();
            $deal['get_product_ids'] = $deal['get_product_ids'] ? json_decode($deal['get_product_ids'], true) : array();
            $deal['get_tag_ids'] = $deal['get_tag_ids'] ? json_decode($deal['get_tag_ids'], true) : array();
        }

        return $deals;
    }

    /**
     * Get all deals (for admin list)
     */
    public static function get_all_deals() {
        global $wpdb;

        $table_name = $wpdb->prefix . self::$table_name;

        $deals = $wpdb->get_results(
            "SELECT * FROM $table_name ORDER BY start_date DESC",
            ARRAY_A
        );

        foreach ($deals as &$deal) {
            $deal['buy_category_ids'] = $deal['buy_category_ids'] ? json_decode($deal['buy_category_ids'], true) : array();
            $deal['buy_product_ids'] = $deal['buy_product_ids'] ? json_decode($deal['buy_product_ids'], true) : array();
            $deal['buy_tag_ids'] = $deal['buy_tag_ids'] ? json_decode($deal['buy_tag_ids'], true) : array();
            $deal['get_category_ids'] = $deal['get_category_ids'] ? json_decode($deal['get_category_ids'], true) : array();
            $deal['get_product_ids'] = $deal['get_product_ids'] ? json_decode($deal['get_product_ids'], true) : array();
            $deal['get_tag_ids'] = $deal['get_tag_ids'] ? json_decode($deal['get_tag_ids'], true) : array();
        }

        return $deals;
    }
    
    /**
     * Get single deal by ID
     */
    public static function get_deal($id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::$table_name;
        
        $deal = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d",
            $id
        ), ARRAY_A);
        
        if ($deal) {
            $deal['buy_category_ids'] = $deal['buy_category_ids'] ? json_decode($deal['buy_category_ids'], true) : array();
            $deal['buy_product_ids'] = $deal['buy_product_ids'] ? json_decode($deal['buy_product_ids'], true) : array();
            $deal['buy_tag_ids'] = $deal['buy_tag_ids'] ? json_decode($deal['buy_tag_ids'], true) : array();
            $deal['get_category_ids'] = $deal['get_category_ids'] ? json_decode($deal['get_category_ids'], true) : array();
            $deal['get_product_ids'] = $deal['get_product_ids'] ? json_decode($deal['get_product_ids'], true) : array();
            $deal['get_tag_ids'] = $deal['get_tag_ids'] ? json_decode($deal['get_tag_ids'], true) : array();
        }

        return $deal;
    }
    
    /**
     * Insert new deal
     */
    public static function insert_deal($data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::$table_name;
        
        // Encode arrays as JSON
        $insert_data = array(
            'deal_name' => sanitize_text_field($data['deal_name']),
            'deal_type' => sanitize_text_field($data['deal_type']),
            'start_date' => sanitize_text_field($data['start_date']),
            'end_date' => sanitize_text_field($data['end_date']),
            'buy_category_ids' => !empty($data['buy_category_ids']) ? json_encode(array_map('intval', $data['buy_category_ids'])) : null,
            'buy_product_ids' => !empty($data['buy_product_ids']) ? json_encode(array_map('intval', $data['buy_product_ids'])) : null,
            'buy_tag_ids' => !empty($data['buy_tag_ids']) ? json_encode(array_map('intval', $data['buy_tag_ids'])) : null,
            'get_category_ids' => !empty($data['get_category_ids']) ? json_encode(array_map('intval', $data['get_category_ids'])) : null,
            'get_product_ids' => !empty($data['get_product_ids']) ? json_encode(array_map('intval', $data['get_product_ids'])) : null,
            'get_tag_ids' => !empty($data['get_tag_ids']) ? json_encode(array_map('intval', $data['get_tag_ids'])) : null,
            'buy_quantity' => intval($data['buy_quantity']),
            'get_quantity' => intval($data['get_quantity']),
            'discount_percent' => floatval($data['discount_percent']),
            'active' => isset($data['active']) ? intval($data['active']) : 1
        );
        
        $result = $wpdb->insert($table_name, $insert_data);

        // Debug: Log any database errors
        if ($result === false) {
            error_log('Mantle BOGO - Insert failed: ' . $wpdb->last_error);
            error_log('Mantle BOGO - Insert data: ' . print_r($insert_data, true));
        }

        return $wpdb->insert_id;
    }
    
    /**
     * Update existing deal
     */
    public static function update_deal($id, $data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::$table_name;
        
        $update_data = array(
            'deal_name' => sanitize_text_field($data['deal_name']),
            'deal_type' => sanitize_text_field($data['deal_type']),
            'start_date' => sanitize_text_field($data['start_date']),
            'end_date' => sanitize_text_field($data['end_date']),
            'buy_category_ids' => !empty($data['buy_category_ids']) ? json_encode(array_map('intval', $data['buy_category_ids'])) : null,
            'buy_product_ids' => !empty($data['buy_product_ids']) ? json_encode(array_map('intval', $data['buy_product_ids'])) : null,
            'buy_tag_ids' => !empty($data['buy_tag_ids']) ? json_encode(array_map('intval', $data['buy_tag_ids'])) : null,
            'get_category_ids' => !empty($data['get_category_ids']) ? json_encode(array_map('intval', $data['get_category_ids'])) : null,
            'get_product_ids' => !empty($data['get_product_ids']) ? json_encode(array_map('intval', $data['get_product_ids'])) : null,
            'get_tag_ids' => !empty($data['get_tag_ids']) ? json_encode(array_map('intval', $data['get_tag_ids'])) : null,
            'buy_quantity' => intval($data['buy_quantity']),
            'get_quantity' => intval($data['get_quantity']),
            'discount_percent' => floatval($data['discount_percent']),
            'active' => isset($data['active']) ? intval($data['active']) : 1
        );
        
        return $wpdb->update(
            $table_name,
            $update_data,
            array('id' => $id)
        );
    }
    
    /**
     * Delete deal
     */
    public static function delete_deal($id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::$table_name;
        
        return $wpdb->delete($table_name, array('id' => $id));
    }
    
    /**
     * Toggle deal active status
     */
    public static function toggle_active($id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::$table_name;
        
        $current = $wpdb->get_var($wpdb->prepare(
            "SELECT active FROM $table_name WHERE id = %d",
            $id
        ));
        
        $new_status = $current ? 0 : 1;
        
        return $wpdb->update(
            $table_name,
            array('active' => $new_status),
            array('id' => $id)
        );
    }
}
