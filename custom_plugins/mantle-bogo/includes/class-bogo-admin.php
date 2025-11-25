<?php
/**
 * Admin interface for managing BOGO deals
 */

if (!defined('ABSPATH')) {
    exit;
}

class Mantle_BOGO_Admin {
    
    /**
     * Render admin page
     */
    public static function render_admin_page() {
        // Handle form submissions
        if (isset($_POST['mantle_bogo_action'])) {
            check_admin_referer('mantle_bogo_action');
            self::handle_form_submission();
        }
        
        // Handle delete
        if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
            check_admin_referer('delete_deal_' . $_GET['id']);
            Mantle_BOGO_Database::delete_deal($_GET['id']);
            echo '<div class="notice notice-success"><p>Deal deleted successfully!</p></div>';
        }
        
        // Handle toggle active
        if (isset($_GET['action']) && $_GET['action'] === 'toggle' && isset($_GET['id'])) {
            check_admin_referer('toggle_deal_' . $_GET['id']);
            Mantle_BOGO_Database::toggle_active($_GET['id']);
            echo '<div class="notice notice-success"><p>Deal status updated!</p></div>';
        }
        
        // Determine which view to show
        if (isset($_GET['view']) && $_GET['view'] === 'add') {
            self::render_add_form();
        } elseif (isset($_GET['view']) && $_GET['view'] === 'edit' && isset($_GET['id'])) {
            self::render_edit_form($_GET['id']);
        } else {
            self::render_deals_list();
        }
    }
    
    /**
     * Handle form submission
     */
    private static function handle_form_submission() {
        $action = sanitize_text_field($_POST['mantle_bogo_action']);
        
        $data = array(
            'deal_name' => sanitize_text_field($_POST['deal_name']),
            'deal_type' => sanitize_text_field($_POST['deal_type']),
            'start_date' => sanitize_text_field($_POST['start_date']),
            'end_date' => sanitize_text_field($_POST['end_date']),
            'buy_category_ids' => isset($_POST['buy_category_ids']) ? $_POST['buy_category_ids'] : array(),
            'buy_tag_ids' => isset($_POST['buy_tag_ids']) ? $_POST['buy_tag_ids'] : array(),
            'get_category_ids' => isset($_POST['get_category_ids']) ? $_POST['get_category_ids'] : array(),
            'get_tag_ids' => isset($_POST['get_tag_ids']) ? $_POST['get_tag_ids'] : array(),
            'buy_quantity' => intval($_POST['buy_quantity']),
            'get_quantity' => intval($_POST['get_quantity']),
            'discount_percent' => floatval($_POST['discount_percent']),
            'active' => isset($_POST['active']) ? 1 : 0
        );
        
        if ($action === 'add') {
            $insert_id = Mantle_BOGO_Database::insert_deal($data);
            if ($insert_id) {
                echo '<div class="notice notice-success"><p>Deal added successfully! (ID: ' . $insert_id . ')</p></div>';
            } else {
                global $wpdb;
                echo '<div class="notice notice-error"><p>Failed to add deal. Database error: ' . esc_html($wpdb->last_error) . '</p></div>';
            }
        } elseif ($action === 'edit') {
            $id = intval($_POST['deal_id']);
            $result = Mantle_BOGO_Database::update_deal($id, $data);
            if ($result !== false) {
                echo '<div class="notice notice-success"><p>Deal updated successfully!</p></div>';
            } else {
                global $wpdb;
                echo '<div class="notice notice-error"><p>Failed to update deal. Database error: ' . esc_html($wpdb->last_error) . '</p></div>';
            }
        }
    }
    
    /**
     * Render deals list
     */
    private static function render_deals_list() {
        $deals = Mantle_BOGO_Database::get_all_deals();
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline">BOGO Deals</h1>
            <a href="<?php echo admin_url('admin.php?page=mantle-bogo-deals&view=add'); ?>" class="page-title-action">Add New Deal</a>
            <hr class="wp-header-end">
            
            <?php if (empty($deals)): ?>
                <p>No deals found. <a href="<?php echo admin_url('admin.php?page=mantle-bogo-deals&view=add'); ?>">Add your first deal</a></p>
            <?php else: ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Deal Name</th>
                            <th>Type</th>
                            <th>Discount</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($deals as $deal): ?>
                            <tr>
                                <td><strong><?php echo esc_html($deal['deal_name']); ?></strong></td>
                                <td><?php echo esc_html(ucwords(str_replace('_', ' ', $deal['deal_type']))); ?></td>
                                <td><?php echo esc_html($deal['discount_percent']); ?>%</td>
                                <td><?php echo date('M j, Y', strtotime($deal['start_date'])); ?></td>
                                <td><?php echo date('M j, Y', strtotime($deal['end_date'])); ?></td>
                                <td>
                                    <?php if ($deal['active']): ?>
                                        <span style="color: green;">● Active</span>
                                    <?php else: ?>
                                        <span style="color: gray;">○ Inactive</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <a href="<?php echo admin_url('admin.php?page=mantle-bogo-deals&view=edit&id=' . $deal['id']); ?>">Edit</a> |
                                    <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=mantle-bogo-deals&action=toggle&id=' . $deal['id']), 'toggle_deal_' . $deal['id']); ?>">
                                        <?php echo $deal['active'] ? 'Deactivate' : 'Activate'; ?>
                                    </a> |
                                    <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=mantle-bogo-deals&action=delete&id=' . $deal['id']), 'delete_deal_' . $deal['id']); ?>" 
                                       onclick="return confirm('Are you sure you want to delete this deal?');">Delete</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
        <?php
    }
    
    /**
     * Render add deal form
     */
    private static function render_add_form() {
        self::render_deal_form('add', null);
    }
    
    /**
     * Render edit deal form
     */
    private static function render_edit_form($id) {
        $deal = Mantle_BOGO_Database::get_deal($id);
        if (!$deal) {
            echo '<div class="notice notice-error"><p>Deal not found.</p></div>';
            return;
        }
        self::render_deal_form('edit', $deal);
    }
    
    /**
     * Render deal form (add or edit)
     */
    private static function render_deal_form($action, $deal) {
        $is_edit = $action === 'edit';
        $form_title = $is_edit ? 'Edit Deal' : 'Add New Deal';
        
        // Get WooCommerce categories
        $categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false
        ));

        // Get WooCommerce tags (collections)
        $tags = get_terms(array(
            'taxonomy' => 'product_tag',
            'hide_empty' => false
        ));
        ?>
        <div class="wrap">
            <h1><?php echo $form_title; ?></h1>
            <a href="<?php echo admin_url('admin.php?page=mantle-bogo-deals'); ?>">&larr; Back to deals</a>
            
            <form method="post" style="max-width: 800px; margin-top: 20px;">
                <?php wp_nonce_field('mantle_bogo_action'); ?>
                <input type="hidden" name="mantle_bogo_action" value="<?php echo $action; ?>">
                <?php if ($is_edit): ?>
                    <input type="hidden" name="deal_id" value="<?php echo $deal['id']; ?>">
                <?php endif; ?>
                
                <table class="form-table">
                    <tr>
                        <th><label for="deal_name">Deal Name *</label></th>
                        <td>
                            <input type="text" id="deal_name" name="deal_name" class="regular-text" 
                                   value="<?php echo $is_edit ? esc_attr($deal['deal_name']) : ''; ?>" required>
                            <p class="description">e.g., "Rain Gear BOGO"</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th><label for="deal_type">Deal Type *</label></th>
                        <td>
                            <select id="deal_type" name="deal_type" required onchange="toggleDealTypeFields(this.value)">
                                <option value="same_category" <?php echo ($is_edit && $deal['deal_type'] === 'same_category') ? 'selected' : ''; ?>>
                                    Same Category BOGO
                                </option>
                                <option value="cross_product" <?php echo ($is_edit && $deal['deal_type'] === 'cross_product') ? 'selected' : ''; ?>>
                                    Cross Product Deal
                                </option>
                                <option value="sitewide" <?php echo ($is_edit && $deal['deal_type'] === 'sitewide') ? 'selected' : ''; ?>>
                                    Sitewide Discount
                                </option>
                            </select>
                            <p class="description">
                                <strong>Same Category:</strong> Buy X from category, get Y from same category discounted<br>
                                <strong>Cross Product:</strong> Buy from category A, get discount on category B<br>
                                <strong>Sitewide:</strong> Discount on all products
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th><label>Date Range *</label></th>
                        <td>
                            <input type="datetime-local" name="start_date" 
                                   value="<?php echo $is_edit ? date('Y-m-d\TH:i', strtotime($deal['start_date'])) : ''; ?>" required>
                            to
                            <input type="datetime-local" name="end_date" 
                                   value="<?php echo $is_edit ? date('Y-m-d\TH:i', strtotime($deal['end_date'])) : ''; ?>" required>
                        </td>
                    </tr>
                    
                    <tr id="buy_categories_row">
                        <th><label for="buy_category_ids">Buy Categories</label></th>
                        <td>
                            <select id="buy_category_ids" name="buy_category_ids[]" multiple size="6" style="width: 300px;">
                                <?php foreach ($categories as $cat): ?>
                                    <option value="<?php echo $cat->term_id; ?>"
                                            <?php echo ($is_edit && in_array($cat->term_id, $deal['buy_category_ids'])) ? 'selected' : ''; ?>>
                                        <?php echo esc_html($cat->name); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <p class="description">Hold Ctrl/Cmd to select multiple. Categories customer must buy from.</p>
                        </td>
                    </tr>

                    <tr id="buy_collections_row">
                        <th><label for="buy_tag_ids">Buy Collections</label></th>
                        <td>
                            <select id="buy_tag_ids" name="buy_tag_ids[]" multiple size="6" style="width: 300px;">
                                <?php foreach ($tags as $tag): ?>
                                    <option value="<?php echo $tag->term_id; ?>"
                                            <?php echo ($is_edit && !empty($deal['buy_tag_ids']) && in_array($tag->term_id, $deal['buy_tag_ids'])) ? 'selected' : ''; ?>>
                                        <?php echo esc_html($tag->name); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <p class="description">Collections (tags) customer must buy from. Works alongside categories.</p>
                        </td>
                    </tr>

                    <tr id="get_categories_row">
                        <th><label for="get_category_ids">Get Categories</label></th>
                        <td>
                            <select id="get_category_ids" name="get_category_ids[]" multiple size="6" style="width: 300px;">
                                <?php foreach ($categories as $cat): ?>
                                    <option value="<?php echo $cat->term_id; ?>"
                                            <?php echo ($is_edit && in_array($cat->term_id, $deal['get_category_ids'])) ? 'selected' : ''; ?>>
                                        <?php echo esc_html($cat->name); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <p class="description">Categories that will be discounted.</p>
                        </td>
                    </tr>

                    <tr id="get_collections_row">
                        <th><label for="get_tag_ids">Get Collections</label></th>
                        <td>
                            <select id="get_tag_ids" name="get_tag_ids[]" multiple size="6" style="width: 300px;">
                                <?php foreach ($tags as $tag): ?>
                                    <option value="<?php echo $tag->term_id; ?>"
                                            <?php echo ($is_edit && !empty($deal['get_tag_ids']) && in_array($tag->term_id, $deal['get_tag_ids'])) ? 'selected' : ''; ?>>
                                        <?php echo esc_html($tag->name); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <p class="description">Collections (tags) that will be discounted.</p>
                        </td>
                    </tr>
                    
                    <tr id="quantities_row">
                        <th><label>Quantities</label></th>
                        <td>
                            Buy <input type="number" name="buy_quantity" min="1" 
                                      value="<?php echo $is_edit ? $deal['buy_quantity'] : '1'; ?>" style="width: 60px;"> 
                            items, get 
                            <input type="number" name="get_quantity" min="1" 
                                   value="<?php echo $is_edit ? $deal['get_quantity'] : '1'; ?>" style="width: 60px;"> 
                            items discounted
                        </td>
                    </tr>
                    
                    <tr>
                        <th><label for="discount_percent">Discount Percent *</label></th>
                        <td>
                            <input type="number" id="discount_percent" name="discount_percent" min="0" max="100" step="0.01" 
                                   value="<?php echo $is_edit ? $deal['discount_percent'] : ''; ?>" required>%
                            <p class="description">100% = free, 50% = half off, etc.</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th><label for="active">Active</label></th>
                        <td>
                            <input type="checkbox" id="active" name="active" <?php echo ($is_edit && $deal['active']) ? 'checked' : ''; ?>>
                            <label for="active">Enable this deal</label>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button($is_edit ? 'Update Deal' : 'Add Deal'); ?>
            </form>
        </div>
        
        <script>
        function toggleDealTypeFields(type) {
            const buyRow = document.getElementById('buy_categories_row');
            const buyCollRow = document.getElementById('buy_collections_row');
            const getRow = document.getElementById('get_categories_row');
            const getCollRow = document.getElementById('get_collections_row');
            const qtyRow = document.getElementById('quantities_row');

            if (type === 'sitewide') {
                buyRow.style.display = 'none';
                buyCollRow.style.display = 'none';
                getRow.style.display = 'none';
                getCollRow.style.display = 'none';
                qtyRow.style.display = 'none';
            } else if (type === 'same_category') {
                buyRow.style.display = 'table-row';
                buyCollRow.style.display = 'table-row';
                getRow.style.display = 'none';
                getCollRow.style.display = 'none';
                qtyRow.style.display = 'table-row';
            } else {
                buyRow.style.display = 'table-row';
                buyCollRow.style.display = 'table-row';
                getRow.style.display = 'table-row';
                getCollRow.style.display = 'table-row';
                qtyRow.style.display = 'table-row';
            }
        }

        // Run on page load
        document.addEventListener('DOMContentLoaded', function() {
            const dealType = document.getElementById('deal_type').value;
            toggleDealTypeFields(dealType);
        });
        </script>
        <?php
    }
}
