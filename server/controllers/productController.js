import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const { category } = req.query;

        let query = {};
        if (category && category !== 'all') {
            query.category = category;
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res) => {
    try {
        const { name, price, description, image, category } = req.body;

        const product = await Product.create({
            name,
            price,
            description,
            image,
            category,
        });

        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Seed initial products
// @route   POST /api/products/seed
// @access  Admin
export const seedProducts = async (req, res) => {
    try {
        // Initial products from frontend data
        const initialProducts = [
            {
                name: 'Red Velvet Cake',
                price: 189,
                image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400&h=300&fit=crop',
                category: 'cakes',
                description: 'Luxurious red velvet layers with cream cheese frosting',
            },
            {
                name: 'Chocolate Truffle Cake',
                price: 199,
                image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
                category: 'cakes',
                description: 'Rich Belgian chocolate with truffle ganache',
            },
            {
                name: 'Strawberry Shortcake',
                price: 169,
                image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop',
                category: 'cakes',
                description: 'Fresh strawberries with whipped cream layers',
            },
            {
                name: 'Butter Croissant',
                price: 109,
                image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
                category: 'pastries',
                description: 'Flaky, buttery layers of French perfection',
            },
            {
                name: 'Blueberry Danish',
                price: 119,
                image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400&h=300&fit=crop',
                category: 'pastries',
                description: 'Sweet danish with fresh blueberry compote',
            },
            {
                name: 'Chocolate Éclair',
                price: 129,
                image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=400&h=300&fit=crop',
                category: 'pastries',
                description: 'Choux pastry filled with vanilla cream',
            },
            {
                name: 'Sourdough Loaf',
                price: 149,
                image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&h=300&fit=crop',
                category: 'breads',
                description: 'Artisan sourdough with crispy crust',
            },
            {
                name: 'Multigrain Bread',
                price: 139,
                image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
                category: 'breads',
                description: 'Wholesome bread with seeds and grains',
            },
            {
                name: 'French Baguette',
                price: 99,
                image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop',
                category: 'breads',
                description: 'Classic French baguette with golden crust',
            },
        ];

        // Clear existing products and seed new ones
        await Product.deleteMany({});
        const products = await Product.insertMany(initialProducts);

        res.status(201).json({
            success: true,
            message: `Seeded ${products.length} products`,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
