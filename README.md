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

You need to initialize fisotope, with the same parameters as [Isotope](http://isotope.metafizzy.co).

  	$('.elementos').fisotope({
  		itemSelector : '.item',
  		layoutMode : 'fitRows',
  		masonry: {columnWidth: 267 },
  		getSortData : {
  		    title : function ( $elem ) {
  		      return $elem.find('h1').text();
  		    }
  	  	}
  	    },
	    function ( $items ) {
	    	$.scrollTo($('#nav'));
	    }
	);

#### Configuration exception

The *filter* configuration doesn't work because it's overriden by fisotope. 

### Extra Configurations
     
    $('.elementos').fisotope({
      default_facet_operator: {
        tags:'or',
        res_format:'and'
      },
      empty_selection_behaviour: "hide"
    });

#### default_fact_operator

This configuration lets you change your default operator for your specific facets. If nothing is set the default operator will be the *and* operator

#### empty_selection_behaviour

Two posible values, *hide* or *show*. Defines the default operation when nothing is filtered.

#### operators_pool

Pool with the different operators to cycle in the toggle operator link. Default value is equal to `['and', 'or', 'unique']

### Filters

Yo can filter your cards by any number of facets. For each facet, you need to add an attribute with the name 'fiso-facetname' to the item with the values **precede**, **separted** and **ended** with a dot. Look at the following example where two facets are defined with different categories.

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

Or for example two facet

	#tags_cats=.sports.&formats_cats='.csv'

## Helpers

This is a list of featured classes that changes links and other objects in order to make filtering sorting and queryin an easier task.

### Toggle Filter Links (*fiso-toggle-category*)

A link that lets you toggle between adding or removing a category from a facet filter.

    <a href="#" class="fiso-toggle-category" fiso-facet="tags" fiso-category="sports">Sports</a>

#### Needed Attributes
      
* **fiso-facet** - Set this attribute with the facet name. For example, *tags*.
* **fiso-category** - Set this attribute with one of the possible facet values. For example, *sports*.

#### Populated Classes

* **or** - The filter for this facet is using the *or* operator.
* **and** (default) - The filter for this facet is using the *and* operator.
* **unique** - The filter for this facet is using the *unique* operator.
* **selected** - The filter for this category is activated.
* **not-selected** - The filter for this category is not activated.
* **first-selected** - This is the first category in a [selector](#fisotope-selector-fiso-selectorfiso-example) to be selected. 
* **last-selected** - This is the last category in a [selector](#fisotope-selector-fiso-selectorfiso-example) to be selected
* **available** - This category appear in any of the visible items and is not selected.
* **not-available** - This category does not appear in any of the visible items and is not selected.
* **first-available** - This is the first category in a [selector](#fisotope-selector-fiso-selectorfiso-example) to be available. 
* **last-available** - This is the last category in a [selector](#fisotope-selector-fiso-selectorfiso-example) to be available
* **eligible** - If you toggle this category one or more results are ensured.
* **not-eligible** - If you toggle this category you will have an empty result set.
* **first-eligible** - This is the first category in a [selector](#fisotope-selector-fiso-selectorfiso-example) to be eligible. 
* **last-eligible** - This is the last category in a [selector](#fisotope-selector-fiso-selectorfiso-example) to be eligible

### Toggle Filter Operator Links (*fiso-toggle-facet*)

 While filtering a list by setting many categories from an specific facet you could be searching for the intersection of all categories (*and*) or for the union of all categories (*or*) or for having always only one category filtering by that facet (*unique*). This link lets you toggle between the differente facet operators. You can use the the [operators_pool](#operators_pool) config option to set the pool where the operators will be cycling. 

    <a href="#" class="fiso-toggle-facet" fiso-facet="tags">Cambiar Operación</a>

#### Needed Attributes
      
* **fiso-facet** - Set this attribute with the facet name to change it's opeator.

#### Populated Classes

* **or** - The filter for this facet is using the *or* operator. Union of categories.
* **and** (default) - The filter for this facet is using the *and* operator. Intersection of categories.
* **unique** - The filter for this facet is using the *unique* operator. Single selection of category for filtering.

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

### Fisotope Selector (*fiso-selector*/*fiso-example*/)

You can generate a list of toggle filter links categories for an specific facet based on all the isotope items. This code on startup

    <div class="fiso-selector" fiso-facet="tags" >
      <ul>
        	<li class="fiso-example"><a href="#"></a></li>
      </ul>
    </div>

will change to this one

    <div class="fiso-selector and fiso-no-selected fiso-all-6 fiso-selected-0 fiso-available-6" fiso-facet="tags">
      <ul>
          <li class="">
            <a href="#" class="fiso-toggle-category and available" fiso-facet="tags" fiso-category="sports">sports</a>
          </li>
          <li class="">
            <a href="#" class="fiso-toggle-category and available" fiso-facet="tags" fiso-category="events">events</a>
          </li>
          <li class="">
            <a href="#" class="fiso-toggle-category and available" fiso-facet="tags" fiso-category="parties">parties</a>
          </li>
      </ul>
    </div>

Fisotope will look for all html elemets with the class *fiso-selector*. Inside each one will look for an html element with the class *fiso-example* and will clone it as many times as categories can found for that facet in all items. In each one will search for a link element and transform it into a toggle filter link.

#### Needed Attributes
      
* **fiso-facet** - Set this attribute with the facet to generate it's categories.

#### Populated Classes

* **or** - The filter for this facet is using the *or* operator.
* **and** (default) - The filter for this facet is using the *and* operator.
* **unique** - The filter for this facet is using the *unique* operator.
* **fiso-no-categories** - There are no categories for this facet.
* **fiso-no-selected** - There are no selected categories for this facet.
* **fiso-no-available** - There are no available categories for this facet.
* **fiso-no-eligible** - There are no eligible categories for this facet.
* **fiso-all-`number`** - The number part of the class is completed with the categories count for this facet.
* **fiso-selected-`number`** - The number part of the class is completed with the selected categories count for this facet.
* **fiso-available-`number`** - The number part of the class is completed with the available categories count for this facet.
* **fiso-eligible-`number`** - The number part of the class is completed with the eligible categories count for this facet.

### Sort Links (*fiso-sort-facet*)

A link that lets you sort your items. You have to previously configure it on your isotope setup.

    <a href="#" class="fiso-sort-facet" fiso-sort="tags_count" fiso-sort-order="desc">By count</a>

#### Needed Attributes
      
* **fiso-sort** - Set this attribute with the facet name plus *_count*. For example, *tags_count* or some of the following generic options.

  * **random** - Random Order
  * **original-order** - Html original Order
  * **(your_defined_sort)** - You can set a new order in isotope configuration.

* **fiso-sort-order** - This attribute sets the order. Posible values are **desc**, **asc** (default).

### Query Input (*fiso-search*)

An html input where you can search for any text element inside any of your items.

    <input type="text" class="fiso-search" name="query" placeholder="Search" />

