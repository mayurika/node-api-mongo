const mongoose = require("mongoose");
const Product = require("./product");

const tempProductSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    originalProductId: mongoose.Schema.Types.ObjectId
});

let tempProductModel = mongoose.model('TempProduct', tempProductSchema);

function insertProduct(obj) {
	const product = new Product({
	_id: new mongoose.Types.ObjectId(),
	name: obj.name,
	price: obj.price
    });
    product
    .save()
    .then(result => {
	   tempProductModel.updateOne({ _id: obj._id }, { $set: {'originalProductId' : result._id}})
	    .exec()
	    .then(result => {
	    	console.log('Inserted into original products...')
	    })
	    .catch(err => {
	    	console.log('Error while updating original product ID back into temp product...');
	    	console.log(err);
	    });
    })
    .catch(err => {
	    	console.log('Error while inserting product into temp table.');
	    	console.log(err);
	});
}

function updateProduct(documentId, updateDescription) {
	tempProductModel.findById(documentId) //Find temp product
    .exec()
    .then( tempProductObject => {  //Propagate the change to original product.
			    Product.updateOne({ _id: tempProductObject.originalProductId }, { $set: updateDescription.updatedFields }) //Update the original records.
			    .exec()
			    .then(result => {
					console.log('Updated the original product with ID ' + tempProductObject.originalProductId);
			    })
			    .catch(err => {
			    	console.log('Error while updating original product ID back into temp product.')
					console.log(err);
			    });
		}
    ).catch(err => {
		console.log('Error while updating temporary product.')
		console.log(err);
	});
}

tempProductModel.watch().on('change', data => {
	console.log('------------');
	console.log(data);
	switch(data.operationType) {
		case 'insert' : insertProduct(data.fullDocument);
		                break;
		case 'update' : updateProduct(data.documentKey._id, data.updateDescription);
		                break;
	}
});

module.exports = tempProductModel;
