// The MIT License (MIT)

// Copyright (c) 2017-2024 Zalando SE

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


function radar_visualization(config) {

  config.svg_id = config.svg || "radar";
  config.width = config.width || 1450;
  config.height = config.height || 1000;
  config.colors = ("colors" in config) ? config.colors : {
      background: "#fff",
      grid: '#dddde0',
      inactive: "#ddd"
    };
  config.print_layout = ("print_layout" in config) ? config.print_layout : true;

  // custom random number generator, to make random sequence reproducible
  // source: https://stackoverflow.com/questions/521295
  var seed = 36;
  function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function random_between(min, max) {
    return min + random() * (max - min);
  }

  function normal_between(min, max) {
    return min + (random() + random()) * 0.5 * (max - min);
  }

  // radial_min / radial_max are multiples of PI
  const quadrants = [
    { radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1 },
    { radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1 },
    { radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1 },
    { radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1 }
  ];

  const rings = [
    { radius: 175 }, // Primary – slightly bigger
    { radius: 250 }, // Consider
    { radius: 325 }, // Experiment
    { radius: 400 }  // Avoid
  ];

  function polar(cartesian) {
    var x = cartesian.x;
    var y = cartesian.y;
    return {
      t: Math.atan2(y, x),
      r: Math.sqrt(x * x + y * y)
    }
  }

  function cartesian(polar) {
    return {
      x: polar.r * Math.cos(polar.t),
      y: polar.r * Math.sin(polar.t)
    }
  }

  function bounded_interval(value, min, max) {
    var low = Math.min(min, max);
    var high = Math.max(min, max);
    return Math.min(Math.max(value, low), high);
  }

  function bounded_ring(polar, r_min, r_max) {
    return {
      t: polar.t,
      r: bounded_interval(polar.r, r_min, r_max)
    }
  }

  function bounded_box(point, min, max) {
    return {
      x: bounded_interval(point.x, min.x, max.x),
      y: bounded_interval(point.y, min.y, max.y)
    }
  }

  function segment(quadrant, ring) {
    var polar_min = {
      t: quadrants[quadrant].radial_min * Math.PI,
      r: ring === 0 ? 30 : rings[ring - 1].radius
    };
    var polar_max = {
      t: quadrants[quadrant].radial_max * Math.PI,
      r: rings[ring].radius
    };
    var cartesian_min = {
      x: 15 * quadrants[quadrant].factor_x,
      y: 15 * quadrants[quadrant].factor_y
    };
    var cartesian_max = {
      x: rings[3].radius * quadrants[quadrant].factor_x,
      y: rings[3].radius * quadrants[quadrant].factor_y
    };
    return {
      clipx: function(d) {
        var c = bounded_box(d, cartesian_min, cartesian_max);
        var p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
        d.x = cartesian(p).x; // adjust data too!
        return d.x;
      },
      clipy: function(d) {
        var c = bounded_box(d, cartesian_min, cartesian_max);
        var p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
        d.y = cartesian(p).y; // adjust data too!
        return d.y;
      },
      random: function() {
        return cartesian({
          t: random_between(polar_min.t, polar_max.t),
          r: normal_between(polar_min.r, polar_max.r)
        });
      }
    }
  }

  // position each entry randomly in its segment
  for (var i = 0; i < config.entries.length; i++) {
    var entry = config.entries[i];
    entry.segment = segment(entry.quadrant, entry.ring);
    var point = entry.segment.random();
    entry.x = point.x;
    entry.y = point.y;
    entry.color = entry.active || config.print_layout ?
      config.rings[entry.ring].color : config.colors.inactive;
  }

  // partition entries according to segments
  var segmented = new Array(4);
  for (let quadrant = 0; quadrant < 4; quadrant++) {
    segmented[quadrant] = new Array(4);
    for (var ring = 0; ring < 4; ring++) {
      segmented[quadrant][ring] = [];
    }
  }
  for (var i=0; i<config.entries.length; i++) {
    var entry = config.entries[i];
    segmented[entry.quadrant][entry.ring].push(entry);
  }

  // assign unique sequential id to each entry
  var id = 1;
  for (quadrant of [2,3,1,0]) {
    for (var ring = 0; ring < 4; ring++) {
      var entries = segmented[quadrant][ring];
      entries.sort(function(a,b) { return a.label.localeCompare(b.label); })
      for (var i=0; i<entries.length; i++) {
        entries[i].id = "" + id++;
      }
    }
  }

  function translate(x, y) {
    return "translate(" + x + "," + y + ")";
  }



  // adjust with config.scale.
  config.scale = config.scale || 1;
  var scaled_width = config.width * config.scale;
  var scaled_height = config.height * config.scale;

  var svg = d3.select("svg#" + config.svg_id)
    .style("background-color", config.colors.background)
    .attr("width", scaled_width)
    .attr("height", scaled_height);

  var radar = svg.append("g");
  // Move the whole radar slightly up to better use available vertical space
  var verticalNudge = -20; // pixels
  radar.attr("transform", translate(scaled_width / 2, (scaled_height / 2) + verticalNudge).concat(`scale(${config.scale})`));

  var grid = radar.append("g");

  // define default font-family
  config.font_family = config.font_family || "Arial, Helvetica";

  // draw grid lines
  grid.append("line")
    .attr("x1", 0).attr("y1", -400)
    .attr("x2", 0).attr("y2", 400)
    .style("stroke", config.colors.grid)
    .style("stroke-width", 1);
  grid.append("line")
    .attr("x1", -400).attr("y1", 0)
    .attr("x2", 400).attr("y2", 0)
    .style("stroke", config.colors.grid)
    .style("stroke-width", 1);

  // background color. Usage `.attr("filter", "url(#solid)")`
  // SOURCE: https://stackoverflow.com/a/31013492/2609980
  var defs = grid.append("defs");
  var filter = defs.append("filter")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 1)
    .attr("height", 1)
    .attr("id", "solid");
  filter.append("feFlood")
    .attr("flood-color", "rgb(0, 0, 0, 0.8)");
  filter.append("feComposite")
    .attr("in", "SourceGraphic");

  // draw rings
  for (var i = 0; i < rings.length; i++) {
    grid.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", rings[i].radius)
      .style("fill", "none")
      .style("stroke", config.colors.grid)
      .style("stroke-width", 1);
  }



  // layer for entries
  var rink = radar.append("g")
    .attr("id", "rink");

  function showBubble(d) {
    if (d.active || config.print_layout) {
      var tooltip = d3.select("#bubble text")
        .text(d.label)
        .attr("x", 0)
        .attr("y", -6);
      var bbox = tooltip.node().getBBox();
      var rectWidth = bbox.width + 24;
      var rectHeight = bbox.height + 16;
      d3.select("#bubble")
        .attr("transform", translate(d.x, d.y - 24))
        .style("opacity", 0.95);
      d3.select("#bubble rect")
        .attr("x", -rectWidth / 2)
        .attr("y", -rectHeight / 2 - 8)
        .attr("width", rectWidth)
        .attr("height", rectHeight);
      d3.select("#bubble path")
        .attr("transform", translate(-5, rectHeight / 2 - 5));
    }
  }

  function hideBubble(d) {
    var bubble = d3.select("#bubble")
      .attr("transform", translate(0,0))
      .style("opacity", 0);
  }

  function highlightLegendItem(d) {}
  function unhighlightLegendItem(d) {}

  // draw blips on radar
  var blips = rink.selectAll(".blip")
    .data(config.entries)
    .enter()
      .append("g")
        .attr("class", "blip")
        .attr("transform", function(d, i) { return translate(d.x, d.y); })
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) { showBubble(d); highlightLegendItem(d); })
        .on("mouseout", function(event, d) { hideBubble(d); unhighlightLegendItem(d); })
        .on("click", function(event, d) { 
          event.stopPropagation();
          if (window.selectLibraryItem) {
            window.selectLibraryItem(d.label);
          }
        });

  // configure each blip
  blips.each(function(d) {
    var blip = d3.select(this);

   

    // blip shape
    if (d.moved == 1) {
      blip.append("path")
        .attr("d", "M -11,5 11,5 0,-13 z") // triangle pointing up
        .style("fill", d.color)
        .style("cursor", "pointer");
    } else if (d.moved == -1) {
      blip.append("path")
        .attr("d", "M -11,-5 11,-5 0,13 z") // triangle pointing down
        .style("fill", d.color)
        .style("cursor", "pointer");
    } else if (d.moved == 2) {
      blip.append("path")
        .attr("d", d3.symbol().type(d3.symbolStar).size(200))
        .style("fill", d.color)
        .style("cursor", "pointer");
    } else {
      blip.append("circle")
        .attr("r", 14)
        .attr("fill", d.color)
        .style("cursor", "pointer");
    }

    // center logo (or letter fallback) inside the blip
    if (d.logo) {
      var img = blip.append("image")
        .attr("href", d.logo)
        .attr("xlink:href", d.logo)
        .attr("x", -9.5)
        .attr("y", -9.5)
        .attr("width", 19)
        .attr("height", 19)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("pointer-events", "none")
        .style("filter", "brightness(0)");
      // Fallback to first letter if the image fails to load (e.g., CORS)
      img.each(function(di) {
        var node = this;
        node.addEventListener('error', function() {
          d3.select(node).remove();
          var letter = (di.label || "?").toString().trim().charAt(0).toUpperCase();
          blip.append("text")
            .text(letter)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("fill", "#ffffff")
            .style("font-family", config.font_family)
            .style("font-size", "10px")
            .style("pointer-events", "none");
        }, { once: true });
      });
    } else {
      var letter = (d.label || "?").toString().trim().charAt(0).toUpperCase();
      blip.append("text")
        .text(letter)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("fill", "#ffffff")
        .style("font-family", config.font_family)
        .style("font-size", "10px")
        .style("pointer-events", "none");
    }
  });

  // make sure that blips stay inside their segment
  function ticked() {
    blips.attr("transform", function(d) {
      return translate(d.segment.clipx(d), d.segment.clipy(d));
    })
  }

  // distribute blips, while avoiding collisions
  d3.forceSimulation()
    .nodes(config.entries)
    .velocityDecay(0.19) // magic number (found by experimentation)
    .force("collision", d3.forceCollide().radius(16).strength(0.9))
    .on("tick", ticked);

  // draw ring labels on top of everything
  if (config.print_layout) {
    var ringLabels = radar.append("g").attr("class", "ring-labels");
    for (var i = 0; i < rings.length; i++) {
      // place the label at the vertical midpoint of each ring band,
      // nudged down a few px for visual centering
      var inner = (i === 0) ? 30 : rings[i - 1].radius;
      var outer = rings[i].radius;
      var yMid = -((inner + outer) / 2) + 12; // slight downward shift
      ringLabels.append("text")
        .text(config.rings[i].name)
        .attr("y", yMid)
        .attr("text-anchor", "middle")
        .style("fill", config.rings[i].color)
        .style("opacity", 0.60)
        .style("font-family", config.font_family)
        .style("font-size", "36px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  }

  // rollover bubble (on top of everything else)
  var bubble = radar.append("g")
    .attr("id", "bubble")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("user-select", "none");
  bubble.append("rect")
    .attr("rx", 8)
    .attr("ry", 8)
    .style("fill", "rgba(14, 35, 36, 0.95)")
    .style("stroke", "rgba(19, 163, 176, 0.3)")
    .style("stroke-width", "1px")
    .style("filter", "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))");
  bubble.append("text")
    .style("font-family", config.font_family)
    .style("font-size", "16px")
    .style("font-weight", "500")
    .style("fill", "#cfe7e6")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle");
  bubble.append("path")
    .attr("d", "M 0,0 10,0 5,8 z")
    .style("fill", "rgba(14, 35, 36, 0.95)")
    .style("stroke", "rgba(19, 163, 176, 0.3)")
    .style("stroke-width", "1px");

  
}
