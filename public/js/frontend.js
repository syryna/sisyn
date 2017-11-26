// Get Clicked picture
$(document).ready(function() {
    $('.change-picture').on('click', function(e) {
        $("input[name=picture]").val($("#" + e.target.id).attr("src"));
    });
});

// Delete User Ajax
$(document).ready(function(){
    $('.delete-user').on('click', function(e){
      $target = $(e.target);
      const id = $target.attr('data-id');
      $.ajax({
        type:'DELETE',
        url: '/users/'+id,
        success: function(response){
          alert('Deleting User');
          window.location.href='/';
        },
        error: function(err){
          console.log(err);
        }
      });
    });
  });