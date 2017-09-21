// set handler for clear button
$( '#btcOrders' ).click(function() {
  $.get( "/btcOrders", function( data ) {
    console.log(data);
  });
});
$( '#accounts' ).click(function() {
  $.get( "/accounts", function( data ) {
    console.log(data);
  });
});