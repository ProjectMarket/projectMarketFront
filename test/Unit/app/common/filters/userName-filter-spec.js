describe('Test Username Filter', function () {
    var $filter;

    beforeEach(module('pm.commonModule'));

    beforeEach(inject(function (_$filter_) {
        $filter = _$filter_;
    }));

    it('return empty cause lastName missing', function () {
        var userIdentity = {
            firstName: 'Camille', 
            sex: 'f'
        };
        var format = 'civ_LN';
        
         var result = $filter('pmCommonUserNameFilter');
         
        expect(result(userIdentity, format)).toEqual('');
    });
    
    it('return empty cause firstName missing', function () {
        var userIdentity = {
            LastName: 'HONNETTE', 
            sex: 'f'
        };
        var format = 'civ_LN';
        
         var result = $filter('pmCommonUserNameFilter');
         
        expect(result(userIdentity, format)).toEqual('');
    });
    
    it('return empty cause sex missing', function () {
        var userIdentity = {
            lastName: 'HONNETTE',
            firstName: 'Camille'
        };
        var format = 'civ_LN';
        
         var result = $filter('pmCommonUserNameFilter');
         
        expect(result(userIdentity, format)).toEqual('');
    });

    it('return Mme HONNETTE', function () {
        var userIdentity = {
            lastName: 'HONNETTE',
            firstName: 'Camille',
            sex: 'f'
        };
        var format = 'civ_LN';

        var result = $filter('pmCommonUserNameFilter');

        expect(result(userIdentity, format)).toEqual('Mme HONNETTE');
    });

    it('return camille honnette', function () {
        var userIdentity = {
            lastName: 'honnette',
            firstName: 'camille',
            sex: 'f'
        };
        var format = 'fn_ln';

        var result = $filter('pmCommonUserNameFilter');

        expect(result(userIdentity, format)).toEqual('camille honnette');
    });
    
    it('return HONNETTE camille', function () {
        var userIdentity = {
            lastName: 'honnette',
            firstName: 'camille',
            sex: 'f'
        };
        var format = 'fn_ln';

        var result = $filter('pmCommonUserNameFilter');

        expect(result(userIdentity, format)).toEqual('camille honnette');
    });
    
    it('return Camille HONNETTE cause format missing', function () {
        var userIdentity = {
            lastName: 'HONNETTE',
            firstName: 'Camille',
            sex: 'f'
        };

        var result = $filter('pmCommonUserNameFilter');
        expect(result(userIdentity)).toEqual('Camille HONNETTE');
    });
    
    it('return Camille HONNETTE cause format missing', function () {
        var userIdentity = {
            lastName: 'HONNETTE',
            firstName: 'Camille',
            sex: 'f'
        };
        
        var format = 'format';

        var result = $filter('pmCommonUserNameFilter');
        expect(result(userIdentity, format)).toEqual('Camille HONNETTE');
    });
});