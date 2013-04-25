FIsotope
========

**A wrapper to the exquisite jQuery plugin for magical layouts [Isotope](http://isotope.metafizzy.co). Make it easy to filter, sort, and query words by using html attributes and classes.

**Also uses the wonderfull Ben Alamn's [BBQ Jquery Plugin](http://benalman.com/projects/jquery-bbq-plugin/)

This package has all the documentation and demos to get you started.

## Licensing

Obviously respect Isotope and BBQ licensing and on the FIsotope hand, do as you please.

## Viewing this project locally

Git clone and load index.html on your favorite browser.

## Getting Started

### Load libraries

    <script type="text/javascript" src="jquery.js"></script>
    <script type="text/javascript" src="jquery.isotope.min.js"></script>
    <script type="text/javascript" src="jquery.ba-bbq.min.js"></script>
    <script type="text/javascript" src="fisotope.js"></script>

### Initialize Isotope 

You need to initialize isotope, for example like this

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

and the initialize fisotope using the same selector.

	$('.elementos').fisotope();

### Filters

Yo can filter your cards by any number of facets. For each facet, you need to add an attribute with the name 'fiso-facetname' to the item with the values precede, separted and ended with a dot. Look at the following example where two facets are defined with different categories.

	<li class="item" 
		fiso-tags=".parties.events.sports."
		fiso-formats=".csv.xls.doc."
		>
          <h3>Lorem Ipsum</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </li>

By only setting this values you can now filter your cards by using, for example the following url that filter by the tag 'sports'
    
    #tags_cats=.sports.

Or for example two categories

	#tags_cats=.sports.&formats_cats='.csv'

### Toggle Filter Links

If you set some class and attributes to your filter links, fisotope will do all the filtering for you. If the filter is activated it will be removed and if not it will be activated. Also the 'html a' element class will be updated in order to match the facet category status. This is an example link line.

    <a href="#" class="fiso-toggle-category" fiso-facet="tags" fiso-category="sports">

#### Class

* fiso-toggle-category: The needed class to tell fisotope this is a toggle filter link

#### Attributes
      
* fiso-facet: you must set it's value with the facet name. Following our example we can use 'tags'
* fiso-category: you must set it's value with one of the possible facet values. Following our example we can use 'sports'

#### Status Classes

* or: the fisotope filter for this facet is using the or operator
* and: the fisotope filter for this facet is using the and operator 
* selected: the filter for this facet/category is activated.
* available: this filter for this facet/category is an available option. For example, if there are no more visible cards with this facet, that this class will not be set.

### Clear Filter Link

You can set a link that clears the different filters. This is an example link line.

    <a href="#" class="fiso-clear-facet" fiso-facet="tags">Clear</a>

#### Class

* fiso-clear-facet: The needed class to tell fisotope that this is a clear filter link

#### Attributes
      
* fiso-facet: you must set it's value with the facet name to clear or some of the following default options.

  * query: Clean the text query filter
  * sort: Clean the sort setting.
  * all: Clean all the posible, filters and sort setting.

### Toggle Filter Operator Link

You can set a link that changes the operator asigned to the filter of an specific facet. Also the 'html a' element class will be updated in order to match the facet operator status. This is an example link line.

    <a href="#" class="fiso-toggle-facet" fiso-facet="tags">Cambiar Operación</a>

#### Class

* fiso-toggle-facet: The needed class to tell fisotope that this is a toggle filter operator link

#### Attributes
      
* fiso-facet: you must set it's value with the facet name to toggle it's operator

#### Status Classes

* or: the fisotope filter for this facet is using the or operator
* and: the fisotope filter for this facet is using the and operator 

### Fisotope Selector

Fisotope let you handle and create all the different elements related to a facet. It's better to start with an example.

    <div class="fiso-selector" fiso-facet="tags" >
        <h2>Tags 
            <span class="fiso-counter-selected"></span>/
            <span class="fiso-counter-available"></span>/
            <span class="fiso-counter-all"></span>
        </h2>
        <ul>
        	<li class="fiso-example"><a href="#"></a></li>
            <li><a href="#" class="fiso-toggle-facet" fiso-facet="tags">Cambiar Operación</a></li>
            <li><a href="#" class="fiso-clear-facet" fiso-facet="tags">Clear</a></li>
         </ul>
    </div>