
function validateRegisterForm(errors){
  for (error of errors){
    console.log(error.param + error.msg + error.value);
    $('input[name=' + error.param + ']').addClass('is-invalid');
    $('input[name=' + error.param + ']').closest('.input-group').after('<div class="invalid-feedback d-flex">' + error.msg + '</div><br>');
    $('input[name=' + error.param + ']').val(error.value);
  }
}
