// the semi-colon before function invocation is a safety net against 
// concatenated scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {
    "use strict";

    // undefined is used here as the undefined global variable in ECMAScript 3 
    // is mutable (ie. it can be changed by someone else). undefined isn't 
    // really beingpassed in so we can ensure the value of it is truly 
    // undefined. In ES5, undefined can no longer be modified.

    // window and document are passed through as local variable rather than 
    // global as this (slightly) quickens the resolution process and can be 
    // more efficiently minified (especially when both are regularly referenced 
    // in your plugin).

    // Create the defaults once
    var pluginName = "fisotope",
        defaults = {
        default_operator: "and",
        default_sort_name: "original-order",
        empty_selection_behaviour: "show",
        default_sort_order: "asc",
        itemSelector: ".item",
        operators_pool: ["and", "or", "unique"]
    };

    // The actual plugin constructor
    function Plugin ( element, options, callback) {
        this.element = element;
        this.$element = $(element);
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first 
        // object is generally empty as we don't want to alter the default 
        // options for future instances of the plugin
        this.settings = $.extend( {}, defaults, options );
        this.hashDict = {};
        this._defaults = defaults;
        this.callback = callback? callback: function(){};
        this._name = pluginName;
        this.mapping = {};
        this.categories = {};
        this.facets = [];
        this.selectedFacets = {};
        this.selectedOperators = [];

        this.utils = {
          normalize: function(str) {
            var ret = [], i = 0, j = str.length, c = 0;
            for ( i = 0; i < j; i++ ) {
              c = str.charAt( i );
              if( this.mapping.hasOwnProperty( str.charAt( i ) ) ) {
                ret.push( this.mapping[ c ] );
              } else {
                ret.push( c );
              }
            }
            return ret.join( "" );
          },
          unique: function(array){
            return $.grep(array,function(el,index){
                return index === $.inArray(el,array);
            });
          },
          getMapFacetSelector: function(facet){
            return function(value) {
              return "[fiso-"+ facet+"*='." + value + ".']";
            };
          },
          combineSelectors: function(selectors_list, query) {
            var containsStr = "", actualSelectors, otherSelectors, answer,
                filter_x, filter_y;
            if (query) {
              containsStr = "[search-text*='"+query.toLowerCase()+"']";
            }
            if (selectors_list.length === 0) {
              return [containsStr];
            }  else {
              actualSelectors = selectors_list.pop();
              otherSelectors = this.combineSelectors(selectors_list, query);
              answer=[];
              for (filter_x in actualSelectors) {
                for (filter_y in otherSelectors) {
                  answer.push(actualSelectors[filter_x] +
                    otherSelectors[filter_y]
                  );
                }
              }
              return answer;
            }
          },
          getOperator: function(facet, operator, settings) {
            if (operator) {
              return operator;
            }
            if (settings.default_facet_operator &&
                settings.default_facet_operator[facet] ) {
              return this.settings.default_facet_operator[facet];
            }
            return settings.default_operator;
          },
          getNextOperator: function(operator, pool)
          {
            var actual_index = pool.indexOf(operator),
                next_index = actual_index + 1;
            next_index = next_index === pool.length ? 0 : next_index;
            return pool[next_index];
          },
          getCategoriesFromAttribute: function(attribute) {
            if (attribute) {
              return $.grep(attribute.split("."),
                function(el) {
                  return el.length > 0;
                }
              );
            }
            return [];
          },
          switchFacetCategory: function(category, operator, categories){
            var new_categories = "." + category + ".",
                category_exist;
            categories = categories ? categories : ".";
            category_exist = categories.indexOf("." + category + ".") >= 0;
            switch (operator) {
              case "and":
              case "or":
                if (category_exist){
                  new_categories = categories.replace(
                    "." + category + ".", ".");
                } else {
                  new_categories = categories + category + ".";
                }
                break;
              case "unique":
                if (category_exist) {
                  new_categories = "";
                }
                else {
                  new_categories = "." + category + ".";
                }
                break;
            }
            return new_categories !== "." ? new_categories : "";
          },
          getJqueryFilter: function(facets, operators, query, settings) {
            var facets_selectors_list = [], facet, operator, categories,
                categories_mapped, selectors_list;
            for (facet in facets) {
              operator = this.getOperator(
                facet, operators[facet], settings);
              categories = facets[facet];
              if (categories.length > 0) {
                categories_mapped = $.map(categories,
                  this.getMapFacetSelector(facet));
                switch (operator) {
                  case "or":
                    facets_selectors_list.push(categories_mapped);
                    break;
                  case "and":
                    facets_selectors_list.push([categories_mapped.join("")]);
                    break;
                  case "unique":
                    facets_selectors_list.push(
                      [categories_mapped[categories_mapped.length-1]]);
                    break;
                }
              }
            }

            selectors_list = this.combineSelectors(
              facets_selectors_list, query);
            if ( settings.empty_selection_behaviour === "hide" &&
                selectors_list.length === 0 ) {
              return  ".asdlkfasdlkasdfkl32923u42kj349";
            }
            return selectors_list.join();
          },
          isEligible: function(facet, category, plugin) {
            var newSelectedFacets = jQuery.extend(true, {}, plugin.selectedFacets),
                index, selector;
            if ( ! newSelectedFacets[facet] ) {
              newSelectedFacets[facet] = [category];
            } else {
              index = newSelectedFacets[facet].indexOf(category);
              if (index < 0 ) {
                newSelectedFacets[facet].push(category);
              } else {
                newSelectedFacets[facet].splice(index,1);
              }

            }
            selector = this.getJqueryFilter(newSelectedFacets,
              plugin.selectedOperators,
              plugin.hashDict.query, plugin.settings);
            if (selector) {
              return $(selector).length > 0;
            }
            return true;
          },
          getSelectedCategories: function(facet, operator, selCats) {
            if (selCats) {
              switch (operator) {
                case "unique":
                  return [selCats[selCats.length-1]];
                default:
                  return selCats;
              }
            }
            return [];
          },
          getEligibleCategories: function(facet, categories, plugin ) {
            var eligibleCategories = [], index;
            for ( index in categories) {
              if ( this.isEligible(facet, categories[index], plugin)){
                eligibleCategories.push(categories[index]);
              }
            }
            return eligibleCategories;
          },
          getAvailableCategories: function(facet, plugin) {
            var answer = [], utils = this, theObj, atributo, selector;
            selector = this.getJqueryFilter(plugin.selectedFacets,
              plugin.selectedOperators,
              plugin.hashDict.query, plugin.settings);
            if (selector) {
              $(selector).each(function(index, value) {
                theObj = $(value);
                atributo = theObj.attr("fiso-" + facet);
                answer = answer.concat(
                  utils.getCategoriesFromAttribute(atributo));
              });

              answer = this.unique(answer);
              answer = $.grep(answer, function(value){
                return $.inArray(value, plugin.selectedCategories) < 0;
              });
            } else {
              answer = plugin.categories[facet];
            }


            answer.sort();
            answer.reverse();
            return answer;
          },
          updateSearch: function(query){
            var $search = $("input.fiso-search");
            $search.val(query);
          },
          updateTotals:function() {
            var totalCounterObj = $(".fiso-total-counter"),
                totalHiddenCounterObj = $(".fiso-total-hidden"),
                totalVisibleCounterObj = $(".fiso-total-visible"),
                totalItems = $(".isotope-item").length,
                totalHidden = $(".isotope-item.isotope-hidden").length,
                totalVisible = totalItems - totalHidden,
                theObj,
                childHidden,
                childVisible;
            totalCounterObj.text(totalItems);
            totalHiddenCounterObj.text(totalHidden);
            totalVisibleCounterObj.text(totalVisible);

            $(".global-info-childs").each(function(){
              theObj = $(this);
              childHidden = theObj.children(
                ".isotope-item.isotope-hidden").length;
              childVisible = totalItems - totalHidden;
              theObj.attr("visible", childVisible);
              theObj.attr("hidden", childHidden);
            });
          },
          updateCategoryStatus: function(facet, status, linkObjs, statusCategories) {
            var statusSelectors, statusObjects, facetStatusCounter;
            if ( linkObjs != null ) {
              linkObjs.addClass("not-" + status);
              statusSelectors = $.map(statusCategories,
                function(value){
                  return (".fiso-toggle-category[fiso-category=\"" +
                    value + "\"]");
                }
              );
              statusObjects = $(statusSelectors.join());
              statusObjects.removeClass("not-" + status);
              statusObjects.addClass(status);
            }

            // Update fiso-counter-selected text
            facetStatusCounter = $(".fiso-counter-"+ status +
              "[fiso-facet=\"" +  facet + "\"]");
            facetStatusCounter.text(statusCategories.length);
          },
          updateSelectorStatus: function(status, selectorObj, statusCategories){
            var selectedObjs;
            if ( statusCategories.length === 0) {
              selectorObj.addClass("fiso-no-" + status);
            }

            selectedObjs = selectorObj.find(".fiso-toggle-category." +
             status);
            if (selectorObj.length > 0) {
              selectedObjs.first().addClass("first-" + status);
              selectedObjs.last().addClass("last-" + status);
            }

            selectorObj.addClass("fiso-" + status + "-" +
              statusCategories.length);
          },
          updateFacet: function(facet, operator, plugin) {
            var linkObjs = $(
                  ".fiso-toggle-category[fiso-facet=\"" + facet + "\"]"),
                linkOpObjs = $(
                  ".fiso-toggle-facet[fiso-facet=\"" + facet + "\"]"),
                selectedCategories = this.getSelectedCategories(
                  facet, operator, plugin.selectedFacets[facet]),
                availableCategories = this.getAvailableCategories(
                  facet, plugin),
                eligibleCategories = this.getEligibleCategories(
                  facet, plugin.categories[facet], plugin),
                removeClasses,
                utils,
                selectorObj,
                allClass,
                answerClass,
                theClass;

            // Clean fiso-toggle-category
            removeClasses = ( "or and unique selected eligible " +
              "not-eligible available not-available first-selected " +
              "last-selected not-selected first-available last-available" );
            linkObjs.removeClass(removeClasses);
            linkOpObjs.removeClass("or and unique");

            // Update operators
            linkObjs.addClass(operator);
            linkOpObjs.addClass(operator);

            this.updateCategoryStatus(facet, "selected", linkObjs,
              selectedCategories);
            this.updateCategoryStatus(facet, "available", linkObjs,
              availableCategories);
            this.updateCategoryStatus(facet, "eligible", linkObjs,
              eligibleCategories);
            this.updateCategoryStatus(facet, "all", null, plugin.categories);

            // Update selector
            utils = this;
            $(".fiso-selector[fiso-facet=\"" + facet + "\"]").each(function() {
              selectorObj = $(this);

              // Clean
              removeClasses = ("or and unique fiso-no-categories " +
               "fiso-no-eligible fiso-no-selected fiso-no-available" );
              selectorObj.removeClass(removeClasses);
              selectorObj.removeClass (function () {
                allClass = $(this).attr("class").split(" ");
                answerClass = [];
                for ( var index in allClass ) {
                  theClass = allClass[index];
                  if  (
                    theClass.indexOf("fiso-selected") === 0 ||
                    theClass.indexOf("fiso-all") === 0 ||
                    theClass.indexOf("fiso-available") === 0 ||
                    theClass.indexOf("fiso-eligible") === 0
                    ) {
                    answerClass.push(theClass);
                  }
                }
                return answerClass.join(" ");
              });

              // Update selector
              selectorObj.addClass(operator);

              utils.updateSelectorStatus("selected",
                selectorObj, selectedCategories);
              utils.updateSelectorStatus("available",
                selectorObj, availableCategories);
              utils.updateSelectorStatus("eligible",
                selectorObj, eligibleCategories);
              utils.updateSelectorStatus("all",
                selectorObj, plugin.categories);

            });
          },
        };

        this.events = {
          urlChanged: function(event) {
            event.data.filterItems();
            event.data.updateInfo();
            return event.preventDefault();
          },
          toggleFacet: function(event) {
            var $element = $(this),
                facet = $element.attr("fiso-facet"),
                fop_key = facet + "_op",
                operator = event.data.utils.getOperator(facet,
                  event.data.hashDict[fop_key], event.data.settings);
            
            event.data.hashDict[fop_key] = event.data.utils.getNextOperator(
              operator, event.data.settings.operators_pool);
            window.location.hash = $.param(event.data.hashDict);
            return event.preventDefault();
          },
          toggleQuery: function(event) {
            var kwd = $(this).val();
            event.data.hashDict.query = kwd;
            window.location.hash = $.param(event.data.hashDict);
            return event.preventDefault();
          },
          toggleSort: function(event) {
            var $element = $(this),
                sort_str = $element.attr("sort-by"),
                order_srt = $element.attr("sort-order"),
                order = order_srt ? order_srt : event.data.settings.sort_default;
            
            event.data.hashDict.sort = sort_str;
            event.data.hashDict.sort_order = order;
            window.location.hash = $.param(event.data.hashDict);
            return event.preventDefault();
          },
          toggleFacetCategory: function(event) {
            var $element = $(this),
                facet = $element.attr("fiso-facet"),
                category = $element.attr("fiso-category"),
                operator = event.data.utils.getOperator(facet,
                  event.data.hashDict[facet + "_op"], event.data.settings),
                facet_key = facet + "_cats",
                new_facet_categories = event.data.utils.switchFacetCategory(
                  category, operator, event.data.hashDict[facet_key]);
            
            event.data.hashDict[facet_key] = new_facet_categories;
            window.location.hash = $.param(event.data.hashDict);
            return event.preventDefault();
          },
          clearFacet: function(event) {
            var $element = $(this),
                facet = $element.attr("fiso-facet");
            switch(facet){
              case "query":
                delete event.data.hashDict.query;
                break;
              case "sort":
                delete event.data.hashDict.sort;
                delete event.data.hashDict.sort_order;
                break;
              case "all":
                event.data.hashDict = {};
                break;
              default:
                delete event.data.hashDict[facet + "_cats"];
                delete event.data.hashDict[facet + "_op"];
                break;
            }
            window.location.hash = $.param(event.data.hashDict);
            return event.preventDefault();
          }
        };
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.settings
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.settings).

            // Initialize default sort methods
            var atributos = this.$element.find(
                  this.settings.itemSelector)[0].attributes,
                sort_default = { getSortData: {} },
                default_sort_method = function ( itemElem ) {
                  return $(itemElem).attr(value).split(".").length - 2;
                },
                index, jndex, value, name, plugin, $element, facet, $example,
                exampleParent, categories, category, newEle, newEleLink,
                from, to, search_text;

            for ( index = 0; index < atributos.length; index++ ){
              value = atributos[index].name;
              if ( value.indexOf("fiso-") === 0 ) {
                name = value.substr(5);
                sort_default.getSortData[name + "_count"]  = default_sort_method;
              }
            }
            $.extend(true, this.settings, sort_default);

            // Init Isotope
            this.$element.isotope(this.settings, this.callback);

            // Reload Facet and Categories
            this.reloadFacetAndCategories();

            // Init Selectors
            plugin = this;
            $(".fiso-selector").each(function() {
              $element = $(this);
              facet = $element.attr("fiso-facet");
              $example = $element.find(".fiso-example");
              if ( facet && $example.length > 0 ) {
                exampleParent = $example.parent();
                categories = plugin.categories[facet];
                if (categories) {
                  for ( index = 0; index < categories.length; index++ ) {
                    category = categories[index];
                    newEle = $example.clone();
                    newEle.removeClass("fiso-example");
                    newEleLink = newEle.find("a").andSelf().filter("a");
                    newEleLink.append(category);
                    newEleLink.addClass("fiso-toggle-category");
                    newEleLink.attr("fiso-facet", facet);
                    newEleLink.attr("fiso-category", category);
                    exampleParent.prepend(newEle);
                  }
                }
                $example.remove();
              }
            });

            // Initialize Search, preprocess text for quicker searching
            from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç";
            to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc";

            $(this.settings.itemSelector).each(function() {
              search_text = $(this).text().replace(/\s+/g, " ").toLowerCase();
                $(this).attr("search-text", search_text);
            });
            $.expr[":"].contains = function(a, i, m) {
              return this.utils.normalize($(a).text().toUpperCase())
                  .indexOf(this.utils.normalize(m[3].toUpperCase())) >= 0;
            };
            for(index = 0, jndex = from.length; index < jndex; index++ ) {
                this.mapping[ from.charAt( index ) ] = to.charAt( index );
            }

            // Bindings
            $(window).bind( "hashchange.fisotope", this,
              this.events.urlChanged).trigger("hashchange");
            $("a.fiso-toggle-category").bind( "click.fisotope", this,
              this.events.toggleFacetCategory);
            $("a.fiso-clear-facet").bind( "click.fisotope", this,
              this.events.clearFacet);
            $("a.fiso-toggle-facet").bind( "click.fisotope", this,
              this.events.toggleFacet);
            $("a.toggle-sort").bind( "click.fisotope", this,
              this.events.toggleSort);
            $("input.fiso-search").bind( "keyup.fisotope", this,
              this.events.toggleQuery) ;
        },

        parseHash: function() {
          var hashOptions = document.location.hash.substring(1).split("&"),
              index, option, facet, categories;
          this.selectedFacets = {};
          this.selectedOperators = [];
          this.hashDict = {};
          for ( index in hashOptions ) {
            option = hashOptions[index].split("=");
            if (option.length === 2) {
              this.hashDict[option[0]] = option[1];
              if (option[0].indexOf("_cats") > 0) {
                facet = option[0].split("_")[0];
                categories = option[1].split(".");
                categories.splice(0,1);
                categories.splice(categories.length-1,1);
                this.selectedFacets[facet] = categories;
              } else if (option[0].indexOf("_op") > 0 ){
                this.selectedOperators[option[0].split("_")[0]] = option[1];
              }
            }
          }
        },

        reloadFacetAndCategories: function() {
          var facets_bag = [],
              categories_bag = {},
              plugin = this,
              facet,
              cat_facet;
          $(this.settings.itemSelector).each(function() {
            $.each(this.attributes, function() {
              if(this.name.indexOf("fiso-") === 0) {
                facet = this.name.split("-")[1];
                facets_bag.push(facet);
                if (!categories_bag[facet]) {
                  categories_bag[facet] = [];
                }
                categories_bag[facet] = categories_bag[facet].concat(
                  plugin.utils.getCategoriesFromAttribute(this.value));
              }
            });
          });

          this.facets = this.utils.unique(facets_bag);
          this.facets.sort();
          this.facets.reverse();

          for(cat_facet in categories_bag) {
            categories_bag[cat_facet] = this.utils.unique(categories_bag[cat_facet]);
            categories_bag[cat_facet].sort();
            categories_bag[cat_facet].reverse();
          }
          this.categories = categories_bag;

        },

        filterItems: function() {
          
          var sort, sort_order, query;

          this.parseHash();

          sort = this.hashDict.sort;
          sort_order = this.hashDict.sort_order;
          sort_order = sort_order ? sort_order : this.default_sort_order;
          query = this.hashDict.query ? this.hashDict.query : "";


          this.$element.isotope( {
              filter: this.utils.getJqueryFilter(
                this.selectedFacets, this.selectedOperators,
                query, this.settings),
              sortBy : sort ? sort : this.settings.default_sort_name,
              sortAscending: sort_order !== "desc"
            },
            this.callback
          );
        },

        updateInfo: function() {
          var index, facet, operator;

          this.utils.updateSearch(this.hashDict.query);
          this.utils.updateTotals();

          for (index in this.facets) {
            facet = this.facets[index];
            operator =  this.utils.getOperator(facet,
                  this.hashDict[facet + "_op"], this.settings);
            this.utils.getOperator(facet, operator, this.settings);
            this.utils.updateFacet(facet, operator, this);
          }
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options, callback ) {
        this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options, callback ) );
            }
        });

        // chain jQuery functions
        return this;
    };

})( jQuery, window, document );
