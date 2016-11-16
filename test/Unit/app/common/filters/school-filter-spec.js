describe('Test School Filter', function () {
    var $filter;

    beforeEach(module('pm.commonModule'));

    beforeEach(inject(function (_$filter_) {
        $filter = _$filter_;
    }));

    it('return undefined - cause school empty', function () {
        var school = {};

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('undefined - ');
    });

    it('return uai - cause type, name, city undefined and uai not defined', function () {
        var school = {
            type: undefined,
            name: undefined,
            city: undefined,
            uai: "uai"
        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('uai - ');
    });
    
    it('return uai - cause type null, name & city undefined and uai not defined', function () {
        var school = {
            type: null,
            name: undefined,
            city: undefined,
            uai: "uai"
        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('uai - ');
    });
    
    it('return uai - cause type "", name & city undefined and uai not defined', function () {
        var school = {
            type: '',
            name: undefined,
            city: undefined,
            uai: "uai"
        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('uai - ');
    });
    
    it('return uai - cause type "", name & city undefined', function () {
        var school = {
            type: '',
            name: undefined,
            city: undefined,
            uai: "uai"
        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('uai - ');
    });
    
    it('return uai - cause name null, type & city undefined', function () {
        var school = {
            type: undefined,
            name: null,
            city: undefined,
            uai: "uai"
        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('uai - ');
    });
    
    it('return uai - cause city null, type & name undefined', function () {
        var school = {
            type: undefined,
            name: undefined,
            city: null,
            uai: "uai"
        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('uai - ');
    });
    
    it('return uai - string type & city undefined', function () {
        var school = {
            type: 'string',
            name: null,
            city: undefined,
            uai: "uai"

        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('uai - string ');
    });
    
    it('return  - string type & city undefined', function () {
        var school = {
            type: 'string',
            name: null,
            city: undefined,
            uai: ""

        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual(' - string ');
    });
    
    it('return La Garosse cause type & city undefined', function () {
        var school = {
            type: '',
            name: 'La Garosse',
            city: undefined,
            uai: ""
        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('La Garosse');
    });
    
    it('return Los Angeles cause name null, type undefined', function () {
        var school = {
            type: undefined,
            name: null,
            city: 'Los Angeles',
            uai: ""
        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('Los Angeles');
    });
    
    it('return Collège Los Angeles cause name null', function () {
        var school = {
            type: 'Collège',
            name: null,
            city: 'Los Angeles',
            uai: ""
        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('Collège Los Angeles');
    });
    
    it('return Collège La Garosse cause city ""', function () {
        var school = {
            type: 'Collège',
            name: 'La Garosse',
            city: '',
            uai: ""
        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('Collège La Garosse');
    });
    
    it('return La Garosse cause name null, type undefined', function () {
        var school = {
            type: '',
            name: 'La Garosse',
            city: 'Los Angeles',
            uai: ""
        };

        var result = $filter('pmCommonSchoolFilter');

        expect(result(school)).toEqual('La Garosse');
    });
    
    
});