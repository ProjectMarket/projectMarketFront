describe('Unit testing great quotes', function () {
    var $compile,
            $rootScope;

    // Load the myApp module, which contains the directive
    beforeEach(module('pm.commonModule'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function (_$compile_, _$rootScope_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('label contains good settings ', function () {
        
        var element = $compile("<pm-form-element-select><label></label></pm-form-element-select>")($rootScope);
        
        $rootScope.$digest();       
        
        expect(element.html()).toContain('<label layout="row" layout-align="start center" layout-align-gt-md="end center" flex-sm="100" flex-md="100" flex-gt-md="10"');             
    });
    it('ui-select contains good settings ', function () {
        
        //Compile un morceau de HTML contenant la directive
        var element = $compile("<pm-form-element-select><ui-select></ui-select></pm-form-element-select>")($rootScope);
        
        $rootScope.$digest();
      
        expect(element.html()).toContain('<ui-select flex-sm="100" flex-md="100" flex-gt-md="25"');          
        
    });
});

