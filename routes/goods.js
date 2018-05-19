"use strict"
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods.js');

var options = {  
    server: {
        auto_reconnect: true,
        poolSize: 10
    }
};

var DB_URL = 'mongodb://127.0.0.1:27017/vue-mall'
mongoose.connect(DB_URL,options)

mongoose.connection.on('connected', function() {
	console.log('MongoDB success at port 3000')
})

router.get('/', function(req, res, next) {
	Goods.find({}, (err, doc) => {
		if (err) {
			res.json({
				status: '1',
				msg: err.message
			});
		} else {
			res.json({
				status: '0',
				msg: '',
				result: {
					count: doc.length,
					list: doc
				}
			})
		}
	})
});

router.get("/list", function(req, res, next) {
	var page = parseInt(req.query.page),
		pageSize = parseInt(req.query.pageSize),
		sort = req.query.sort,
		skip = (page - 1) * pageSize,
		params = {};
	var priceLevel = req.query.priceLevel,
		priceGt = '',
		priceLte = '';
	if (priceLevel !== 'all') {
		switch (priceLevel) {
			case '0':
				priceGt = 0;
				priceLte = 100;
				break;
			case '1':
				priceGt = 100;
				priceLte = 500;
				break;
			case '2':
				priceGt = 500;
				priceLte = 1000;
				break;
			case '3':
				priceGt = 1000;
				priceLte = 5000;
				break;
		}
		params = {
			salePrice: {
				$gt: priceGt,
				$lte: priceLte
			}
		}
	}

	let goodsModel = Goods.find(params).skip(skip).limit(pageSize)
	goodsModel.sort({
		'salePrice': sort
	})
	goodsModel.exec(function(err, doc) {
		if (!err) {
			res.json({
				status: '0',
				msg: '',
				result: {
					count: doc.length,
					list: doc
				}
			})
		} else {
			res.json({
				status: '1',
				msg: err.message
			})
		}
	})
});

router.post("/addCart", function(req, res, next) {
	var userId = '00001',
		productId = req.body.productId;
	var User = require('../models/user')
	User.findOne({
		userId: userId
	}, function(err, userDoc) {
		if (err) {
			res.json({
				status: "1",
				msg: err.message
			})
		} else {
			if (userDoc) {
				var goodsItem = ''
				userDoc.cartList.forEach(item => {
					if (item.productId === productId) {
						goodsItem = item
						item.productNum++
					}
				})

				if (goodsItem) {
					userDoc.save((err2, doc2) => {
						if (err2) {
							res.json({
								status: "1",
								msg: err2.message
							})
						} else {
							res.json({
								status: '0',
								msg: '',
								result: 'success'
							})
						}
					})
				} else {
					Goods.findOne({
						productId: productId
					}, function(e, d) {
						if (e) {
							res.json({
								status: "1",
								msg: err1.message
							})
						} else {
							if (d) {
								d.productNum = 1
								d.checked = 1
								userDoc.cartList.push(d)
								userDoc.save((e2, d2) => {
									if (e2) {
										res.json({
											status: "1",
											msg: err2.message
										})
									} else {
										res.json({
											status: '0',
											msg: '',
											result: 'success'
										})
									}
								})
							}
						}
					})
				}
			}
		}
	})
})

module.exports = router;
