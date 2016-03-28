var React = require('react');
var ProfileStore = require('../../stores/ProfileStore');
var OrderStore = require('../../stores/OrderStore');
var FetchServerActions = require('../../actions/FetchServerActions');


var Orders = React.createClass({

	getInitialState: function(){
		return {
			currentUser: ProfileStore.getCurrentUser(),
			orders: OrderStore.getOrders('array')
		}
	},

	componentDidMount: function(){
		ProfileStore.addChangeListener(this.refreshCurrentUser);
		OrderStore.addChangeListener(this.refreshOrders);
		FetchServerActions.getCurrentUser();
	},

	refreshCurrentUser: function(){
		this.setState({
			currentUser: ProfileStore.getCurrentUser()
		});

		console.log('REFRESH: '+JSON.stringify(this.state.currentUser));
		if (this.state.currentUser.id == null)
			return;

		if (this.state.currentUser.type != 'fetcher'){
			alert('You are not authorized to view this page!');
			return;
		}

		FetchServerActions.fetchOrders();
	},

	refreshOrders: function(){
		this.setState({
			orders: OrderStore.getOrders('array')
		});
	},


	claimOrder: function(event){
		var order = this.state.orders[event.target.id];
		if (order.fetcher.length > 0){
			alert('This order was already claimed. Sorry!');
			return;
		}

		console.log('Claim Order: '+JSON.stringify(order));

		FetchServerActions.updateOrder(order.id, {fetcher: this.state.currentUser.id});
	},

	render: function(){
		var orderList = null;
		var _this = this;
		if (this.state.orders != null){
			orderList = this.state.orders.map(function(order, i){
				var row = null;
				if (order.fetcher.length > 0){
					row = <tr key={i}><td>{i+1}</td><td>{order.order}</td><td>{order.address}</td><td>{order.status}</td><td><button onClick={_this.claimOrder} id={i} className="btn btn-danger">Claimed</button></td></tr>;
				}
				else {
					row = <tr key={i}><td>{i+1}</td><td>{order.order}</td><td>{order.address}</td><td>{order.status}</td><td><button onClick={_this.claimOrder} id={i} className="btn btn-success">Claim</button></td></tr>;
				}
				return row;
			});

		}

		return (
			<div className="container">
				<h1>Welcome {this.state.currentUser.firstName}</h1>
				<table className="table">
				  <thead>
					<tr>
					  <th>#</th>
					  <th>Order</th>
					  <th>Adddress</th>
					  <th>Status</th>
					  <th>&nbsp;</th>
					</tr>
				  </thead>
				  <tbody>
				  	{orderList}
				  </tbody>
				</table>
			</div>
		);
	}

});

module.exports = Orders;