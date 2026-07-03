// JSON Database Service for TPK using PHP API
class DatabaseService {
    constructor() {
        this.apiUrl = 'api.php';
    }

    // Initialize the database
    async init() {
        try {
            // Try to fetch from PHP API
            const response = await fetch(`${this.apiUrl}?action=get_all`);
            const result = await response.json();
            
            if (result.success && result.data) {
                console.log('Database loaded from PHP API');
                return true;
            } else {
                throw new Error('Failed to load data from API');
            }
        } catch (error) {
            console.error('Error initializing database from PHP API:', error);
            console.error('Falling back to localStorage storage');
            this.useLocalStorageFallback = true;
            return this.initLocalStorageFallback();
        }
    }

    // Initialize localStorage fallback
    async initLocalStorageFallback() {
        this.products = JSON.parse(localStorage.getItem('tpk_products')) || [];
        this.categories = JSON.parse(localStorage.getItem('tpk_categories')) || [];
        this.cart = JSON.parse(localStorage.getItem('tpk_cart')) || [];

        console.log('Using localStorage fallback for data storage');
        return true;
    }

    // Save methods for localStorage fallback
    saveProducts() {
        localStorage.setItem('tpk_products', JSON.stringify(this.products));
    }

    saveCategories() {
        localStorage.setItem('tpk_categories', JSON.stringify(this.categories));
    }

    saveCart() {
        localStorage.setItem('tpk_cart', JSON.stringify(this.cart));
    }

    // Helper method to call API
    async callApi(action, data = null) {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (data) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(`${this.apiUrl}?action=${action}`, options);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'API call failed');
            }
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    // Product-specific methods
    async addProduct(product) {
        try {
            return await this.callApi('add_product', product);
        } catch (error) {
            console.error('Error adding product via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            product.id = product.id || Date.now();
            this.products.push(product);
            this.saveProducts();
            return product.id;
        }
    }

    async updateProduct(product) {
        try {
            await this.callApi('update_product', product);
        } catch (error) {
            console.error('Error updating product via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            const index = this.products.findIndex(p => p.id === product.id);
            if (index !== -1) {
                this.products[index] = product;
                this.saveProducts();
            }
        }
    }

    async getProducts() {
        try {
            return await this.callApi('get_products');
        } catch (error) {
            console.error('Error getting products via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            return this.products;
        }
    }

    async getProduct(id) {
        try {
            const products = await this.getProducts();
            return products.find(p => p.id === id) || null;
        } catch (error) {
            console.error('Error getting product via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            return this.products.find(p => p.id === id) || null;
        }
    }

    async deleteProduct(id) {
        try {
            await this.callApi('delete_product', { id });
        } catch (error) {
            console.error('Error deleting product via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            this.products = this.products.filter(p => p.id !== id);
            this.saveProducts();
        }
    }

    async delete(table, id) {
        if (table === 'products') {
            return this.deleteProduct(id);
        } else if (table === 'categories') {
            return this.deleteCategory(id);
        } else if (table === 'cart') {
            return this.deleteCartItem(id);
        }

        throw new Error(`Unknown table: ${table}`);
    }

    async getProductsByCategory(category) {
        try {
            const products = await this.getProducts();
            return products.filter(p => p.category === category);
        } catch (error) {
            console.error('Error getting products by category via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            return this.products.filter(p => p.category === category);
        }
    }

    // Category-specific methods
    async addCategory(category) {
        try {
            return await this.callApi('add_category', category);
        } catch (error) {
            console.error('Error adding category via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            category.id = category.id || Date.now();
            this.categories.push(category);
            this.saveCategories();
            return category.id;
        }
    }

    async updateCategory(category) {
        try {
            await this.callApi('update_category', category);
        } catch (error) {
            console.error('Error updating category via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            const index = this.categories.findIndex(c => c.id === category.id);
            if (index !== -1) {
                this.categories[index] = category;
                this.saveCategories();
            }
        }
    }

    async getCategories() {
        try {
            return await this.callApi('get_categories');
        } catch (error) {
            console.error('Error getting categories via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            return this.categories;
        }
    }

    async getCategory(id) {
        try {
            const categories = await this.getCategories();
            return categories.find(c => c.id === id) || null;
        } catch (error) {
            console.error('Error getting category via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            return this.categories.find(c => c.id === id) || null;
        }
    }

    async getCategoryBySlug(slug) {
        try {
            const categories = await this.getCategories();
            return categories.find(c => c.slug === slug) || null;
        } catch (error) {
            console.error('Error getting category by slug via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            return this.categories.find(c => c.slug === slug) || null;
        }
    }

    async deleteCategory(id) {
        try {
            await this.callApi('delete_category', { id });
        } catch (error) {
            console.error('Error deleting category via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            this.categories = this.categories.filter(c => c.id !== id);
            this.saveCategories();
        }
    }

    // Cart-specific methods
    async addToCart(cartItem) {
        try {
            return await this.callApi('add_to_cart', cartItem);
        } catch (error) {
            console.error('Error adding to cart via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            cartItem.id = cartItem.id || Date.now();
            this.cart.push(cartItem);
            this.saveCart();
            return cartItem.id;
        }
    }

    async getCart() {
        try {
            return await this.callApi('get_cart');
        } catch (error) {
            console.error('Error getting cart via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            return this.cart;
        }
    }

    async updateCartItem(cartItem) {
        try {
            await this.callApi('update_cart_item', cartItem);
        } catch (error) {
            console.error('Error updating cart item via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            const index = this.cart.findIndex(c => c.id === cartItem.id);
            if (index !== -1) {
                this.cart[index] = cartItem;
                this.saveCart();
            }
        }
    }

    async deleteCartItem(id) {
        try {
            await this.callApi('delete_cart_item', { id });
        } catch (error) {
            console.error('Error deleting cart item via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            this.cart = this.cart.filter(c => c.id !== id);
            this.saveCart();
        }
    }

    async clearCart() {
        try {
            await this.callApi('clear_cart');
        } catch (error) {
            console.error('Error clearing cart via API, falling back to localStorage');
            this.useLocalStorageFallback = true;
            this.cart = [];
            this.saveCart();
        }
    }

    // Generic addOrUpdate method for compatibility
    async addOrUpdate(table, data) {
        // Check if item exists
        let exists = false;
        let items = [];
        
        if (table === 'products') {
            items = await this.getProducts();
            exists = items.some(p => p.id === data.id);
        } else if (table === 'categories') {
            items = await this.getCategories();
            exists = items.some(c => c.id === data.id);
        } else if (table === 'cart') {
            items = await this.getCart();
            exists = items.some(c => c.id === data.id);
        }

        if (exists && data.id) {
            // Update existing
            if (table === 'products') {
                await this.updateProduct(data);
            } else if (table === 'categories') {
                await this.updateCategory(data);
            } else if (table === 'cart') {
                await this.updateCartItem(data);
            }
        } else {
            // Insert new
            if (table === 'products') {
                data.id = await this.addProduct(data);
            } else if (table === 'categories') {
                data.id = await this.addCategory(data);
            } else if (table === 'cart') {
                data.id = await this.addToCart(data);
            }
        }
        return data.id;
    }

    async clear(table) {
        if (table === 'products') {
            const products = await this.getProducts();
            for (const product of products) {
                await this.deleteProduct(product.id);
            }
        } else if (table === 'categories') {
            const categories = await this.getCategories();
            for (const category of categories) {
                await this.deleteCategory(category.id);
            }
        } else if (table === 'cart') {
            await this.clearCart();
        }
    }

    // Kept for compatibility with older pages; defaults are no longer auto-seeded.
    async initializeDefaultData() {
        return false;
    }

    // Export to JSON
    exportToJSON() {
        return JSON.stringify({
            products: this.useLocalStorageFallback ? this.products : [],
            categories: this.useLocalStorageFallback ? this.categories : []
        }, null, 2);
    }

    // Import from JSON
    async importFromJSON(jsonString) {
        const data = JSON.parse(jsonString);
        
        // Clear existing data
        const products = await this.getProducts();
        for (const product of products) {
            await this.deleteProduct(product.id);
        }
        
        const categories = await this.getCategories();
        for (const category of categories) {
            await this.deleteCategory(category.id);
        }
        
        // Import products
        for (const product of data.products) {
            await this.addProduct(product);
        }
        
        // Import categories
        for (const category of data.categories) {
            await this.addCategory(category);
        }
    }
}

const dbService = new DatabaseService();
