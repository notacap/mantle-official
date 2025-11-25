<?php
/**
 * Plugin Name: Mantle BOGO Deals
 * Plugin URI: https://mantle-clothing.com
 * Description: Custom BOGO and promotional deals for headless Next.js frontend
 * Version: 1.0.0
 * Author: Mantle Clothing
 * Text Domain: mantle-bogo
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define plugin constants
define('MANTLE_BOGO_VERSION', '1.0.0');
define('MANTLE_BOGO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MANTLE_BOGO_PLUGIN_URL', plugin_dir_url(__FILE__));

class Mantle_BOGO {

    private static $instance = null;

    public static function get_instance() {
        if (self::$instance == null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Create database table on activation
        register_activation_hook(__FILE__, array($this, 'activate'));

        // Load dependencies
        $this->load_dependencies();

        // Ensure database table exists (fallback for manual FTP uploads)
        add_action('init', array($this, 'maybe_create_table'));

        // Initialize admin interface
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        }

        // Initialize REST API
        add_action('rest_api_init', array($this, 'register_rest_routes'));

        // Add CORS headers for headless frontend
        add_action('rest_api_init', array($this, 'add_cors_headers'), 15);
    }

    /**
     * Add CORS headers for headless Next.js frontend
     */
    public function add_cors_headers() {
        // Only add headers for our custom endpoints
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
        add_filter('rest_pre_serve_request', function($value) {
            $origin = get_http_origin();

            // Allow requests from any origin for public BOGO endpoints
            // In production, you may want to restrict this to your specific domain
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            header('Access-Control-Allow-Credentials: true');

            return $value;
        });
    }
    
    private function load_dependencies() {
        require_once MANTLE_BOGO_PLUGIN_DIR . 'includes/class-bogo-database.php';
        require_once MANTLE_BOGO_PLUGIN_DIR . 'includes/class-bogo-engine.php';
        require_once MANTLE_BOGO_PLUGIN_DIR . 'includes/class-bogo-admin.php';
        require_once MANTLE_BOGO_PLUGIN_DIR . 'includes/class-bogo-rest-api.php';
        require_once MANTLE_BOGO_PLUGIN_DIR . 'includes/class-bogo-cart.php';

        // Initialize cart integration (applies discounts during checkout)
        Mantle_BOGO_Cart::get_instance();
    }
    
    public function activate() {
        Mantle_BOGO_Database::create_table();
    }

    /**
     * Ensure database table exists and is up to date
     */
    public function maybe_create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'mantle_bogo_deals';

        // Check if table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            Mantle_BOGO_Database::create_table();
        } else {
            // Table exists - ensure new columns are added (for upgrades)
            Mantle_BOGO_Database::maybe_add_tag_columns();
        }
    }
    
    public function add_admin_menu() {
        add_submenu_page(
            'woocommerce',
            'BOGO Deals',
            'BOGO Deals',
            'manage_woocommerce',
            'mantle-bogo-deals',
            array('Mantle_BOGO_Admin', 'render_admin_page')
        );
    }
    
    public function enqueue_admin_assets($hook) {
        if ($hook !== 'woocommerce_page_mantle-bogo-deals') {
            return;
        }
        
        wp_enqueue_style(
            'mantle-bogo-admin',
            MANTLE_BOGO_PLUGIN_URL . 'assets/admin.css',
            array(),
            MANTLE_BOGO_VERSION
        );
    }
    
    public function register_rest_routes() {
        Mantle_BOGO_REST_API::register_routes();
    }
}

// Initialize plugin
function mantle_bogo_init() {
    return Mantle_BOGO::get_instance();
}

add_action('plugins_loaded', 'mantle_bogo_init');
