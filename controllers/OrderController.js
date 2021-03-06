var Order = require('../models/Order');
var EmailManager = require('../managers/EmailManager');
var FileManager = require('../managers/FileManager');
var ProfileController = require('../controllers/ProfileController');


module.exports = {

	get: function(params, isRaw, completion){
		Order.find(params, function(err, orders){
			if (err){
				completion(err, null);
			    return;
			}

			if (isRaw == true){
				completion(null, orders);
				return;
			}

			var list = [];
			for (var i=0; i<orders.length; i++){
				var order = orders[i];
				list.push(order.summary());
			}

			completion(null, list);
		    return;
		});
	},

	getById: function(id, completion){
		Order.findById(id, function(err, order){
			if (err){
				var error = {message:'Order Not Found'};
				completion(error, null);
			    return;
			}

			if (order == null){
				var error = {message:'Order Not Found'};
				completion(error, null);
			    return;
			}

			completion(null, order.summary());
		});
	},

	post: function(params, completion){

		Order.create(params, function(err, order){
			if (err){
				completion(err, null);
			    return;
			}

			var path = 'public/email/email.html';
			FileManager.fetchFile(path)
			.then(function(data){
				var orderSummary = order.summary();
				var html = data.replace('{{address}}', orderSummary['address']);
				html = html.replace('{{order}}', orderSummary['order']);
				return ProfileController.notifyProfiles({type:'fetcher'}, html, 'AN ORDER CAME IN!!');
			})
			.catch(function(err){

			});


			completion(null, order.summary());
		});
	},

	put: function(id, params, completion){

		Order.findByIdAndUpdate(id, params, {new:true}, function(err, order){
			if (err){
				completion(err, null);
			    return;
			}

			// delivery person is claiming an order:
			if (params['fetcher'] != null){

				var path = 'public/email/customernotification.html';
				FileManager.fetchFile(path)
				.then(function(data){
					var html = data.replace('{{order}}', order.order);
					return ProfileController.notifyProfiles({_id: order.customer}, html, 'Your Order is on the Way!');

				})
				.catch(function(err){

				});
			}
			
			completion(null, order.summary());
		});
	}



}