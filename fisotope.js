(function( $ ){

  	var methods = {
  		defaults: {
  			default_operator: 'and',
  			empty_selection_behaviour: "show",
  			operators_pool: ['and', 'or', 'unique']
  		},
  		settings: {

  		},
  		mapping: {

  		},
  		theElement: null,
     	init : function( options, callback ) {
	  		
	  		// Save element
			methods.theElement = this;	

			// Sort Methods to Default
			var atributos = this.find(options.itemSelector)[0].attributes
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
			methods.settings.callback = callback;

	  		// Init Isotope
			this.isotope(methods.settings, callback);
				
		    // Init Selectors
	  		$('.fiso-selector').each(function(value, index) {
					var selectorObj = $(this);

					var facet = selectorObj.attr('fiso-facet');
					var exampleObj = selectorObj.find('.fiso-example');
					if ( facet && exampleObj.length > 0 ) {
						var parentExampleObj = exampleObj.parent();
						var categories = methods.getAllFacetCategories(facet);
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
		isEligible: function(hashOptions, facet, category) {
			var hashOptionsCopy = {}
			var operator = methods.getOperator(hashOptionsCopy, facet)
			$.extend(true, hashOptionsCopy,hashOptions )
			var newHashOptions = methods.toggleFacetCategory(hashOptionsCopy, facet, category, operator)
			var selector = methods.getJqueryFilter(newHashOptions)
			if (selector) {
				return $(selector).length > 0;
			} 
			return true;
		},
		getCategoriesFromAttribute: function(attribute) {
			var answer = []
			if (attribute) {
				elements = attribute.split('.');
				for ( var i = 1 ; i < elements.length - 1; i++) {
					var element = elements[i];
					if ( element.length > 0) {
						answer.push(element);
					}
				}
			}
			return answer;
		},
		getSelectedCategories: function(hashOptions, facet) {
			if (!hashOptions[facet + "_cats"])
				return [];

			var selectedCategories = hashOptions[facet + "_cats"].split('.')
			selectedCategories.splice(0,1);
			selectedCategories.splice(selectedCategories.length-1,1);

			if (selectedCategories.length == 0)
				return [];

			var operator = methods.getOperator(hashOptions, facet)
			switch (operator) {
				case 'unique':
					selectedCategories = [selectedCategories[selectedCategories.length-1]];
					break;
			}
			return selectedCategories
		},
		getEligibleCategories: function(hashOptions, facet) {
			var eligibleCategories = []
			var linkObjs = $('.fiso-toggle-category[fiso-facet="' + facet + '"]')
			linkObjs.each(function() {
				var category = $(this).attr('fiso-category');
				if ( methods.isEligible(hashOptions, facet, category )){
					eligibleCategories.push(category)
				}
			});
			return methods.unique(eligibleCategories);
		},
		getAvailableCategories: function(facet, selectedCategories) {
			var answer = []
			$('.isotope-item').each(function(index, value) {
				var theObj = $(value);
				if ( !theObj.hasClass('isotope-hidden') ){
					atributo = theObj.attr('fiso-' + facet);
					answer = answer.concat(methods.getCategoriesFromAttribute(atributo))
				}
			});

			
			answer = methods.unique(answer);
			answer = $.grep(answer, function(value, index){
				return $.inArray(value, selectedCategories) < 0
			})
			answer.sort();
			answer.reverse();
			return answer;
		},
		getAllFacetCategories: function(facet) {
			var answer = []
			$('.isotope-item').each(function(index, value) {
				var theObj = $(value);
				atributo = theObj.attr('fiso-' + facet);
				answer = answer.concat(methods.getCategoriesFromAttribute(atributo))
			});

			answer = methods.unique(answer);
			answer.sort();
			answer.reverse();
			return answer;
		},
		getFacets: function() {
			return $.map(
				$.grep ( 
					methods.theElement.find(methods.settings.itemSelector)[0].attributes, 
					function(value, index) {
						return value.name.indexOf('fiso-') == 0;
					}
				),
				function(value, index){ 
					return value.name.substr(5);
				}
			);
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
		getOperator: function(hashOptions, facet) {
			var facet_op = facet + "_op";
			return hashOptions[facet_op] ? hashOptions[facet_op] : methods.getFacetOperationDefault(facet);
		},
		getNextOperator: function(actual_facet_operator)
		{
			var pool = methods.settings.operators_pool
			var actual_index = pool.indexOf(actual_facet_operator)
			var next_index = actual_index + 1 == pool.length ? 0 : actual_index + 1
			return pool[next_index]
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
			var actual_facet_operator = methods.getOperator(hashOptions, facet)
			var new_facet_operator = methods.getNextOperator(actual_facet_operator)
			var parametros = {};
			parametros[facet + "_op"] = new_facet_operator;
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
		updateFacetCategoryStatus: function(facet, status, linkObjs, statusCategories) {
			if ( linkObjs != null ) {
				linkObjs.addClass('not-' + status)
				statusSelectors = $.map(statusCategories, function(value, index){ return '.fiso-toggle-category[fiso-category="' + value + '"]'; });
				var statusObjects = $(statusSelectors.join());
				statusObjects.removeClass('not-' + status);
				statusObjects.addClass(status);
			}

			// Update fiso-counter-selected text
			var facetStatusCounter = $('.fiso-counter-'+ status +'[fiso-facet="' +  facet + '"]');
			facetStatusCounter.text(statusCategories.length);
		},
		updateFacetSelectorStatus: function(facet, status, selectorObj, statusCategories) {
			if ( statusCategories.length == 0) {
				selectorObj.addClass('fiso-no-' + status);
			}

			var selectedObjs = selectorObj.find('.fiso-toggle-category.' + status)
			if (selectorObj.length > 0) {
				selectedObjs.first().addClass('first-' + status)
				selectedObjs.last().addClass('last-' + status)
			}

			selectorObj.addClass('fiso-' + status + '-' + statusCategories.length);
		},
		updateFacet: function(facet, operator, hashOptions) {
			var facet_cats = facet + "_cats";
			var linkObjs = $('.fiso-toggle-category[fiso-facet="' + facet + '"]')
			var linkOpObjs = $('.fiso-toggle-facet[fiso-facet="' + facet + '"]')
			var selectedCategories = methods.getSelectedCategories(hashOptions, facet)
			var availableCategories = methods.getAvailableCategories(facet, selectedCategories)
			var allCategories = methods.getAllFacetCategories(facet);
			var eligibleCategories = methods.getEligibleCategories(hashOptions, facet);

			// Clean fiso-toggle-category
			linkObjs.removeClass('or and unique selected eligible not-eligible available not-available first-selected last-selected not-selected first-available last-available');
			linkOpObjs.removeClass('or and unique');

			// Update operators
			linkObjs.addClass(operator);
			linkOpObjs.addClass(operator);

			methods.updateFacetCategoryStatus(facet, 'selected', linkObjs, selectedCategories)
			methods.updateFacetCategoryStatus(facet, 'available', linkObjs, availableCategories)
			methods.updateFacetCategoryStatus(facet, 'eligible', linkObjs, eligibleCategories)
			methods.updateFacetCategoryStatus(facet, 'all', null, allCategories)

			// Update selector
			$('.fiso-selector[fiso-facet="' + facet + '"]').each(function(value, index) {
				var selectorObj = $(this);

				// Clean
				selectorObj.removeClass('or and unique fiso-no-categories fiso-no-eligible fiso-no-selected fiso-no-available')
				selectorObj.removeClass (function (index, css) {
					var allClass = $(this).attr('class').split(' ')
					var answerClass = []
					for ( index in allClass ) {
						var theClass = allClass[index];
						if  ( 
							theClass.indexOf('fiso-selected') == 0 || 
							theClass.indexOf('fiso-all') == 0 || 
							theClass.indexOf('fiso-available') == 0 ||
							theClass.indexOf('fiso-eligible') == 0
							) {
							answerClass.push(theClass);
						}
					}
					return answerClass.join(' ');
				});

				// Update selector
				selectorObj.addClass(operator);

				methods.updateFacetSelectorStatus(facet, 'selected', selectorObj, selectedCategories)
				methods.updateFacetSelectorStatus(facet, 'available', selectorObj, availableCategories)
				methods.updateFacetSelectorStatus(facet, 'eligible', selectorObj, eligibleCategories)
				methods.updateFacetSelectorStatus(facet, 'all', selectorObj, allCategories)

			});
		},
		updateSearch: function(query){
			if ( $('input.fiso-search').val() == '' && query != '' )
			{
				$('input.fiso-search').val(query);
			} else {
				if ( $('input.fiso-search').val() != '' && ( !query || query == '')) {
					$('input.fiso-search').val('');
				}
			}
		},
		updateTotals: function() {
			var totalCounterObj = $('.fiso-total-counter');
			var totalHiddenCounterObj = $('.fiso-total-hidden');
			var totalVisibleCounterObj = $('.fiso-total-visible');
			var totalItems = $('.isotope-item').length;
			var totalHidden = $('.isotope-item.isotope-hidden').length;
			var totalVisible = totalItems - totalHidden
			totalCounterObj.text(totalItems);
			totalHiddenCounterObj.text(totalHidden);
			totalVisibleCounterObj.text(totalVisible);
		},
		updateClasses: function() {
		 	var hashOptions = $.deparam.fragment();

			methods.updateSearch(hashOptions.query)
			methods.updateTotals()

			var facets = methods.getFacets();
			for ( var index = 0; index < facets.length; index++ ){
				var facet = facets[index];
				var operator = methods.getOperator(hashOptions, facet)
				methods.updateFacet(facet, operator, hashOptions )
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
		getJqueryFilter: function(hashOptions) {
			var or_filter = [];
			var filter = "";
			var big_table = [];
			for ( facet_cats in hashOptions ) {
				var cat_index = facet_cats.indexOf('_cats');
				if (cat_index > 0) {
					var facet = facet_cats.split('_')[0];
					var operator = methods.getOperator(hashOptions, facet)
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
							case 'unique':
								big_table.push([categories_mapped[categories_mapped.length-1]]);
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

			var final_filter = or_filter.join();
			if ( methods.settings.empty_selection_behaviour == "hide" && $.trim(final_filter) == '' ) {
				final_filter = 	'.asdlkfasdlkasdfkl32923u42kj349';
			} 
			return final_filter

		},
		filterDatasets: function() {
			var hashOptions = $.deparam.fragment();
			var sort_str = hashOptions['sort'] ? hashOptions['sort'] : 'original-order';
			var sort_order = hashOptions['sort_order'] ? hashOptions['sort_order'] : methods.getSortDefault();
			var final_filter = methods.getJqueryFilter(hashOptions)
			
			methods.theElement.isotope( {
					filter: final_filter,
					sortBy : sort_str,
					sortAscending: !(sort_order == 'desc')
				},
				methods.settings.callback
			);
		},
		urlChanged: function() {
		  	methods.filterDatasets();
		  	methods.updateClasses();
		},
		toggleFacetCategory: function(hashOptions, facet, category, operator){
			var facet_cats = facet + "_cats";
			if (hashOptions[facet_cats]) {
				var index = hashOptions[facet_cats].indexOf("." + category + ".");
				if ( index < 0 ) {
					if ( operator == 'unique') {
						hashOptions[facet_cats] = "." + category + ".";
					} else {
						hashOptions[facet_cats] = hashOptions[facet_cats] + category + '.';
					}
				} else {
					hashOptions[facet_cats] = hashOptions[facet_cats].replace("." + category + ".", ".");
					if ( hashOptions[facet_cats] == '.' || operator == 'unique')
						hashOptions[facet_cats] = ''
				}
			}
			else {
				hashOptions[facet_cats] = "." + category + ".";
			}
			
			return hashOptions
		},
		toggleFacetCategoryUrl: function(eventObject) {
			var theObj = $(this);
			var facet = theObj.attr('fiso-facet');
			var facet_cats = facet + "_cats";
			var category = theObj.attr('fiso-category');

			var hashOptions = $.deparam.fragment();
			var operator = methods.getOperator(hashOptions, facet)
			
			var parametros = {};
			var newHashOptions = methods.toggleFacetCategory(hashOptions, facet, category, operator)
			parametros[facet_cats] = newHashOptions[facet_cats];

			$.bbq.pushState( $.param( parametros ) );
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





	