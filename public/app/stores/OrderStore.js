var FetchDispatcher = require('../dispatcher/FetchDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var FetchConstants = require('../constants/FetchConstants');


var currentOrder = {
	id: null,
	order: '',
	address: '',
	customer: ''
}

var orders = { }

var OrderStore = assign({}, EventEmitter.prototype, {
	emitChange: function() {
	    this.emit(FetchConstants.CHANGE_EVENT);
	},

	/** @param {function} callback   */
	addChangeListener: function(callback) {
	    this.on(FetchConstants.CHANGE_EVENT, callback);
	},

	removeChangeListener: function(callback) {
	    this.removeListener(FetchConstants.CHANGE_EVENT, callback);
	},

	getCurrentOrder: function(){
		return currentOrder;
	},

	getOrders: function(format){
		if (format == null)
			return orders;

		if (format == 'array'){
			var array = [];
			var keys = Object.keys(orders);
			for (var i=0; i<keys.length; i++){
				var key = keys[i];
				array.push(orders[key]);
			}

			return array;
		}

	}

});

OrderStore.dispatchToken = FetchDispatcher.register(function(action) {

	if (action.type == FetchConstants.CURRENT_ORDER_UPDATED){
		currentOrder = action.currentOrder;
      	OrderStore.emitChange();
	}

	if (action.type == FetchConstants.ORDER_CREATED){

		currentOrder = {
			id: null,
			order: '',
			address: '',
			customer: ''
		}

		orders[action.order.id] = action.order;
		console.log('ORDER_CREATED Notification Received: '+JSON.stringify(orders));


     	OrderStore.emitChange();
	}
});


module.exports = OrderStore;










