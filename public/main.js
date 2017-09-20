// set handler for clear button
$( '#fetch-button' ).click(function() {
  $.get( "/data", function( data ) {
    //var objects = JSON.parse(data);
    console.log(data);
  });
});