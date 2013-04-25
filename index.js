$( document ).ready( function() {
	$('.elementos').isotope({
		itemSelector : '.item',
		layoutMode : 'fitRows',
		masonry: {columnWidth: 267 },
		getSortData : {
		    letras_count : function ( $elem ) {
		    	return $elem.attr('fiso-tags').split('.').length - 2;
		    },
		    numeros_count : function ( $elem ) {
		    	return $elem.attr('fiso-res-format').split('.').length - 2;
		    },
		    title : function ( $elem ) {
		      return $elem.find('h1').text();
		    }
	  	}
	});

	$('.elementos').fisotope({
		default_facet_operator: {
			letras:'or',
			numeros:'and'
		}
	});

});