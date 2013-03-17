// var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
//     to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
//     mapping = {};
 
// for(var i = 0, j = from.length; i < j; i++ )
//   mapping[ from.charAt( i ) ] = to.charAt( i );

// function normalize(str) {
//       var ret = [];
//       for( var i = 0, j = str.length; i < j; i++ ) {
//           var c = str.charAt( i );
//           if( mapping.hasOwnProperty( str.charAt( i ) ) )
//               ret.push( mapping[ c ] );
//           else
//               ret.push( c );
//       }
//       return ret.join( '' );
// }


// function clearTagBox(filter){
// 	$('.tagbox [ckan-facet="'+filter+'"]').appendTo('.tagbox .all');
// }


// function toggleQuery(eventObject) {
// 	kwd = $(this).val();
// 	$.bbq.pushState( $.param( { 
// 		query: kwd
// 	} ));
// 	return true;
// }

// function toggleSort(eventObject) {
// 	sort_str = $(eventObject.currentTarget).attr('ckan-sort');
// 	$.bbq.pushState( $.param( { 
// 		sort: sort_str
// 	} ));
// 	return false;
// }



function unique(array){
    return $.grep(array,function(el,index){
        return index == $.inArray(el,array);
    });
}

function getAllFacetCategories(facet, selectedCategories, onlyVisible) {
	answer = []
	$('.isotope-item').each(function(index, value) {
		var theObj = $(value);
		if ( !onlyVisible || !theObj.hasClass('isotope-hidden') ){
			atributo = theObj.attr('fiso-' + facet);
			elementos = atributo.split(',');
			for ( var i = 1 ; i < elementos.length - 1; i++) {
				var elemento = elementos[i];
				if ( elemento.length > 0) {
					answer.push(elemento);
				}
			}
		}
	});

	all_elementos = unique(answer);
	final_answer = []
	for ( var i = 0; i < all_elementos.length; i++ ) {
		var elemento = all_elementos[i];
		if (  $.inArray(elemento, selectedCategories ) < 0) {
			final_answer.push(elemento);
		}
	}
	return final_answer.reverse();
}

function getFacetOperationDefault(facet)
{
	return "and"
}

function clearFilter(eventObject) {
	var facet = $(eventObject.currentTarget).attr('fiso-facet');
	switch(facet){
		case 'all':
			var hashOptions = $.deparam.fragment();
			for ( facet_cats in hashOptions ) {
				var cat_index = facet_cats.indexOf('_cats');
				if (cat_index > 0) {
					var parametros = {};
					parametros[facet_cats] = '';
					$.bbq.pushState( $.param( parametros ));
				}	
			}
		default: 
			var hashOptions = $.deparam.fragment();
			var facet_cats = facet + "_cats";
			if ( hashOptions[facet_cats] ){
				var parametros = {}
				parametros[facet_cats] = ''
				$.bbq.pushState( $.param( parametros ));
			}
	}

	return false;
}

function updateSelectors() {
 	var hashOptions = $.deparam.fragment();

	$('.fiso-selector').each(function(value, index) {
		var selectorObj = $(this);
		var toggleables = selectorObj.find('.fiso-category-toggle');

		var facet = selectorObj.attr('fiso-facet');
		var facet_cats = facet + "_cats";
		var facet_op = facet + "_op";

		var selectedCategories = hashOptions[facet_cats] ? hashOptions[facet_cats].split('.') : []
		selectedCategories.splice(0,1);
		var availableCategories = getAllFacetCategories(facet, selectedCategories, true)
		var allCategories = getAllFacetCategories(facet, [], false);

		var operator = hashOptions[facet_op] ? hashOptions[facet_op] : getFacetOperationDefault(facet);

		// Clean
		selectorObj.removeClass('or and fiso-no-categories fiso-no-selected fiso-no-available')
		toggleables.removeClass('or and selected available');

		// Update selector
		selectorObj.addClass(operator);
		if ( allCategories.length == 0){
			selectorObj.addClass('fiso-no-categories')
		}
		if ( selectedCategories.length == 0) {
			selectorObj.addClass('fiso-no-selected');
		}
		if ( availableCategories.length == 0 ) {
			selectorObj.addClass('fiso-no-available');
		}

		// Update counters
		selectorObj.find('.fiso-counter-all').text(allCategories.length);
		selectorObj.find('.fiso-counter-selected').text(selectedCategories.length);
		selectorObj.find('.fiso-counter-available').text(availableCategories.length);

		// Update Toggleable Operators
		toggleables.addClass(operator);

		// Update Toggleable Selected
		selectedSelectors = $.map(selectedCategories, function(value, index){ return '.fiso-category-toggle[fiso-category="' + value + '"]'; });
		selectorObj.find(selectedSelectors.join()).addClass('selected');

		// Update Toggleable Available
		availableSelectors = $.map(availableCategories, function(value, index){ return '.fiso-category-toggle[fiso-category="' + value + '"]'; });
		selectorObj.find(availableSelectors.join()).addClass('available');

	});
}

function filterDatasets() {
	var hashOptions = $.deparam.fragment();
	var or_filter = [];
	var filter = "";
	for ( facet_cats in hashOptions ) {
		var cat_index = facet_cats.indexOf('_cats');
		if (cat_index > 0) {
			var facet = facet_cats.split('_')[0];
			var facet_op = hashOptions[facet + "_op"]
			var operator = hashOptions[facet_op] ? hashOptions[facet_op] : getFacetOperationDefault(facet);
			var categories = hashOptions[facet_cats].split('.');
			categories.splice(0,1);
			var categories_mapped = $.map(categories, function(value, index){ return '[fiso-'+ facet+'*=",' + value + ',"]'; });
			switch (operator) {
				case 'or':
					or_filter = or_filter.concat(categories_mapped);
					break;
				case 'and':
					filter += categories_mapped.join('');
					break;
			}
		}	
	}
	or_filter = $.map(or_filter, function(value, index){ return filter + value; });
	$('.elementos').isotope( {
		filter: or_filter.length > 0 ? or_filter.join():filter
	});
}

function urlChanged() {
  	filterDatasets();
  	updateSelectors();
}

function toggleFacetCategoryUrl(eventElement) {
	var theObj = $(this);
	var facet = theObj.attr('fiso-facet');
	var facet_cats = facet + "_cats";
	var category = theObj.attr('fiso-category');

	var hashOptions = $.deparam.fragment();
	if (hashOptions[facet_cats]) {
		var index = hashOptions[facet_cats].indexOf(category);
		if ( index < 0 ) {
			hashOptions[facet_cats] = hashOptions[facet_cats] + "." + category;
		} else {
			hashOptions[facet_cats] = hashOptions[facet_cats].replace("." + category, "");
		}
	}
	else {
		hashOptions[facet_cats] = "." + category;
	}
	var parametros = {};
	parametros[facet_cats] = hashOptions[facet_cats];
	$.bbq.pushState( $.param( parametros ));

	return false;
}

function initSelectors() {
	$('.fiso-selector').each(function(value, index) {
		var selectorObj = $(this);
		var facet = selectorObj.attr('fiso-facet');
		var exampleObj = selectorObj.find('.fiso-example');
		if ( facet && exampleObj.length > 0 ) {
			var parentExampleObj = exampleObj.parent();
			var categories = getAllFacetCategories(facet, [], false);
			for ( var i = 0; i < categories.length; i++ ) {
				var category = categories[i];
				var newEle = exampleObj.clone();
				newEle.removeClass('fiso-example');
				newEleLink = newEle.find('a');
				newEleLink.text(category);
				newEleLink.addClass('fiso-category-toggle');
				newEleLink.attr('fiso-facet', facet);
				newEleLink.attr('fiso-category', category);
				parentExampleObj.prepend(newEle);
			}
			exampleObj.remove();
		}
	});
}

function initFisotope() {

  	initSelectors();
   	$(window).bind( 'hashchange', urlChanged).trigger('hashchange');
  	$('a.fiso-category-toggle').click(toggleFacetCategoryUrl);
	$('a.fiso-clear-facet').click(clearFilter);
}

$( document ).ready( function() {
	$('.elementos').isotope({
		itemSelector : '.item',
		layoutMode : 'fitRows',
		masonry: {columnWidth: 267 }
	});

	initFisotope();

});


// Queda por hacer el tema del elemento tipo isotope $('.elemento').fisotope();