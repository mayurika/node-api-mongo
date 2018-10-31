const mongoose = require("mongoose");
const Product = require("../models/product");
const tempProduct = require("../models/tempProduct");

exports.products_get_all = (req, res, next) => {
   tempProduct.find()
    .select("name price _id")
    .exec()
    .then(docs => {
	const response = {
	    count: docs.length,
	    products: docs.map( doc => {
		return {
		    name: doc.name,
		    price: doc.price,
		    _id: doc._id,
		    request: {
		      type: "GET",
		      url: "http://localhost:1234/products/" + doc._id
		    }
		  };
		})
	     };
             res.status(200).json(response);
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
};

exports.products_create_product = (req, res, next) => {
    const product = new tempProduct({
	_id: new mongoose.Types.ObjectId(),
	name: req.body.name,
	price: req.body.price
    });
    product
    .save()
    .then(result => {
	console.log(result);
	res.status(201).json({
	    message: "Created product successfully",
            createdProduct: {
		name: result.name,
		price: result.price,
		_id: result._id,
		request: {
		    type: 'GET',
		    url: 'http://localhost:1234/products/' + result._id
		}
	    }
	});
    })
    .catch(err => {
	console.log(err);
	res.status(500).json({ error: err }); 
    });
};

exports.products_get_product = (req, res, next) => {
    const id = req.params.productId;
    tempProduct.findById(id)
    .select('name price _id')
    .exec()
    .then(doc => {
	console.log("From database", doc);
        if(doc) {
	    res.status(200).json({
		product: doc,
		request: {
		    type: 'GET',
		    url: 'http://localhost:1234/products'
		}
	    });
	} else {
	    res.status(400).json({ message: "No valid entry found for provided ID" });
	}	
    })
    .catch(err => {
	console.log(err);
	res.status(500).json({ error: err }); 
    });
};

exports.products_update_product = (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
	updateOps[ops.propName] = ops.value;
    }
    tempProduct.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
	res.status(200).json({
	    message: 'Product updated',
	    request: {
		type: 'GET',
		url: 'http://localhost:1234/products/' + id
	    }
	});
    })
    .catch(err => {
	console.log(err);
	res.status(500).json({ error: err});
    });
};

exports.products_delete = (req, res, next) => {
    const id = req.params.productId;
    tempProduct.remove({_id: id})
    .exec()
    .then( result => {
	res.status(200).json({
	    message: 'Product deleted',
	    request: {
		type: 'GET',
		url: 'http://localhost:1234/products',
		body: { name: 'String', price: 'Number' }
	    }
	});
     })
    .catch( err => {
	console.log(err);
	res.status(500).json({error: err});
     });
};
