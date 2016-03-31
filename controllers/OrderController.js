var Order = require('../models/Order');
var EmailManager = require('../managers/EmailManager');
var ProfileController = require('../controllers/ProfileController');
var fs = require('fs');
var Promise = require('bluebird');


// - - - - - - - - - Promise Methods: - - - - - - - - - - - - - - - 

var fetchFile = function(path){
	return new Promise(function (resolve, reject){

		fs.readFile(path, 'utf8', function (err, data) {
			if (err) {
				reject(err); 
			}
			else { 
				resolve(data); 
			}
		});
	});
}

// var notifyProfiles = function(filters, note, subject){
// 	return new Promise(function (resolve, reject){
// 		ProfileController.get(filters, false, function(err, results){
// 			if (err){
// 				reject(err);
// 			}
// 			else {
// 				var recipients = [];
// 				for (var i=0; i<results.length; i++){
// 					var profile = results[i];
// 					recipients.push(profile.email);
// 				}

// 				EmailManager.sendBatchEmail('info@thegridmedia.com', recipients, subject, note, null);
// 				resolve();
// 			}
// 		});

// 	});
// }


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
			fetchFile(path)
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
				fetchFile(path)
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