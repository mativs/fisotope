(function( $ ){

  	var methods = {
  		defaults: {
  			default_operator: 'and'
  		},
  		settings: {

  		},
  		mapping: {

  		},
  		theElement: null,
     	init : function( options ) {
	  		
	  		// Save element
			methods.theElement = this;	

			// Sort Methods to Default
			var atributos = this.find('.item')[0].attributes
			var sort_default = { getSortData: {} }
			for ( var index = 0; index < atributos.length; index++ ){
				var value = atributos[index].name 
				if ( value.indexOf('fiso-') == 0 ) {
					name = value.substr(5)
					sort_default.getSortData[name + "_count"]  = function ( elem ) {
				    	return elem.attr(value).split('.').length - 2;
				    };
				}
			}
			
			// Init Settings
			methods.settings = $.extend({}, methods.defaults, options)
			$.extend(true, methods.settings, sort_default);

	  		// Init Isotope
			this.isotope(methods.settings);
				
		    // Init Selectors
	  		$('.fiso-selector').each(function(value, index) {
				var selectorObj = $(this);

				var facet = selectorObj.attr('fiso-facet');
				var exampleObj = selectorObj.find('.fiso-example');
				if ( facet && exampleObj.length > 0 ) {
					var parentExampleObj = exampleObj.parent();
					var categories = methods.getAllFacetCategories(facet, [], false);
					for ( var i = 0; i < categories.length; i++ ) {
						var category = categories[i];
						var newEle = exampleObj.clone();
						newEle.removeClass('fiso-example');
						newEleLink = newEle.find('a').andSelf().filter('a');
						newEleLink.append(category);
						newEleLink.addClass('fiso-toggle-category');
						newEleLink.attr('fiso-facet', facet);
						newEleLink.attr('fiso-category', category);
						parentExampleObj.prepend(newEle);
					}
					exampleObj.remove();
				}
			});

			// Init Search
	  		$.expr[':'].contains = function(a, i, m) {
			  return methods.normalize($(a).text().toUpperCase())
			      .indexOf(methods.normalize(m[3].toUpperCase())) >= 0;
			};

			// Init Data
			var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç"
			var to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc"
				
			for(var i = 0, j = from.length; i < j; i++ ) {
	  			methods.mapping[ from.charAt( i ) ] = to.charAt( i );
	  		}

	        // Bindings
	        $(window).bind( 'hashchange.fisotope', methods.urlChanged).trigger('hashchange');
		  	$('a.fiso-toggle-category').bind( 'click.fisotope', methods.toggleFacetCategoryUrl);
			$('a.fiso-clear-facet').bind( 'click.fisotope', methods.clearFacet);
			$('a.fiso-toggle-facet').bind( 'click.fisotope', methods.toggleFacet);
			$('a.fiso-sort-facet').bind( 'click.fisotope', methods.toggleSort);
			$('input.fiso-search').bind( 'keyup.fisotope', methods.toggleQuery) ;



       		return this;
    	},
    	destroy: function( ) {
    		var data = this.data('fisotope');
    		data.fisotope.remove();
    		this.removeData('fisotope');
    		return this;
    	},
    	normalize: function(str) {
			var ret = [];
			for( var i = 0, j = str.length; i < j; i++ ) {
				var c = str.charAt( i );
				if( methods.mapping.hasOwnProperty( str.charAt( i ) ) )
					ret.push( methods.mapping[ c ] );
				else
					ret.push( c );
			}	
			return ret.join( '' );
		},
		unique: function(array){
		    return $.grep(array,function(el,index){
		        return index == $.inArray(el,array);
		    });
		},
		getAllFacetCategories: function(facet, selectedCategories, onlyVisible) {
			var answer = []
			$('.isotope-item').each(function(index, value) {
				var theObj = $(value);
				if ( !onlyVisible || !theObj.hasClass('isotope-hidden') ){
					atributo = theObj.attr('fiso-' + facet);
					elementos = atributo.split('.');
					for ( var i = 1 ; i < elementos.length - 1; i++) {
						var elemento = elementos[i];
						if ( elemento.length > 0) {
							answer.push(elemento);
						}
					}
				}
			});

			var all_elementos = methods.unique(answer);
			var final_answer = []
			for ( var i = 0; i < all_elementos.length; i++ ) {
				var elemento = all_elementos[i];
				if (  $.inArray(elemento, selectedCategories ) < 0) {
					final_answer.push(elemento);
				}
			}
			final_answer.sort();
			final_answer.reverse();
			return final_answer;
		},
		getFacetOperationDefault: function(facet)
		{
			var operator = null;
			if (methods.settings.default_facet_operator) {
			 	operator = methods.settings.default_facet_operator[facet];
			}
			return operator ? operator : methods.settings.default_operator;
		},
		getSortDefault: function()
		{
			return "asc";
		},
		toggleQuery: function(eventObject) {
			kwd = $(this).val();
			$.bbq.pushState( $.param( { 
				query: kwd
			} ));
			return true;
		},
		toggleSort: function(eventObject) {
			sort_str = $(this).attr('fiso-sort');
			order_srt = $(this).attr('fiso-sort-order');
			order = order_srt ? order_srt : methods.getSortDefault();
			$.bbq.pushState( $.param( { 
				sort: sort_str,
				sort_order: order
			} ));
			eventObject.preventDefault();
			return true;
		},
		toggleFacet: function(eventObject) {
			var facet = $(eventObject.currentTarget).attr('fiso-facet');
			var default_facet_operator = methods.getFacetOperationDefault(facet);
			var hashOptions = $.deparam.fragment();
			var facet_op = facet + "_op";
			var actual_facet_operator = hashOptions[facet_op] ? hashOptions[facet_op] : default_facet_operator
			var new_facet_operator = ""
			switch (actual_facet_operator) {
				case 'and':
					new_facet_operator = 'or';
					break;
				case 'or':
					new_facet_operator = 'and';
					break;
				default:
					new_facet_operator = default_facet_operator
					break;
			} 
			var parametros = {};
			parametros[facet_op] = new_facet_operator;
			$.bbq.pushState( $.param( parametros ));
			eventObject.preventDefault();
			return true;
		},
		clearFacet: function(eventObject) {
			var facet = $(eventObject.currentTarget).attr('fiso-facet');
			switch(facet){
				case 'query':
					$.bbq.pushState( { query: "" });	
					break;
				case 'sort':
					$.bbq.pushState( { sort: "" });
					break;
				case 'all':
					var hashOptions = $.deparam.fragment();
					for ( facet_param in hashOptions ) {
						var cat_index = facet_param.indexOf('_cats');
						var op_index = facet_param.indexOf('_op');
						if (cat_index > 0) {
							var parametros = {};
							parametros[facet_param] = '';
							$.bbq.pushState( $.param( parametros ));
						} else if (op_index > 0) {
							var parametros = {}
							parametros[facet_param] = '';
							$.bbq.pushState( $.param(parametros) );
						}
					}
					$.bbq.pushState( { query: "" });
					$.bbq.pushState( { sort: "" });
					break;
				default: 
					var hashOptions = $.deparam.fragment();
					var facet_cats = facet + "_cats";
					if ( hashOptions[facet_cats] ){
						var parametros = {}
						parametros[facet_cats] = ''
						$.bbq.pushState( $.param( parametros ));
					}
					break;
			}
			eventObject.preventDefault();
			return true;
		},
		updateSelectors: function() {
		 	var hashOptions = $.deparam.fragment();

		 	var allObj = $('.fiso-all');
		 	allObj.removeClass('fiso-all-no-categories fiso-all-no-operators fiso-all-no-query fiso-all-no-sort');
		 	var noContent = {
		 		categories: true,
		 		operators: true,
		 		query: true,
		 		sort: true
		 	};
		 	for ( facet_param in hashOptions ) {
		 		var hasContent = hashOptions[facet_param].length > 0;
				var facet_param = facet_param.indexOf('_cats') > 0 ? 'categories' : facet_param;
				var facet_param = facet_param.indexOf('_op') > 0 ? 'operators' : facet_param;
				if ( hasContent ) {
					noContent[facet_param] = false;
				}
			}
			for ( content in noContent ) {
				if ( noContent[content] ) {
					allObj.addClass('fiso-all-no-' + content );
				}
			}

			// Update search
			if ( $('input.fiso-search').val() == '' && hashOptions.query != '' )
			{
				$('input.fiso-search').val(hashOptions.query);
			} else {
				if ( $('input.fiso-search').val() != '' && ( !hashOptions.query || hashOptions.query == '')) {
					$('input.fiso-search').val('');
				}
			}

			// Update totals
			var totalCounterObj = $('.fiso-total-counter');
			var totalHiddenCounterObj = $('.fiso-total-hidden');
			var totalVisibleCounterObj = $('.fiso-total-visible');
			var totalItems = $('.isotope-item').length;
			var totalHidden = $('.isotope-item.isotope-hidden').length;
			var totalVisible = totalItems - totalHidden
			totalCounterObj.text(totalItems);
			totalHiddenCounterObj.text(totalHidden);
			totalVisibleCounterObj.text(totalVisible);

			// Update Toggle Filter Links
			$('.fiso-toggle-category').each(function(value, index) {
				var linkObj = $(this);

				var facet = linkObj.attr('fiso-facet');
				var facet_cats = facet + "_cats";
				var facet_op = facet + "_op";
				var operator = hashOptions[facet_op] ? hashOptions[facet_op] : methods.getFacetOperationDefault(facet);

				linkObj.removeClass('or and selected available first-selected last-selected first-available last-available');
				linkObj.addClass(operator);
			});

			// Update Toggle Opertor Links
			$('.fiso-toggle-facet').each(function(value, index){
				var linkObj = $(this);

				var facet = linkObj.attr('fiso-facet');
				var facet_cats = facet + "_cats";
				var facet_op = facet + "_op";
				var operator = hashOptions[facet_op] ? hashOptions[facet_op] : methods.getFacetOperationDefault(facet);

				linkObj.removeClass('or and');
				linkObj.addClass(operator);
			});
			
			// Updated Selected And Available
			var atributos = methods.theElement.find('.item')[0].attributes
			for ( var index = 0; index < atributos.length; index++ ){
				var value = atributos[index].name 
				if ( value.indexOf('fiso-') == 0 ) {
					facet = value.substr(5)
					var facet_cats = facet + "_cats";
					var facet_op = facet + "_op";
					var operator = hashOptions[facet_op] ? hashOptions[facet_op] : methods.getFacetOperationDefault(facet);
					var selectedCategories = hashOptions[facet_cats] ? hashOptions[facet_cats].split('.') : []
					selectedCategories.splice(0,1);
					selectedCategories.splice(selectedCategories.length-1,1);
					var availableCategories = methods.getAllFacetCategories(facet, selectedCategories, true)
					var allCategories = methods.getAllFacetCategories(facet, [], false);

					// Update fiso-toggle-category Selected
					selectedSelectors = $.map(selectedCategories, function(value, index){ return '.fiso-toggle-category[fiso-category="' + value + '"]'; });
					$(selectedSelectors.join()).addClass('selected');

					// Update fiso-toggle-category Available
					availableSelectors = $.map(availableCategories, function(value, index){ return '.fiso-toggle-category[fiso-category="' + value + '"]'; });
					$(availableSelectors.join()).addClass('available');

					// Update fiso-counter-all text
					var facetTotalCounter = $('.fiso-counter-all[fiso-facet="' +  facet + '"]');
					facetTotalCounter.text(allCategories.length);

					// Update fiso-counter-selected text
					var facetSelectedCounter = $('.fiso-counter-selected[fiso-facet="' +  facet + '"]');
					facetSelectedCounter.text(selectedCategories.length);

					// Update fiso-counter-available text
					var facetAvailableCounter = $('.fiso-counter-available[fiso-facet="' +  facet + '"]');
					facetAvailableCounter.text(availableCategories.length);

					$('.fiso-selector[fiso-facet="' + facet + '"]').each(function(value, index) {
						var selectorObj = $(this);

						// Clean
						selectorObj.removeClass('or and fiso-no-categories fiso-no-selected fiso-no-available')
						selectorObj.removeClass (function (index, css) {
							var allClass = $(this).attr('class').split(' ')
							var answerClass = []
							for ( index in allClass ) {
								var theClass = allClass[index];
								if  ( theClass.indexOf('fiso-selected') == 0 || 
									theClass.indexOf('fiso-all') == 0 || 
									theClass.indexOf('fiso-available') == 0 ) {
									answerClass.push(theClass);
								}
							}
							return answerClass.join(' ');
						});

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
	
						// Update first/last
						var selectedObjs = selectorObj.find('.fiso-toggle-category.selected')
						selectedObjs.first().addClass('first-selected')
						selectedObjs.last().addClass('last-selected')
						var availableObjs = selectorObj.find('.fiso-toggle-category.available')
						availableObjs.first().addClass('first-available')
						availableObjs.last().addClass('last-available')

						// Update counters
						selectorObj.addClass('fiso-all-' + allCategories.length);
						selectorObj.addClass('fiso-selected-' + selectedCategories.length);
						selectorObj.addClass('fiso-available-' + availableCategories.length);
					});

				}
			}

			
		},
		recursiveFilter: function(big_table) {
			if (big_table.length == 0) {
				return []
			} else if (big_table.length == 1 ) {
				return big_table[0];
			} else {
				var actualFacets = big_table.pop();
				var otherFacets = methods.recursiveFilter(big_table);
				var answer=[]
				for (filter_x in actualFacets) {
					for (filter_y in otherFacets) {
						answer.push(actualFacets[filter_x] + otherFacets[filter_y])
					}
				}
				return answer 
			}
		},
		filterDatasets: function() {
			var hashOptions = $.deparam.fragment();
			var or_filter = [];
			var filter = "";
			var big_table = [];
			var sort_str = hashOptions['sort'] ? hashOptions['sort'] : 'original-order';
			var sort_order = hashOptions['sort_order'] ? hashOptions['sort_order'] : methods.getSortDefault();
			for ( facet_cats in hashOptions ) {
				var cat_index = facet_cats.indexOf('_cats');
				if (cat_index > 0) {
					var facet = facet_cats.split('_')[0];
					var facet_op = facet + "_op";
					var operator = hashOptions[facet_op] ? hashOptions[facet_op] : methods.getFacetOperationDefault(facet);
					var categories = hashOptions[facet_cats].split('.');
					categories.splice(0,1);
					categories.splice(categories.length-1,1);
					if (categories.length > 0) {
						var categories_mapped = $.map(categories, function(value, index){ return '[fiso-'+ facet+'*=".' + value + '."]'; });
						switch (operator) {
							case 'or':
								big_table.push(categories_mapped);
								break;
							case 'and':
								big_table.push([categories_mapped.join('')])
								break;
						}
					}
				}	
			}
			
			or_filter = methods.recursiveFilter(big_table);
			if (hashOptions.query) {
				var containsStr = ":contains('" + hashOptions.query + "')";
				if ( or_filter.length > 0) {
					or_filter = $.map(or_filter, function(value, index){ return value + containsStr; } );
				} else {
					or_filter = [containsStr];
				}
			}

			methods.theElement.isotope( {
				filter: or_filter.join(),
				sortBy : sort_str,
				sortAscending: !(sort_order == 'desc')
			});
		},
		urlChanged: function() {
		  	methods.filterDatasets();
		  	methods.updateSelectors();
		},
		toggleFacetCategoryUrl: function(eventObject) {
			var theObj = $(this);
			var facet = theObj.attr('fiso-facet');
			var facet_cats = facet + "_cats";
			var category = theObj.attr('fiso-category');

			var hashOptions = $.deparam.fragment();
			if (hashOptions[facet_cats]) {
				var index = hashOptions[facet_cats].indexOf("." + category + ".");
				if ( index < 0 ) {
					hashOptions[facet_cats] = hashOptions[facet_cats] + category + '.';
				} else {
					hashOptions[facet_cats] = hashOptions[facet_cats].replace("." + category + ".", ".");
					if ( hashOptions[facet_cats] == '.' )
						hashOptions[facet_cats] = ''
				}
			}
			else {
				hashOptions[facet_cats] = "." + category + ".";
			}
			var parametros = {};
			parametros[facet_cats] = hashOptions[facet_cats];
			$.bbq.pushState( $.param( parametros ));
			eventObject.preventDefault();
			return true;
		},
 	};

    $.fn.fisotope = function( method ) {
    
    	if ( methods[method] ) {
      		return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    	} else if ( typeof method === 'object' || ! method ) {
      		return methods.init.apply( this, arguments );
    	} else {
      		$.error( 'Method ' +  method + ' does not exist on jQuery.fisotope' );
    	}    
    };

})( jQuery );





	
