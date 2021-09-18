// Boilerplate router creation
const router = require('express').Router();

// Importing models
const { Product, Category, User } = require('../../models');

// Importing authentication middelware for protected routes
const withAuth = require('../../utils/auth');

// Add a new product if a user is logged in using withAuth middleware
router.post('/', withAuth, async (req, res) => {

    // Req.body should look like:
    // {
    //      "product_name": "something",
    //      "description": "some description",
    //      "img_url": "url",
    //      "location_zipcode": "12345",
    //      "category_name": "Electronics"
    // }

    try {

        // Get category data by category name from database
        const category = await Category.findOne({
            where: {
                category_name: req.body.category_name
            }
        });

        // Get category ID from category data and add it to request body
        req.body.category_id = category.dataValues.id;

        // Get user_id from session and add it to request body
        req.body.user_id = req.session.user_id;

        // Create new product using request body
        const product = await Product.create(req.body);

        res.status(200).json(product);

    } catch (error) {
        res.status(500).json(error);
    }
});


router.get('/', async (req, res) => {
    try {
        const productData = await Product.findAll({
            include: [{ model: Category }, { model: User }],
        });
        // res.status(200).json(productData);
        const allProducts = productData.map((product) => product.get({ plain: true }));
        console.log(productData);
        res.render('product', { allProducts });
    } catch (err) {
        res.status(500).json(err);
    }
});

// router.get('/:id', async (req,res) => {

//     try {
//         const productData = await Product.findOne({
//             where: {
//                 id: req.params.id,
//             },
//             include: [ { model: Category }, { model: Product } ],
//         });

//         if(!productData) {
//             res.status(404).json({ message: 'No product found with that ID'});
//             return;
//         }
//         const oneProduct = productData.map((product) => product.get({ plain: true }));
//         console.log(productData);
//     } catch (err) {
//         res.status(500).json(err);
//     }
// });

router.delete('/:id', withAuth, async (req, res) => {

    try {

        // Get product-being-deleted's owner ID
        const productToDelete = await Product.findByPk(req.params.id);
        const productOwnerID = productToDelete.dataValues.user_id;

        // Check to make sure the person deleting the product is the owner of the product
        if (productOwnerID !== req.session.user_id) {
            res.status(403).json({ message: "You cannot delete products that do not belong to you" });
            return;
        }

        // Attempt to delete the product
        const deletedProduct = await Product.destroy({
            where: { 
                id: req.params.id
            }
        });

        res.status(200).json({ message: 'Product deleted successfully' });

    } catch (error) {
        res.status(500).json(error);
    }

});

module.exports = router;