// set handler for clear button
$( '#btcOrders' ).click(function() {
  $.get( "/btcOrders", function( data ) {
    console.log(data);
  });
});
$( '#accounts' ).click(function() {
  $.get( "/accounts", function( data ) {
  	for (var acct of data) {
  		createAcct(acct);
  	}
  });
});
$( '#ticker' ).click(function() {
  $.get( "/ticker", function( data ) {
    console.log(data);
  });
});

function createAcct(acct) {
	var div = '<div><div class="flex-row"><div>Acct: </div><div class="acct-title">' + acct.currency + '</div></div>';
	div += '<div class="flex-row"><div>Balance: </div><div class="acct-title">' + acct.balance + '</div></div></div>';
	$('#accts').append(div);
}