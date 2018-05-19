"use strict"
var express = require('express');
var router = express.Router();
var User = require('./../models/user')
var Goods = require('../models/goods.js');
require('./../util/util')

router.get('/', function(req, res, next) {
	res.send('respond with a resource');
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


router.post("/login", function(req, res, next) {
	var param = {
		userName: req.body.userName,
		userPwd: req.body.userPwd
	}
	User.findOne(param, (err, doc) => {
		if (err) {
			res.json({
				status: "1",
				msg: err.message
			});
		} else {
			if (doc) {
				res.cookie("userId", doc.userId, {
					path: '/',
					maxAge: 1000 * 60 * 60
				})
				res.cookie("userName", doc.userName, {
					path: '/',
					maxAge: 1000 * 60 * 60
				})
				res.json({
					status: '0',
					msg: '',
					result: {
						userName: doc.userName
					}
				});
			}
		}
	});
});

router.post('/logout', function(req, res, next) {
	res.cookie("userId", "", {
		path: '/',
		maxAge: -1
	})
	res.json({
		status: '0',
		msg: '',
		result: ''
	})
})

router.get('/checkLogin', function(req, res, next) {
	if (req.cookies.userId) {
		res.json({
			status: '0',
			msg: '',
			result: req.cookies.userName
		})
	} else {
		res.json({
			status: '1',
			msg: '未登录',
			result: ''
		})
	}
})

router.get('/cartList', function(req, res, next) {
	var userId = req.cookies.userId
	User.findOne({
		userId: userId
	}, (err, doc) => {
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		} else {
			res.json({
				status: '0',
				msg: '',
				result: doc.cartList
			})
		}
	})
})

router.post('/cartDel', function(req, res, next) {
	var userId = req.cookies.userId,
		productId = req.body.productId;
	User.update({
		userId: userId
	}, {
		$pull: {
			'cartList': {
				'productId': productId
			}
		}
	}, (err, doc) => {
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			})
		} else {
			res.json({
				status: '0',
				msg: '',
				result: 'success'
			});
		}
	})
})

router.post('/cartEdit', function(req, res, next) {
	var userId = req.cookies.userId,
		productId = req.body.productId,
		productNum = req.body.productNum,
		checked = req.body.checked;
	User.update({
		"userId": userId,
		"cartList.productId": productId
	}, {
		"cartList.$.productNum": productNum,
		"cartList.$.checked": checked
	}, (err, doc) => {
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		} else {
			res.json({
				status: '0',
				msg: '',
				result: 'success'
			});
		}
	})
})

router.post('/editCheckAll', function(req, res, next) {
	var userId = req.cookies.userId,
		checkAll = req.body.checkAll ? '1' : '0'
	User.findOne({
		userId: userId
	}, (err, user) => {
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		} else {
			if (user) {
				user.cartList.forEach(item => {
					item.checked = checkAll
				})
				user.save((e, d) => {
					if (e) {
						res.json({
							status: '1',
							msg: err.message,
							result: ''
						});
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
})

router.get('/address', function(req, res, next) {
	var userId = req.cookies.userId
	User.findOne({
		userId: userId
	}, (err, doc) => {
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		} else {
			res.json({
				status: '0',
				msg: '',
				result: doc.addressList
			})
		}
	})
})

router.post('/setDefault', function(req, res, next) {
	var userId = req.cookies.userId,
		addressId = req.body.addressId
	if (!addressId) {
		res.json({
			status: '1002',
			msg: 'addressId is null',
			result: ''
		})
	} else {
		User.findOne({
			userId: userId
		}, (err, doc) => {
			if (err) {
				res.json({
					status: '1',
					msg: err.message,
					result: ''
				});
			} else {
				var addressArr = doc.addressList
				addressArr.forEach(item => {
					if (item.addressId === addressId) {
						item.isDefault = true
					} else {
						item.isDefault = false
					}
				})

				doc.save((e, d) => {
					if (e) {
						res.json({
							status: '1',
							msg: err.message,
							result: ''
						});
					} else {
						res.json({
							status: '0',
							msg: '',
							result: 'success'
						});
					}
				})
			}
		})
	}
})

router.post('/delAddress', function(req, res, next) {
	var userId = req.cookies.userId,
		addressId = req.body.addressId;
	User.update({
		userId: userId
	}, {
		$pull: {
			'addressList': {
				'addressId': addressId
			}
		}
	}, (err, doc) => {
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		} else {
			res.json({
				status: '0',
				msg: '',
				result: 'success'
			})
		}
	})
})

router.post('/payMent', function(req, res, next) {
	var userId = req.cookies.userId,
		addressId = req.body.addressId,
		orderTotal = req.body.orderTotal;
	User.findOne({
		userId: userId
	}, (err, doc) => {
		if (err) {
			res.json({
				status: "1",
				msg: err.message,
				result: ''
			});
		} else {
			let address = '',
				goodsList = [];
			//获取当前用户的地址信息
			doc.addressList.forEach(item => {
				if (addressId === item.addressId) {
					address = item
				}
			})
			//获取当前用户购物车的选中商品
			doc.cartList.filter(item => {
				if (item.checked === '1') {
					goodsList.push(item)
				}
			})

			let sysDate = new Date().Format('yyyyMMddhhmmss'),
				createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
			let orderId = sysDate
			let order = {
				orderId: orderId,
				orderTotal: orderTotal,
				addressInfo: address,
				goodsList: goodsList,
				orderStatus: '1',
				createDate: createDate
			}
			doc.orderList.push(order)

			doc.save((e, d) => {
				if (e) {
					res.json({
						status: '1',
						msg: err.message,
						result: ''
					});
				} else {
					res.json({
						status: '0',
						msg: '',
						result: {
							orderId: order.orderId,
							orderTotal: order.orderTotal
						}
					})
				}
			})
		}
	})
})

router.get('/orderDetail', function(req, res, next) {
	let userId = req.cookies.userId,
		orderId = req.query.orderId;
	User.findOne({
		userId: userId
	}, (err, doc) => {
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		} else {
			let orderList = doc.orderList
			if (orderList.length > 0) {
				let orderTotal = 0
				orderList.forEach(item => {
					if (item.orderId === orderId) {
						orderTotal = item.orderTotal
					}
				})

				if (orderTotal > 0) {
					res.json({
						status: '0',
						msg: '',
						result: {
							orderId: orderId,
							orderTotal: orderTotal
						}
					})
				} else {
					res.json({
						status: '120002',
						msg: '无此订单',
						result: ''
					})
				}
			} else {
				res.json({
					status: '120001',
					msg: '当前用户未创建订单',
					result: ''
				})
			}
		}
	})
})

router.get('/getCartCount', function(req, res, next) {
	if (req.cookies && req.cookies.userId) {
		let userId = req.cookies.userId
		User.findOne({
			'userId': userId
		}, (err, doc) => {
			if (err) {
				res.json({
					status: "0",
					msg: err.message
				});
			} else {
				let cartList = doc.cartList,
					cartCount = 0;
				cartList.map(item => {
					cartCount += parseFloat(item.productNum)
				})
				res.json({
					status: '0',
					msg: '',
					result: cartCount
				})
			}
		})
	} else {
		res.json({
			status: "0",
			msg: "当前用户不存在"
		});
	}
})

module.exports = router;