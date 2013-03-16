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









// function updateSelector(facet, selectedCategories, parentObj, operator) {
// 	var categories = getAllFacetCategories(facet, selectedCategories, true)
// 	var all_categories = getAllFacetCategories(facet, selectedCategories, false);
// 	var toggleables = parentObj.find('.toggleable');
// 	var hideableObj = parentObj.find('.hideable')
// 	var counterObj = parentObj.find('.facet-counter');
// 	var allObj = parentObj.find('.clear-element')
// 	var counter = 0;
// 	var activeSelectors = []

// 	parentObj.removeClass('no-options');
// 	parentObj.removeClass('no-actives');
// 	toggleables.removeClass('selectable active');
// 	toggleables.addClass(operator);

// 	switch (operator) {
// 		case 'or':
// 			if ( selectedCategories.length == 0 ){
// 				allObj.addClass('active');
// 			} else {
// 				allObj.addClass('selectable');
// 			}
// 			counter = all_categories.length;
// 			break
// 		case 'and':
// 			if ( selectedCategories.length > 0 ){
// 				allObj.addClass('selectable');
// 			} 
// 			if ( categories.length > 0 ){
// 				selectors = $.map(categories, function(value, index){ return '.toggleable[ckan-category="' + value + '"]'; });
// 				parentObj.find(selectors.join()).addClass('selectable');
// 			} 
// 			counter = categories.length;
// 			break;
// 	}

// 	if (selectedCategories.length > 0 ){
// 		activeSelectors = $.map(selectedCategories, function(value, index){ return '.toggleable[ckan-category="' + value + '"]'; });
// 		parentObj.find(activeSelectors.join()).addClass('active');
// 	}
	
// 	// counter
// 	if (counter == 0 ) {
// 		parentObj.addClass('no-options')
// 	}

// 	if (selectedCategories.length == 0) {
// 		parentObj.addClass('no-actives')
// 	}
 	
// 	if (counterObj) {
// 		counterObj.text(counter);
// 	}
// }

// function updateSelectors() {
//  	var hashOptions = $.deparam.fragment();

// 	$('[ckan-category-selector]').each(function(value, index) {
// 		var theObj = $(this);
// 		var facet = theObj.attr('ckan-facet');
// 		var default_op = theObj.attr('ckan-default-operator');
// 		var categories = hashOptions[facet] ? hashOptions[facet].split('.') : []
// 		var operator = hashOptions[facet + '_op'] == 'or' || hashOptions[facet + '_op'] == 'and' ? hashOptions[facet + '_op'] : default_op;
// 		updateSelector(facet, categories, theObj, operator);
// 	});
// }

// function clearTagBox(filter){
// 	$('.tagbox [ckan-facet="'+filter+'"]').appendTo('.tagbox .all');
// }


// function clearFilter(eventObject) {
// 	var filter = $(eventObject.currentTarget).attr('ckan-facet');
// 	clearTagBox(filter);
// 	switch(filter){
// 		case 'groups':
// 			$.bbq.pushState( $.param( {groups: ""} ));
// 			break;
// 		case 'tags':
// 			$.bbq.pushState( $.param( {tags: ""} ));
// 			break;
// 		case 'res_format':
// 			$.bbq.pushState( $.param( {res_format: ""} ));
// 			break;
// 		case 'query':
// 			$.bbq.pushState( $.param( {query: ""} ));
// 			$('#search').val('');
// 			break;
// 		case 'sort':
// 			$.bbq.pushState( $.param( {sort: "original-order"} ));
// 			break;
// 		case 'all':
// 			$.bbq.pushState( $.param( {groups: ""} ));
// 			$.bbq.pushState( $.param( {tags: ""} ));
// 			$.bbq.pushState( $.param( {res_format: ""} ));
// 			$.bbq.pushState( $.param( {query: ""} ));
// 			$.bbq.pushState( $.param( {sort: "original-order"} ));
// 			break;
// 	}
//   	closeDropdowns();

// 	return false;
// }

// function toggleUrlGroup(facet) {
// 	var hashOptions = $.deparam.fragment();
// 	if (hashOptions.groups) {
// 		index = hashOptions.groups.indexOf(facet);
// 		length = facet.length;
// 		if ( index < 0 ) {
// 			hashOptions.groups = hashOptions.groups + "." + facet;
// 		} else {
// 			hashOptions.groups = hashOptions.groups.replace("." + facet, "");
// 		}
// 	}
// 	else {
// 		hashOptions.groups = "." + facet;
// 	}
// 	$.bbq.pushState( $.param( { 
// 		groups: hashOptions.groups
// 	} ));
// }

// function toggleUrlTag(facet) {
// 	var hashOptions = $.deparam.fragment();
// 	if (hashOptions.tags) {
// 		index = hashOptions.tags.indexOf(facet);
// 		if ( index < 0 ) {
// 			hashOptions.tags = hashOptions.tags + "." + facet;
// 		} else {
// 			hashOptions.tags = hashOptions.tags.replace("." + facet, "");
// 		}
// 	}
// 	else {
// 		hashOptions.tags = "." + facet;
// 	}
// 	$.bbq.pushState( $.param( { 
// 		tags: hashOptions.tags
// 	} ));
// }

// function toggleUrlFormat(facet) {
// 	var hashOptions = $.deparam.fragment();
// 	if (hashOptions.res_format) {
// 		index = hashOptions.res_format.indexOf(facet);
// 		length = facet.length;
// 		if ( index < 0 ) {
// 			hashOptions.res_format = hashOptions.res_format + "." + facet;
// 		} else {
// 			hashOptions.res_format = hashOptions.res_format.replace("." + facet, "");
// 		}
// 	}
// 	else {
// 		hashOptions.res_format = "." + facet;
// 	}
// 	$.bbq.pushState( $.param( { 
// 		res_format: hashOptions.res_format
// 	} ));
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
			for ( var i = 0; i < elementos.length; i++) {
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

function filterDatasets() {
	var hashOptions = $.deparam.fragment();
	var or_filter = [];
	var filter = "";
	for ( facet_url in hashOptions ) {
		var cat_index = facet_url.indexOf('_cat');
		if (cat_index > 0) {
			var facet = facet_url.split('_')[0];
			var operator = hashOptions[facet + "_op"];
			var categories = hashOptions[facet_url].split('.');
			categories.splice(0,1);
			var categories_mapped = $.map(categories, function(value, index){ return '[fiso-'+ facet+'*="' + value + '"]'; });
			switch (operator) {
				case 'or':
					or_filter = or_filter.concat(categories_mapped);
					break;
				case 'and':
				default:
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
  	//updateSelectors();
}

function toggleFacetCategoryUrl(eventElement) {
	var theObj = $(this);
	var facet = theObj.attr('fiso-facet');
	var facet_url = facet + "_cats";
	var category = theObj.attr('fiso-category');

	var hashOptions = $.deparam.fragment();
	if (hashOptions[facet_url]) {
		var index = hashOptions[facet_url].indexOf(category);
		if ( index < 0 ) {
			hashOptions[facet_url] = hashOptions[facet_url] + "." + category;
		} else {
			hashOptions[facet_url] = hashOptions[facet_url].replace("." + category, "");
		}
	}
	else {
		hashOptions[facet_url] = "." + category;
	}
	var parametros = {};
	parametros[facet_url] = hashOptions[facet_url];
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
				newEle.removeClass('example');
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
  	$('a.fiso-category-toggle').click(toggleFacetCategoryUrl);
   	$(window).bind( 'hashchange', urlChanged).trigger('hashchange');
	// $('a[ckan-clear]').click(clearFilter);
	

}

$( document ).ready( function() {
	$('.elementos').isotope({
		itemSelector : '.item',
		layoutMode : 'fitRows',
		masonry: {columnWidth: 267 }
	});

	initFisotope();

});

// queda por hacer el tema del elemento tipo isotope $('.elemento').fisotope();