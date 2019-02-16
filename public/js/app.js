var IMAGE_DATA;

function showResults(results) {
  var output = "";
  for(var a=0; a<results.length; a++) {
    output += '<div class="col-md-1" style="font-size: 0.6em; text-align: center">Ratio: '+results[a].similarity+'<img style="width: 100%" src="/uploads/'+results[a].url+'"></div>'
  }
  $("#results").html(output);
}

function showHistogram(rgb_histograms) {
  var ctx = $("#histogram")[0].getContext("2d");
  var rmax = Math.max.apply(null, rgb_histograms.red);
  var bmax = Math.max.apply(null, rgb_histograms.blue);
  var gmax = Math.max.apply(null, rgb_histograms.green);

  function colorbars(max, vals, color, y) {
    ctx.fillStyle = color;
    jQuery.each(vals, function(i,x) {
      var pct = (vals[i] / max) * 150;
      ctx.fillRect(i*1, y, 1, -Math.round(pct));
    });
  }
  colorbars(rmax, rgb_histograms.red, "rgb(255,0,0)", 150);
  colorbars(gmax, rgb_histograms.green, "rgb(0,255,0)", 300);
  colorbars(bmax, rgb_histograms.blue, "rgb(0,0,255)", 450);
}

function showImage(base64) {
  var src = "data:image/jpeg;base64,"+base64;
  $("#compared_picture").attr('src', src);
  $("#compared_picture").show();
}

$("#upload-and-compare").submit(function(event) {
  event.preventDefault();
  var data = new FormData();
  data.append('photo', jQuery('#upload-and-compare input')[0].files[0]);
  $.ajax({
    method: "POST",
    url: "/upload-and-compare",
    data: data,
    cache: false,
    contentType: false,
    processData: false,
    success: function(res) {
      IMAGE_DATA = res;
      showImage(res.base64);
      showHistogram(res.rgb_histograms);
    }
  })
});

$("#upload-and-save").submit(function(event) {
  event.preventDefault();
  var data = new FormData();
  data.append('photo', $('#upload-and-save input')[0].files[0]);
  $.ajax({
    method: "POST",
    url: "/upload-and-save",
    data: data,
    cache: false,
    contentType: false,
    processData: false,
    success: function(res) {
      console.log(res);
    }
  })
});

$("#compare").submit(function(event) {
  event.preventDefault();
  var distance = $("#compare select[name='distance']").val();
  $.ajax({
    method: "POST",
    url: "/compare",
    contentType: "application/json",
    data: JSON.stringify({ data:IMAGE_DATA.single_bin, distance: distance}),
    success: function(res) {
      showResults(res);
    }
  })
});
