define([
  'app',
  'underscore',
  'backbone',
  'core/listings/baseView',
  'core/t',
  'core/google'
], function(app, _, Backbone, BaseView, __t, g) {

  return {
    id: 'map',

    icon: 'map',

    uiNames: ['map'],

    View: BaseView.extend({

      template: 'core/listings/map',

      attributes: {
        class: 'view-map js-listing-view'
      },

      navigate: function (id) {
        var route = Backbone.history.fragment.split('/');

        route.push(id);
        app.router.go(route);
      },

      optionsStructure: function() {
        var options = {
          location: {}
        };

        _.each(this.locationColumns(), function(column) {
          options.location[column.id] = app.capitalize(column.id);
        });

        return {
          id: 'views_options_map',
          columns: [
            {
              id: 'location_column',
              type: 'String',
              required: true,
              ui: 'dropdown',
              options: {
                options: options.location
              }
            }
          ]
        }
      },

      getLocationColumn: function() {
        var viewOptions = this.getViewOptions();
        var column;

        if (viewOptions.location_column) {
          column = this.collection.structure.get(viewOptions.location_column);
        } else {
          column = _.first(this.locationColumns())
        }

        return column;
      },

      locationColumns: function() {
        return this.collection.structure.filter(function(model) {
          return _.contains(['map'], model.get('ui'));
        });
      },

      pinSymbol: function (color) {
        return {
          path: 'M7,0 C3.13,0 0,3.13 0,7 C0,12.25 7,20 7,20 C7,20 14,12.25 14,7 C14,3.13 10.87,0 7,0 Z M7,9.5 C5.62,9.5 4.5,8.38 4.5,7 C4.5,5.62 5.62,4.5 7,4.5 C8.38,4.5 9.5,5.62 9.5,7 C9.5,8.38 8.38,9.5 7,9.5 Z',
          fillColor: color,
          fillOpacity: 1,
          strokeColor: color,
          strokeWeight: 1,
          scale: 1.2,
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(7, 20),
          animation: google.maps.Animation.DROP
        };
      },

      createMarker: function(lat, lng, title) {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, lng),
          map: this.map,
          draggable: false,
          title: title || 'Select a Location',
          icon: this.pinSymbol('#3498DB')
        });

        this.state.markers.push(marker);

        return marker;
      },

      mapInit: function () {
        var mapOptions = {
          zoom: 14,
          center: new google.maps.LatLng(40.720, -73.953),
          styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#dbdbdb"},{"visibility":"on"}]}]
        };

        var mapElement = $('.map')[0];
        map = new google.maps.Map(mapElement, mapOptions);
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(40.720, -73.953),
          map: map,
          draggable: true,
          title: 'Select a Location',
          icon: this.pinSymbol("#3498DB")
        });

        var input = (document.getElementById('map-search'));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        // var infowindow = new google.maps.InfoWindow();

        autocomplete.addListener('place_changed', function(event) {
          // infowindow.close();
          marker.setVisible(false);
          var place = autocomplete.getPlace();
          if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("Please select a result from the menu below.");
            return;
          }

          // If the place has a geometry, then present it on a map.
          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
          }

          marker.setPosition(place.geometry.location);
          marker.setVisible(true);

          var address = '';
          if (place.address_components) {
            address = [
              (place.address_components[0] && place.address_components[0].short_name || ''),
              (place.address_components[1] && place.address_components[1].short_name || ''),
              (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
          }

          $('.lat-long').html('Latitude: ' + place.geometry.location.lat().toFixed(3) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Longitude: ' + place.geometry.location.lng().toFixed(3) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(' + place.name + ')'); // address

        });

        //////////////////////////////////////////////////////////////////////////////

        google.maps.event.addListener(marker, "dragstart", function (event) {
          marker.setAnimation(3); // Raise
          $('#map-search').val('');
        });

        google.maps.event.addListener(marker, "drag", function (event) {
          $('.lat-long').html('Latitude: '+ event.latLng.lat().toFixed(3) +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Longitude: '+ event.latLng.lng().toFixed(3));
        });

        google.maps.event.addListener(marker, "dragend", function (event) {
          marker.setAnimation(4); // Bounce
          $('.lat-long').html('Latitude: '+ event.latLng.lat().toFixed(3) +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Longitude: '+ event.latLng.lng().toFixed(3));
        });

        map.setOptions({
          draggable: true,
          zoomControl: true,
          scrollwheel: false,
          disableDoubleClickZoom: false,
          streetViewControl: false,
          disableDefaultUI: true
        });

        google.maps.event.addDomListener(window, "resize", function() {
          var center = map.getCenter();
          google.maps.event.trigger(map, "resize");
          map.setCenter(center);
        });
      },

      initMap: function() {
        var mapOptions = {
          zoom: 14,
          center: new google.maps.LatLng(40.720, -73.953),
          styles: [
            {
              'featureType': 'administrative',
              'elementType': 'labels.text.fill',
              'stylers': [{'color':'#444444'}]
            },
            {
              'featureType': 'landscape',
              'elementType': 'all',
              'stylers': [{'color':'#eeeeee'}]
            },
            {
              'featureType': 'poi',
              'elementType': 'all',
              'stylers': [{'visibility':'off'}]
            },
            {
              'featureType': 'poi',
              'elementType': 'labels.text',
              'stylers': [{'visibility':'off'}]
            },
            {
              'featureType': 'road',
              'elementType': 'all',
              'stylers': [{'saturation':-100},{'lightness':10}]
            },
            // {
            //   'featureType': 'road.local',
            //   'elementType': 'geometry',
            //   'stylers': [{color: '#cccccc'}]
            // },
            {
              'featureType': 'road.highway',
              'elementType': 'all',
              'stylers': [{'visibility':'simplified'}]
            },
            {
              'featureType': 'road.arterial',
              'elementType': 'labels.icon',
              'stylers': [{'visibility':'off'}]
            },
            {
              'featureType': 'transit',
              'elementType': 'all',
              'stylers': [{'visibility':'off'}]
            },
            {
              'featureType': 'water',
              'elementType': 'all',
              'stylers': [{'color':'#9ACCED'},{'visibility':'on'}]
            }
          ]
        };

        var mapElement = this.$('.map')[0];
        var map = this.map = new google.maps.Map(mapElement, mapOptions);
        var marker = this.marker = this.createMarker(40.720, -73.953);

        google.maps.event.addListenerOnce(map, 'idle', _.bind(function() {
          this.updateMap();
        }, this));

        var input = this.input = this.$('#map-search')[0];
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        var autocomplete = this.autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        // var infowindow = new google.maps.InfoWindow();
        autocomplete.addListener('place_changed', _.bind(function() {
          var place = autocomplete.getPlace();
          this.state.place = place;
          this.state.search = this.input.value;
          this.changePlace(place);
        }, this));

        // set to last location
        if (this.state.loaded && this.state.place) {
          $(this.input).val(this.state.search);
          this.changePlace(this.state.place);
        }

        //////////////////////////////////////////////////////////////////////////////

        google.maps.event.addListener(marker, 'dragstart', function (event) {
          marker.setAnimation(3); // Raise
          $('#map-search').val('');
        });

        google.maps.event.addListener(marker, 'drag', function (event) {
          $('.lat-long').html('Latitude: '+ event.latLng.lat().toFixed(3) +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Longitude: '+ event.latLng.lng().toFixed(3));
        });

        google.maps.event.addListener(marker, 'dragend', function (event) {
          marker.setAnimation(4); // Bounce
          $('.lat-long').html('Latitude: '+ event.latLng.lat().toFixed(3) +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Longitude: '+ event.latLng.lng().toFixed(3));
        });

        map.setOptions({
          draggable: true,
          zoomControl: true,
          scrollwheel: false,
          disableDoubleClickZoom: false,
          streetViewControl: false,
          disableDefaultUI: true
        });

        google.maps.event.addDomListener(window, 'resize', _.bind(function() {
          var center = map.getCenter();

          google.maps.event.trigger(map, 'resize');
          map.setCenter(center);
          this.updateMap();
        }, this));

        this.state.loaded = true;
      },

      addMarker: function(marker, place) {
        var map = this.map;
        // infowindow.close();
        marker.setVisible(false);

        if (!place.geometry) {
          // User entered the name of a Place that was not suggested and
          // pressed the Enter key, or the Place Details request failed.
          // window.alert('Please select a result from the menu below.');
          return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
          address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ');
        }
      },

      clearMarkers: function () {
        var markers = this.state.markers;
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
      },

      deleteMarkers: function () {
        this.clearMarkers();
        this.state.markers = [];
      },

      changePlace: function(place) {
        var marker = this.marker;

        this.addMarker(marker, place);

        $('.lat-long').html('Latitude: ' + place.geometry.location.lat().toFixed(3) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Longitude: ' + place.geometry.location.lng().toFixed(3) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(' + place.name + ')'); // address

      },

      getMapBoundsLocation: function() {
        var bounds = this.map.getBounds();

        return {
          ne: bounds.getNorthEast(),
          sw: bounds.getSouthWest()
        }
      },

      updateMap: function() {
        this.updateLocationRangeFilter();
        this.collection.fetch();
      },

      updateLocationRangeFilter: function() {
        var range = this.getMapBoundsLocation();
        var filters = {};

        if (!this.getLocationColumn()) {
          return;
        }

        filters[this.getLocationColumn().id] = [
          {between: range.sw.lat() + ',' + range.ne.lat()},
          {between: range.sw.lng() + ',' + range.ne.lng()}
        ];

        var options = {
          remove: false,
          replaceOptions: {
            filters: filters
          }
        };

        this.fetchOptions = _.extend(this.fetchOptions || {}, options);
        this.collection.options = _.extend(this.collection.options || {}, options);

        return this.collection.fetch();
      },

      updateMarkers: function () {
        if (!this.getLocationColumn() || !this.map) {
          return;
        }

        this.deleteMarkers();
        this.collection.each(_.bind(function (model) {
          var self = this;
          var location = model.get(this.getLocationColumn().id);
          var marker;

          if (location) {
            location = location.split(',');
            marker = this.createMarker(location[0], location[1]);
            marker.setMap(this.map);

            google.maps.event.addListener(marker, 'click', function () {
              self.navigate(model.id);
            });
          }
        }, this));
      },

      afterRender: function () {
        if (!this.map) {
          this.initMap();
        }
      },

      fetchData: function () {
        var deferred = new $.Deferred();
        var apiKey = app.settings.get('google_api_key');
        var keyString = '';

        if (apiKey) {
          keyString = '&key=' + apiKey;
        }

        g.load('maps', 3, {
          other_params: 'sensor=false&libraries=places' + keyString,
          callback: function () {
            deferred.resolve();
          }
        });

        return deferred.promise();
      },

      onCleanUp: function () {
        this.map = null;
      },

      initialize: function() {
        this.state = {
          loaded: false,
          search: null,
          markers: []
        };

        this.listenTo(this.collection, 'sync', this.updateMarkers);

        // this.once('library:loaded', function () {
        //   this.initMap();
        //   this.updateMarkers();
        // }, this);
      }
    })
  }
});
