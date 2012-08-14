/**
 * @file
 * JS Implementation of OpenLayers behavior.
 */

Drupal.openlayers.addBehavior('openlayers_heatmaps_behavior', function (context, options) {
  var map = context.openlayers;
  var layers = [];

  for (var i in options.layers) {
    layeroptions = options.layers[i];
    if (layeroptions.layer == 1) {
      var selectedLayer = map.getLayersBy('drupalID', i);
      if (typeof selectedLayer[0] != 'undefined') {
        layers.push(selectedLayer[0]);
      }
    }
  }

  // If no layer is selected, just return.
  if (layers.length < 1) {
    return;
  }

  for (var i in layers) {
    var layer = layers[i];

    var layersoptions = options['layers'];
    var drupalID = layer.drupalID;
    var layeroptions = layersoptions[drupalID];

    var radius = parseInt(layeroptions.radius, 10);
    var intensity = parseInt(layeroptions.intensity, 10);
    var distance = parseInt(layeroptions.distance, 10);
    var threshold = parseInt(layeroptions.threshold, 10);
    var opacity = parseFloat(layeroptions.opacity, 10);
    var visibility = layeroptions.hide_original;
    var heatmap_name = layeroptions.heatmap_name;
    var heatmapdata = { max:0, data:[] };
    var heatmap;

    heatmap = new OpenLayers.Layer.Heatmap(heatmap_name, map, layer,
      {visible:true, radius:10},
      {isBaseLayer:false, opacity:opacity, projection: map.getProjectionObject()});

    var cluster = new OpenLayers.Strategy.Cluster({'distance':distance, 'threshold':threshold});
    cluster.setLayer(layer);
    cluster.features = layer.features.slice();
    cluster.activate();
    cluster.cluster();

    for (var j in cluster.features) {
      var feature = cluster.features[j];
      if (feature.CLASS_NAME == 'OpenLayers.Feature.Vector') {
        if (typeof feature.attributes.count == 'undefined') {
          count = intensity;
        } else {
          count = feature.attributes.count*intensity;
        }
        heatmapdata.data.push({lonlat:new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y), count:count});
      }
    }

    heatmapdata.max = heatmapdata.data.length;

    if (visibility == 1) {
      layer.setVisibility(false);
    }
    map.addLayer(heatmap);
    heatmap.setDataSet(heatmapdata);
  }


});
