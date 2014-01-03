// Generated by CoffeeScript 1.3.3
(function() {
  var angleString, dateFromString, distanceFromScale, distanceString, durationString, hourMinSec, kerbalDateString, numberWithCommas;

  numberWithCommas = function(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  hourMinSec = function(t) {
    var hour, min, sec;
    hour = (t / 3600) | 0;
    t %= 3600;
    min = (t / 60) | 0;
    if (min < 10) {
      min = "0" + min;
    }
    sec = (t % 60).toFixed();
    if (sec < 10) {
      sec = "0" + sec;
    }
    return "" + hour + ":" + min + ":" + sec;
  };

  kerbalDateString = function(t) {
    var day, year;
    year = ((t / (365 * 24 * 3600)) | 0) + 1;
    t %= 365 * 24 * 3600;
    day = ((t / (24 * 3600)) | 0) + 1;
    t %= 24 * 3600;
    return "Year " + year + ", day " + day + " at " + (hourMinSec(t));
  };

  durationString = function(t) {
    var result;
    result = "";
    if (t >= 365 * 24 * 3600) {
      result += (t / (365 * 24 * 3600) | 0) + " years ";
      t %= 365 * 24 * 3600;
      if (t < 24 * 3600) {
        result += "0d";
      }
    }
    if (t >= 24 * 3600) {
      result += (t / (24 * 3600) | 0) + " days ";
    }
    t %= 24 * 3600;
    return result + hourMinSec(t);
  };

  distanceString = function(d) {
    if (Math.abs(d) > 1e12) {
      return numberWithCommas((d / 1e9).toFixed()) + " Gm";
    } else if (Math.abs(d) >= 1e9) {
      return numberWithCommas((d / 1e6).toFixed()) + " Mm";
    } else if (Math.abs(d) >= 1e6) {
      return numberWithCommas((d / 1e3).toFixed()) + " km";
    } else {
      return numberWithCommas(d.toFixed()) + " m";
    }
  };

  angleString = function(angle, precision) {
    if (precision == null) {
      precision = 0;
    }
    return (angle * 180 / Math.PI).toFixed(precision) + String.fromCharCode(0x00b0);
  };

  distanceFromScale = function(distance, scale) {
    return distance * (function() {
      switch (scale.trim()) {
        case "Gm":
          return 1e9;
        case "Mm":
          return 1e6;
        case "km":
          return 1e3;
        default:
          return 1;
      }
    })();
  };

  dateFromString = function(dateString) {
    var c, componentScales, components, scale, time, _i, _len;
    componentScales = [365, 24, 60, 60];
    components = dateString.split(':').reverse();
    time = 0;
    scale = 1;
    for (_i = 0, _len = components.length; _i < _len; _i++) {
      c = components[_i];
      if (scale > 3600) {
        c = c - 1;
      }
      time += scale * c;
      if (componentScales.length === 0) {
        break;
      }
      scale *= componentScales.pop();
    }
    return time;
  };

  $(document).ready(function() {
    $('#referenceBodySelect').change(function(event) {
      var k, previousDestination, referenceBody, s, v, _ref;
      referenceBody = CelestialBody[$(this).val()];
      s = $('#destinationSelect');
      previousDestination = s.val();
      s.empty();
      for (k in CelestialBody) {
        v = CelestialBody[k];
        if ((v != null ? (_ref = v.orbit) != null ? _ref.referenceBody : void 0 : void 0) === referenceBody) {
          s.append($('<option>').text(k));
        }
      }
      s.val(previousDestination);
      if (s.val() == null) {
        s.val($('option:first', s).val());
      }
      return s.prop('disabled', s[0].childNodes.length === 0);
    });
    $('#referenceBodySelect').change();
    $('#destinationSelect').val($("#destinationSelect option:first").val());
    $('#smaScaleMenu a').click(function(event) {
      event.preventDefault();
      return document.getElementById('smaScale').childNodes[0].nodeValue = $(this).text();
    });
    return $('#midcourseForm').submit(function(event) {
      var argumentOfPeriapsis, burn, burnTime, destinationBody, eccentricity, errorFields, errors, eta, inclination, longitudeOfAscendingNode, orbit, referenceBody, semiMajorAxis, timeOfPeriapsisPassage;
      event.preventDefault();
      semiMajorAxis = distanceFromScale(+$('#sma').val(), $('#smaScale').text());
      eccentricity = +$('#eccentricity').val();
      inclination = +$('#inclination').val();
      longitudeOfAscendingNode = +$('#longitudeOfAscendingNode').val();
      argumentOfPeriapsis = +$('#argumentOfPeriapsis').val();
      timeOfPeriapsisPassage = dateFromString($('#timeOfPeriapsisPassage').val());
      referenceBody = CelestialBody[$('#referenceBodySelect').val()];
      destinationBody = CelestialBody[$('#destinationSelect').val()];
      eta = dateFromString($('#eta').val());
      burnTime = dateFromString($('#burnTime').val());
      $('#midcourseForm .control-group').removeClass('error');
      errors = [];
      errorFields = $('#midcourseForm input:text').filter(function() {
        return $(this).val().trim() === '';
      });
      if (errorFields.length > 0) {
        errors.push('all fields must be filled in');
      }
      if (semiMajorAxis < 0) {
        errorFields = errorFields.add('#sma');
        errors.push('hyperbolic transfer orbits are not supported');
      } else if (semiMajorAxis === 0 && $('#sma').val().trim() !== '') {
        errorFields = errorFields.add('#sma');
        errors.push('the semi-major axis cannot be 0');
      }
      if (eccentricity < 0 || eccentricity >= 1.0) {
        errorFields = errorFields.add('#eccentricity');
        errors.push('the eccentricity must be between 0 and 1');
      }
      if (inclination < 0 || inclination > 180) {
        errorFields = errorFields.add('#inclination');
        errors.push('the inclination must be between 0 and 180');
      }
      if (longitudeOfAscendingNode < 0 || longitudeOfAscendingNode > 360) {
        errorFields = errorFields.add('#longitudeOfAscendingNode ');
        errors.push('the longitude of the ascending node must be between 0 and 360');
      }
      if (argumentOfPeriapsis < 0 || argumentOfPeriapsis > 360) {
        errorFields = errorFields.add('#argumentOfPeriapsis ');
        errors.push('the argument of periapsis  must be between 0 and 360');
      }
      if (burnTime < 0) {
        errorFields = errorFields.add('#burnTime');
        errors.push('the time of maneuver and estimated time of arrival must be greater than 0');
      }
      if (eta < (burnTime + 3600)) {
        errorFields = errorFields.add('#eta');
        errors.push('the estimated time of arrival must be at least one hour after the time of maneuver');
      }
      if (errorFields.length > 0) {
        errorFields.closest('.control-group').addClass('error');
        errors[0] = errors[0].charAt(0).toUpperCase() + errors[0].slice(1);
        errors = errors.slice(0, errors.length - 2).concat([errors.slice(errors.length - 2).join(' and ')]);
        $('#validationMessage').html(errors.join(', ') + '.');
        $('#validationAlert:hidden').slideDown();
        return;
      }
      $('#validationAlert:visible').slideUp();
      orbit = new Orbit(referenceBody, semiMajorAxis, eccentricity, inclination, longitudeOfAscendingNode, argumentOfPeriapsis, null, timeOfPeriapsisPassage);
      burn = Orbit.courseCorrection(orbit, destinationBody.orbit, burnTime, eta);
      $('#burnDeltaV').text(burn.deltaV.toFixed(1) + " m/s");
      $('#burnPitch').text(angleString(burn.pitch, 2));
      $('#burnHeading').text(angleString(burn.heading, 2));
      $('#progradeDeltaV').text(burn.progradeDeltaV.toFixed(2) + " m/s");
      $('#normalDeltaV').text(burn.normalDeltaV.toFixed(2) + " m/s");
      $('#radialDeltaV').text(burn.radialDeltaV.toFixed(2) + " m/s");
      $('#arrivalTime').text(kerbalDateString(burn.arrivalTime));
      return $('#burnDetails:hidden').slideDown();
    });
  });

}).call(this);
