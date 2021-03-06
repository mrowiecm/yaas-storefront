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

describe('ProductDetailCtrl', function () {

    var $scope, $rootScope, $controller, $q, mockedCartSvc, mockedShippingZones, shippingZones, cartDef, mockedGlobalData={
        getCurrencySymbol: jasmine.createSpy('getCurrencySymbol').andReturn('USD'),
        getCurrentTaxConfiguration: jasmine.createSpy('getCurrentTaxConfiguration').andReturn({ rate: "7", label: "Includes Tax/VAT", included: false })
    };

    mockedShippingZones = [{
            'default': true,
            'id': 'europe',
            'methods': [
            {
                'id': 'fedex-2dayground',
                'name': 'FedEx 2Day',
                'active': true,
                'maxOrderValue': {
                  'amount': '200',
                  'currency': 'USD'
                },
                'fees': [
                  {
                    'minOrderValue': {
                      'amount': '0',
                      'currency': 'USD'
                    },
                    'cost': {
                      'amount': '3',
                      'currency': 'USD'
                    }
                  },
                  {
                    'minOrderValue': {
                      'amount': '50',
                      'currency': 'USD'
                    },
                    'cost': {
                      'amount': '1.89',
                      'currency': 'USD'
                    }
                  }
                ]
            }],
            'name': 'Canada',
            'shipTo': ['CA']
        }];

    var mockProduct = {
        product:{
            name: 'product1',
            id: 123,
            published: true,
            mixins: {
                inventory: false
            },
            metadata: {
                mixins: {}
            }
        },
        categories: [
            {
                id: 12345,
                name: 'fakeCat',
                slug: 'fake-cat'
            }
        ],
        prices: [{
            effectiveAmount: 24.99
        }]
    };

    var mockLastCatId = {
        id: '1234'
    };

    var mockCategorySvc = {
        getCategoryById: jasmine.createSpy().andCallFake(function(){
            return cartDef.promise;
        })
    };
    
    var mockedNotification = {
        success: jasmine.createSpy('success').andReturn('')
    };
    
    beforeEach(angular.mock.module('ds.products'));

    beforeEach(module('ds.checkout', function($provide) {
        $provide.value('shippingZones', shippingZones);
    }));

    beforeEach(inject(function ($injector, _$rootScope_, _$controller_, _$q_) {
        $q = _$q_;
        this.addMatchers({
            toEqualData: function (expected) {
                return angular.equals(this.actual, expected);
            }
        });
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $scope = $injector.get('$rootScope').$new();

        // creating the mocked service
        cartDef = $q.defer();
        mockedCartSvc = {
            addProductToCart: jasmine.createSpy().andCallFake(function(){
                return cartDef.promise;
            })
        };
    }));

    describe('initialization', function(){

        beforeEach(function () {
            $controller('ProductDetailCtrl', { $scope: $scope, $rootScope: $rootScope,
                'CartSvc': mockedCartSvc, 'product': angular.copy(mockProduct), 'lastCatId': mockLastCatId, 'GlobalData': mockedGlobalData, 'CategorySvc': mockCategorySvc, 'shippingZones': mockedShippingZones, 'Notification': mockedNotification, 'variants': [], 'variantPrices': []});
        });

       it('should set the category for the breadcrumb', function(){
          expect($scope.category).toBeTruthy();
       });
    });

    describe('buy published product', function () {

        beforeEach(function () {
            $controller('ProductDetailCtrl', { $scope: $scope, $rootScope: $rootScope,
                'CartSvc': mockedCartSvc, 'product': angular.copy(mockProduct), 'lastCatId': mockLastCatId, 'GlobalData': mockedGlobalData, 'CategorySvc': mockCategorySvc, 'shippingZones': mockedShippingZones, 'Notification': mockedNotification, 'variants': [], 'variantPrices': []});
        });

        it('should add to cart from detail page', function () {
            $scope.addToCartFromDetailPage();
            expect(mockedCartSvc.addProductToCart).toHaveBeenCalled();
        });

        it('should disable Buy button', function () {
            $scope.addToCartFromDetailPage();
            expect($scope.buyButtonEnabled).toBeFalsy();
        });

        it('should set error msg on error', function(){
            $scope.addToCartFromDetailPage();
            cartDef.reject();
            $scope.$apply();
            expect($scope.error).toBeTruthy();
        });

        it('should re-enable buy button on error', function(){
            console.log($scope.product);
            $scope.addToCartFromDetailPage();
            cartDef.reject();
            $scope.$apply();
            expect($scope.buyButtonEnabled).toBeTruthy();
        });

    });

    describe('quantity change', function () {


        beforeEach(function () {
            $controller('ProductDetailCtrl', { $scope: $scope, $rootScope: $rootScope,
                'CartSvc': mockedCartSvc, 'product': angular.copy(mockProduct), 'lastCatId': mockLastCatId, 'GlobalData': mockedGlobalData, 'CategorySvc': mockCategorySvc, 'shippingZones': mockedShippingZones, 'Notification': mockedNotification, 'variants': [], 'variantPrices': []});
        });

        it('should disable buy button on invalid qty', function () {
            $scope.productDetailQty = '';
            $scope.changeQty();
            expect($scope.buyButtonEnabled).toBeFalsy();
        });

        it('should enable buy button on valid qty', function () {
            $scope.productDetailQty = 3;
            $scope.changeQty();
            expect($scope.buyButtonEnabled).toBeTruthy();
        });
    });

    describe('onCartUpdated', function () {

        beforeEach(function () {
            $controller('ProductDetailCtrl', { $scope: $scope, $rootScope: $rootScope,
                    'CartSvc': mockedCartSvc, 'product': angular.copy(mockProduct),'lastCatId': mockLastCatId,  'GlobalData': mockedGlobalData, 'CategorySvc': mockCategorySvc, 'shippingZones': mockedShippingZones,  'Notification': mockedNotification, 'variants': [], 'variantPrices': []});
            $scope.addToCartFromDetailPage();
        });

        it('should call addProductToCart on CartSvc', function(){
            $scope.addToCartFromDetailPage();
            expect(mockedCartSvc.addProductToCart).toHaveBeenCalled();    
        });
        
        it('should show success notification', function(){
            cartDef.resolve();
            $rootScope.$apply(); //propogate resolve so .then is called
            expect(mockedNotification.success).toHaveBeenCalled();
        });
    });

    describe('productWithMainImage', function(){
        var mockProductWithMain = {
            product: {
                name: 'product1',
                published: true,
                media: [
                    { url: 'http://url1' },
                    { url: 'http://url2' },
                    { url: 'http://url3' }
                ],
                mixins: {
                    inventory: false
                },
                metadata: {
                    mixins: {}
                }
            }
        };

        beforeEach(function(){
            $controller('ProductDetailCtrl', { $scope: $scope, $rootScope: $rootScope,
                'CartSvc': mockedCartSvc, 'product': mockProductWithMain, 'lastCatId': mockLastCatId,  'GlobalData': mockedGlobalData, 'CategorySvc': mockCategorySvc, 'shippingZones': mockedShippingZones, 'Notification': mockedNotification, 'variants': [], 'variantPrices': []});
        });

        it('should list committed images as they came', function(){
            expect($scope.product.media[0].url).toEqualData('http://url1');
            expect($scope.product.media[1].url).toEqualData('http://url2');
            expect($scope.product.media[2].url).toEqualData('http://url3');
        });
    });

    describe('productWithoutMainImage', function(){
        var mockProductWithImages = {
            product:{
                name: 'product1',
                id: 123,
                published: true,
                media: [
                    { url: 'http://url1' },
                    { url: 'http://url2' }
                ],
                mixins: {
                    inventory: false
                },
                metadata: {
                    mixins: {}
                }
            },
            categories: [
                {
                    id: 12345,
                    name: 'fakeCat',
                    slug: 'fake-cat'
                }
            ],
            prices: [{
                effectiveAmount: 24.99
            }]
        };

        beforeEach(function(){
            $controller('ProductDetailCtrl', { $scope: $scope, $rootScope: $rootScope,
                'CartSvc': mockedCartSvc, 'product': mockProductWithImages, 'lastCatId': mockLastCatId,  'GlobalData': mockedGlobalData, 'CategorySvc': mockCategorySvc, 'shippingZones': mockedShippingZones, 'Notification': mockedNotification, 'variants': [], 'variantPrices': []});
        });

        it('should list first image first', function(){
            expect($scope.product.media[0].url).toEqualData('http://url1');
            expect($scope.product.media[1].url).toEqualData('http://url2');
        });
    });

    describe('taxConfiguration', function () {
        it ('should shorten the tax label and add a see more button if the label has more than 60 chars', function () {

            var longTaxLabel = 'Long Tax Label Long Tax Label Long Tax Label Long Tax Label Long Tax Label Long Tax Label Long Tax Label Long Tax Label Long Tax Label Long Tax Label ';

            mockedGlobalData={
                getCurrencySymbol: jasmine.createSpy('getCurrencySymbol').andReturn('USD'),
                getCurrentTaxConfiguration: jasmine.createSpy('getCurrentTaxConfiguration').andReturn({ rate: '7', label: longTaxLabel, included: false })
            };
            $controller('ProductDetailCtrl', { $scope: $scope, $rootScope: $rootScope,
                'CartSvc': mockedCartSvc, 'product': angular.copy(mockProduct), 'lastCatId': mockLastCatId, 'GlobalData': mockedGlobalData, 'CategorySvc': mockCategorySvc, 'shippingZones': mockedShippingZones, 'Notification': mockedNotification, 'variants': [], 'variantPrices': []});

            var expectedShortenedLabel = longTaxLabel.substring(0, 59);
            expect($scope.taxConfiguration.shortenedLabel).toEqualData(expectedShortenedLabel);
            expect($scope.taxConfiguration.seeMoreClicked).toBeDefined();
        });
    });


});
