const db = require('../database/models');
const { Op } = require("sequelize");
const { validationResult } = require('express-validator');

const controller = {
    //LISTA DE PRODUCTOS
    index: (req, res) => {
        db.Product.findAll()
            .then((products) => {
                return res.render('./products/products', { products })
            });
    },
    // CARRITO
    productCart: (req, res) => {
        res.render("./products/productCart");
    },

    // DETALLE DEL PRODUCTO
    productDetail: async (req, res) => {
        try {
            const product = await db.Product.findByPk(req.params.id, {
                include: ['brands', 'categories', 'product_images']
            })
            res.render("./products/productDetail", { product });
        } catch (error) {
            console.log(error)
        }

    },

    // CREACIÓN Y EDICIÓN
    productCreate: async (req, res) => {
        try {
            const categories = await db.Category.findAll();
            const brands = await db.Brand.findAll();

            res.render("./products/productCreate", { categories, brands });
        } catch (error) {
            res.send(error);
        }
    },

    store: async (req, res) => {
        const categories = await db.Category.findAll();
        const brands = await db.Brand.findAll();
        try {
            const resultValidation = validationResult(req);
            if (resultValidation.errors.length > 0) {
                return res.render("./products/productCreate", {
                    errors: resultValidation.mapped(), oldData: req.body, categories, brands
                });
            }
            await db.Product.create({
                name: req.body.name,
                price: req.body.price,
                discount: req.body.discount,
                description: req.body.description,
                brands_id: req.body.brand,
                categories_id: req.body.category,
            })
            res.redirect('/products');
        }
        catch (error) {
            console.log(error)
        }
    },

    productEdit: async (req, res) => {
        try {
            const product = await db.Product.findByPk(req.params.id);
            const category = await db.Category.findAll();
            const brand = await db.Brand.findAll();
            const product_images = await db.ProductImages.findAll();

            res.render("./products/productEdit", { product, category, brand, product_images });
        } catch (error) {
            console.log(error);
        }
    },


    editedProduct: async (req, res) => {
        try {
            console.log(req.body)
            const product = await db.Product.findByPk(req.params.id);
            const category = await db.Category.findAll();
            const brand = await db.Brand.findAll();
            const product_images = await db.ProductImages.findAll();
            const resultValidation = validationResult(req);
            console.log(resultValidation)
            if (resultValidation.errors.length > 0) {
                return res.render("./products/productEdit", {
                    errors: resultValidation.mapped(), oldData: req.body, product, category, brand, product_images
                
                });
                
            }
            
            await db.Product.update({
                name: req.body.name,
                price: req.body.price,
                discount: req.body.discount,
                description: req.body.description,
                brands_id: req.body.brand,
                categories_id: req.body.category
            }, {
                where: {
                    id: req.params.id
                }
            });
            res.redirect('/products');
        } catch (error) {
            res.send(error);
        }
    },


    // ELIMINACIÓN
    deleteProduct: function (req, res) {
        db.Product.destroy({
            where: {
                id: req.params.id
            }
        })

        res.redirect('/products');

    },
    search: async (req, res) => {
        try {
            const { q } = req.query
            const products = await db.Product.findAll({
                where: {
                    name: {
                        [Op.like]: '%' + q + '%'
                    }
                }

            })
            res.render("./products/productSearch", { products })

        }
        catch (error) {
            res.send(error)
        }
    }

}

module.exports = controller;