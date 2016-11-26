$(document).ready(function(){
	$("form").submit(function() {
	  var _txt1 = $('#txt1').val();
	  var _txt2 = $('#txt2').val();
	  
	  if (_txt1 == _txt2)
	  {
	     //alert('Matching!');
	     return true;
	  }
	  else
	  {
	    alert('Confirm password not matched!');
	    return false;
	  }
	});

});


