/*
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2014 hybris AG
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of hybris
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with hybris.
 */

'use strict';

/**
 *	Localized Addresses: dynamic address forms based on user selection of localization.
 **/

angular.module('ds.addresses').
    directive('localizedAddresses', ['$compile', '$http', '$templateCache', function($compile, $http, $templateCache) {

    	var initialize = function(scope, elem, viewType){
			//set default template type
			loadTemplate(scope, elem, '', viewType);
		}

		var loadTemplate = function(scope, elem, locale, viewType){
			//load dynamic address template into scope
            var tempLoader = getTemplate(locale, viewType);
            var promise = tempLoader.success(function(template) {
            	elem.html(template).show();
            }).then(function (response) {
                $compile(elem.contents())(scope);
            });
    	}

        var getTemplate = function(locale, viewType) {
            var templateLoader,/*templateMap,*/ templateUrl,
            baseUrl = 'js/app/addresses/templates/';

            // templateMap = {
            // 	USA : 'address-USA.html',
            // 	CAN : 'address-CAN.html',
            // 	UK  : 'address-UK.html',
            // 	JPN : 'address-JPN.html',
            // 	CHI : 'address-CHI.html',
            // 	GER : 'address-GER.html',
            // 	def : 'address-default.html'
            // };

            // if view is not recognized set default template
	        if( locale!='USA' && locale!='CAN' && locale!='CHI' && locale!='JPN' && locale!='UK' && locale!='GER'){
	            locale = 'Default';
	        }

            // templateUrl = baseUrl + viewType + '/' + templateMap[locale];
            templateUrl = baseUrl + viewType + locale + '.html';
            templateLoader = $http.get(templateUrl, {cache: $templateCache});

            return templateLoader;
        }

        var templateLinker = function(scope, element, attrs) {
        	var currentElement = element;
			scope.localeSelection;
			scope.localeSelections = [
				{id: 'USA', name:'USA'},
				{id: 'CAN', name:'CANADA'},
				{id: 'CHI', name:'CHINA'},
				{id: 'JPN', name:'JAPAN'},
				{id: 'UK',  name:'UK'},
				{id: 'GER', name:'GERMANY'}];

			//localization selection handler
			scope.changeLocale = function(locale){

				loadTemplate(scope, element, locale.id, attrs.type);
			}

	        initialize(scope, element, attrs.type);
        }

        return {
        	scope: {
        		type: '='
        	},
            restrict: 'E',
            link: templateLinker
        };
    }]);
