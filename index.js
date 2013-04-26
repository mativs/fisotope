$( document ).ready( function() {


	$('.elementos').fisotope({
		itemSelector : '.item',
		layoutMode : 'fitRows',
		masonry: {columnWidth: 267 },
		getSortData : {
		    title : function ( $elem ) {
		      return $elem.find('h1').text();
		    }
	  	},
		default_facet_operator: {
			letras:'or',
			numeros:'and'
		}
	});

});