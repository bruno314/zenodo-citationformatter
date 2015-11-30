/**
 * Defines a suite of flight component specifications.
 *
 * Wraps a Jasmine describe block inside a require statement
 * so that each spec is executed after the component is loaded.
 * The loaded compoent is available as this.Component.
 *
 * @example
 * describeComponent('app/components/example_component.js', function() {
 *   it('loads the component as this.Component', function() {
 *     expect(this.Component).toBeDefined();
 *   });
 * });
 *
 * @param {string} path - The path to a file defining the component.
 * @param {specs} specs - The specifications of the component.
 */
var describeComponent = function(path, specs) {
  jasmine.getEnv().describeComponent(path, specs);
};

/**
 * Defines a suite of flight mixin specifications.
 *
 * Wraps a Jasmine describe block inside a require statement
 * so that each spec is executed after the component and mixin are loaded.
 * The loaded mixin is available as this.Mixin.
 * The compoent with the mixin is available as this.Component.
 *
 * @example
 * describeMixin('app/mixins/example_mixin.js', function() {
 *   it('loads the component as this.Component', function() {
 *     expect(this.Component).toBeDefined();
 *   });
 * });
 *
 * @param {string} path - The path to a file defining the mixin.
 * @param {specs} specs - The specifications of the mixin.
 */
var describeMixin = function(path, specs) {
  return jasmine.getEnv().describeMixin(path, specs);
}

/**
 * Initializes an instance of the flight component and the node that the component uses.
 * The initialized component is available as this.component.
 * The initialized node is available as this.$node.
 *
 * prepareComponent(html);
 *
 * @param {ObjectOrStringOrjQuery} optiosOrHtmlOrjQuery - If an object, this is the
 * options to be passed to new component. If a string, this is the HTML to be used as
 * the node for the component. If a jQuery, this is the node for the component.
 * @param {Object} options - If first argument is given and is not an object, this is
 * the options to be passed to new component.
 */
var prepareComponent = function(optionsOrHtmlOrjQuery, options) {
  jasmine.getEnv().currentSpec.prepareComponent(optionsOrHtmlOrjQuery, options);
};

(function() {
  beforeEach(function () {
    $.fx.off = true;
    $("<div id='fixture_container' />").appendTo('body');
  });

  afterEach(function () {
    $('#fixture_container').remove();
    document.body.className = '';  // remove body classes to avoid test pollution
    window.location.hash = '';
    delete this.component;
    delete this.Mixin;
    delete this.Component;
    delete this.pageName;
    delete this.sectionName;
    delete this.Module;
  });

  jasmine.Env.prototype.describeComponent = function(path, specs) {
    describe(path, function() {
      beforeEach(function() {
        var self = this
          , done = false;
        runs(function() {
          require([path], function(Component) {
            self.Component = Component;
            done = true;
          });
        });
        waitsFor(function() { return done; });
      });

      afterEach(function() {
        var done = false;
        runs(function() {
          require([path], function(Component) {
            Component.teardownAll();
            done = true;
          });
        });
        waitsFor(function() { return done; });
      });

      specs.apply(this);
    });
  };

  jasmine.Env.prototype.describeMixin = function(path, specs) {
    describe(path, function() {
      beforeEach(function() {
        var self = this
          , done = false;
        runs(function() {
          require(['components/flight/lib/component', path], function(defineComponent, Mixin) {
            self.Mixin = Mixin
            self.Component = defineComponent(Mixin);
            done = true;
          });
        });
        waitsFor(function() { return done; });
      });

      afterEach(function() {
        this.Component.teardownAll();
      });

      specs.apply(this);
    });
  };

  jasmine.Spec.prototype.prepareComponent = function (optionsOrHtmlOrjQuery, options) {
    // Makes sure we remove a component and its node prepared before.
    delete this.$node;
    $('#fixture_container').empty();
    this.component && this.component.teardown();

    if (typeof optionsOrHtmlOrjQuery == 'string') {
      this.$node = $(optionsOrHtmlOrjQuery);
    } else if (optionsOrHtmlOrjQuery instanceof jQuery) {
      this.$node = optionsOrHtmlOrjQuery;
    } else {
      options = optionsOrHtmlOrjQuery;
    }

    if (!this.$node) {
      this.$node = $('<div id="fixture"></div>');
    }

    this.$node.appendTo('#fixture_container');

    if (options) {
      this.component = new this.Component(this.$node, options);
    } else {
      this.component = new this.Component(this.$node);
    }
  };
})();
