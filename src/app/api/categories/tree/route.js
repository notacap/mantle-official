import { NextResponse } from 'next/server';

/**
 * GET handler for category tree
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with hierarchical category tree
 */
export async function GET(request) {
  try {
    // WooCommerce API URL for product categories
    const apiUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products/categories');
    
    // Add query parameters - get all categories in a single request
    apiUrl.searchParams.append('per_page', '100');
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Fetch categories from WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    const categories = await response.json();
    
    // Build category tree
    const rootCategories = categories.filter(cat => cat.parent === 0);
    
    // Add children to each root category
    rootCategories.forEach(root => {
      root.children = categories.filter(cat => cat.parent === root.id);
      
      // Add grandchildren if needed (second level)
      if (root.children && root.children.length > 0) {
        root.children.forEach(child => {
          child.children = categories.filter(cat => cat.parent === child.id);
        });
      }
    });
    
    // Return the category tree
    return NextResponse.json({ categoryTree: rootCategories });
  } catch (error) {
    console.error('Error fetching category tree:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category tree' },
      { status: 500 }
    );
  }
} 