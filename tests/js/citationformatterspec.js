/*
 * This file is part of Zenodo.
 * Copyright (C) 2014 CERN.
 *
 * Zenodo is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Zenodo is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Zenodo. If not, see <http://www.gnu.org/licenses/>.
 *
 * In applying this licence, CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

function seriously_javascript___() {
    require.config({
        paths: {
            "jquery": "helpers/jquery",
            "jasmine": "helpers/jasmine", //alias jasmine-core
            "jasmine-html": "helpers/jasmine-html",
            "jasmine-ajax": "helpers/jasmine-ajax",
            "jasmine-boot": "helpers/boot",
            "flight": "helpers/flight/lib/flight",
            "jasmine-flight": "helpers/jasmine-flight",
            "jasmine-jquery": "helpers/jasmine-jquery"
        },
        shim: {
            jquery: {
                exports: "$"
            },
            "jasmine": {
                exports: "jasmineRequire"
            },
            "jasmine-boot": {
                deps: ["jasmine", "jasmine-html"],
                exports: "jasmine"
            },
            "jasmine-jquery": {
                deps: ["jquery", "jasmine-boot"],
                exports: "jasmine"
            },
            "jasmine-ajax": {
                deps: ["jasmine-boot"],
                exports: "jasmine"
            },
            "jasmine-html": {
                deps: ["jasmine"],
                exports: "jasmineRequire"
            },
            "jasmine-flight": {
                deps: ["jasmine-boot", "jasmine-jquery", "flight"],
                exports: "jasmine"
            }
            //"vendors/jasmine/lib/jasmine-core/boot": {
            //    deps: ["jasmine-html"],
            //    exports: "window.onload"
            //},

            //"jasmine-initialization": {
            //  deps: ["jasmine-boot"]
            //},
            //
        }
    });

    require(["jquery", "jasmine", "jasmine-html", "jasmine-boot", "flight", "jasmine-flight", "jasmine-jquery", "jasmine-ajax"],
        //$,jasmine,jasmine_html,boot,flight
        function () {
            describeComponent('js/citationformatter/citationformatter', function () {

                it('should always work', function () {
                    expect(0).toBe(0)
                });

                //Initia1lize the component and attach it to the DOM
                beforeEach(function () {

                    jasmine.Ajax.install();
                    setupComponent(
                        '<div id="citationformatter" data-doi="10.1234/foo.bar">' +
                        '<span class="citation"></span>' +
                        '<select class="styles">' +
                        '<option value="apa">apa</option>' +
                        '<option value="nature">nature</option>' +
                        '</select></div>');
                });

                afterEach(function () {
                    jasmine.Ajax.uninstall();
                });

                it('should be defined', function () {
                    expect(this.component).toBeDefined();
                    expect(this.component.$node).toHaveId('citationformatter');
                    expect(this.component.$node.data('doi')).toEqual('10.1234/foo.bar');
                    expect(this.component.$node.find('.citation')).toBeDefined();
                    expect(this.component.$node.find('.styles')).toBeDefined();
                });

                it('should set attr.stylesSelector', function () {
                    this.setupComponent({
                        stylesSelector: '.citation-styles-selector'
                    });
                    expect(this.component.attr.stylesSelector).toEqual(
                        '.citation-styles-selector');
                });
                // TODO finish THIS.
            });
        });
}

describe("/",function(){
    it("LOLO JAVASCRIPT",function(){
            requirejs.config({
        paths: {
            "jquery": "helpers/jquery",
            "jasmine": "helpers/jasmine", //alias jasmine-core
            "jasmine-html": "helpers/jasmine-html",
            "jasmine-ajax": "helpers/jasmine-ajax",
            "jasmine-boot": "helpers/boot",
            "flight": "helpers/flight/lib/flight",
            "jasmine-flight": "helpers/jasmine-flight",
            "jasmine-jquery": "helpers/jasmine-jquery"
        },
        shim: {
            jquery: {
                exports: "$"
            },
            "jasmine": {
                exports: "jasmineRequire"
            },
            "jasmine-boot": {
                deps: ["jasmine", "jasmine-html"],
                exports: "jasmine"
            },
            "jasmine-jquery": {
                deps: ["jquery", "jasmine-boot"],
                exports: "jasmine"
            },
            "jasmine-ajax": {
                deps: ["jasmine-boot"],
                exports: "jasmine"
            },
            "jasmine-html": {
                deps: ["jasmine"],
                exports: "jasmineRequire"
            },
            "jasmine-flight": {
                deps: ["jasmine-boot", "jasmine-jquery", "flight"],
                exports: "jasmine"
            }
            //"vendors/jasmine/lib/jasmine-core/boot": {
            //    deps: ["jasmine-html"],
            //    exports: "window.onload"
            //},

            //"jasmine-initialization": {
            //  deps: ["jasmine-boot"]
            //},
            //
        }
    });

            requirejs(["jquery", "jasmine", "jasmine-html", "jasmine-boot", "flight", "jasmine-flight", "jasmine-jquery", "jasmine-ajax"],function(q){
                alert("require callback");

            });

        alert("SEQUENCE OK")
    })
});