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

### Toggle Filter Links (*fiso-toggle-category*)

A link that lets you toggle between adding or removing a category from a facet filter.

    <a href="#" class="fiso-toggle-category" fiso-facet="tags" fiso-category="sports">

#### Needed Attributes
      
* **fiso-facet** - Set this attribute with the facet name. For example, *tags*.
* **fiso-category** - Set this attribute with one of the possible facet values. For example, *sports*.

#### Populated Classes

* **or** - The filter for this facet is using the *or* operator.
* **and** (default) - The filter for this facet is using the *and* operator.
* **selected** - The filter for this category is activated.
* **available** - This category is an available option for filtering. 

#### Direct Filter Link Example

[http://mativs.github.com/fisotope/index.html#tags_cats=.alojamiento.](http://mativs.github.com/fisotope/index.html#tags_cats=.alojamiento.)

### Toggle Filter Operator Links (*fiso-toggle-facet*)

 While filtering a list by setting many categories from an specific facet you could be searching for the intersection of all categories (*and*) or for the union of all categories (*or*). This link lets you toggle the facet operator.

    <a href="#" class="fiso-toggle-facet" fiso-facet="tags">Cambiar Operación</a>

#### Needed Attributes
      
* **fiso-facet** - Set this attribute with the facet name to change it's opeator.

#### Populated Classes

* **or** - The filter for this facet is using the *or* operator.
* **and** (default) - The filter for this facet is using the *and* operator.

#### Direct Operator Link Example

[http://mativs.github.com/fisotope/index.html#tags_cats=.alojamiento.&tags_op=or](http://mativs.github.com/fisotope/index.html#tags_cats=.alojamiento.&tags_op=or)

### Clear Filter Links (*fiso-clear-facet*)

A link that lets you clear all the selected categories for an specific facet or some generic options.

    <a href="#" class="fiso-clear-facet" fiso-facet="tags">Clear</a>

#### Needed Attributes
      
* **fiso-facet** - Set this attribute with the facet name to clear or some of the following generic options.

  * **query** - Cleans the text query filter.
  * **sort** - Cleans the sort setting.
  * **all** - Cleans all type of filtering, querying or sorting.

### Text Information Classes

Yo can set any of the following classes to an html element and the text for that element will be updated with the correct numeric information.

#### Facet Classes

This classes need to have the attribute **fiso-facet** setted with the corresponding facet name.

    <span class="fiso-counter-selected" fiso-facet="tags"></span>
    <span class="fiso-counter-available" fiso-facet="tags"></span>
    <span class="fiso-counter-all" fiso-facet="tags"></span>

* **fiso-counter-all** - The element text will be setted with the total categories number
* **fiso-counter-selected** - The element text will be updated with the number of categories selected for that facet.
* **fiso-counter-available** - The element text will be updated with the nubmer of categories available to filter.

#### Global Classes

    <span class="fiso-total-counter"></span>
    <span class="fiso-total-hidden"></span>
    <span class="fiso-total-visible"></span>

* **fiso-total-counter** - The element text will be setted with the total number of isotope items.
* **fiso-total-hidden** - The element text will be updated with the nubmer of hidden items.
* **fiso-total-visible** - The element text will be updated with the number of visible items.

### Fisotope Selector (*fiso-selector*)

You can generate a list of [toggle filter links] categories for an specific facet based on all the isotope items. 

    <div class="fiso-selector" fiso-facet="tags" >
      <ul>
        	<li class="fiso-example"><a href="#"></a></li>
      </ul>
    </div>