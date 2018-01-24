$(document).ready(function () {

    // ------------------------
    // user_edit page functions
    // ------------------------

    // Get Clicked picture
    $('.change-picture').on('click', function (e) {
        $("input[name=picture]").val($("#" + e.target.id).attr("src"));
    });





    // Alert Button handling
    $('#alert-confirm').on('click', function (e) {
        // ACTION
    });

    

    // Delete User Ajax
    $('.delete-user').on('click', function (e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        $('#dangerModal').modal('show');
        $('.danger-confirm').on('click', function () {
            $.ajax({
                type: 'DELETE',
                url: '/users/' + id,
                success: function (response) {
                    window.location.href = '/users/userlist';
                },
                error: function (err) {
                    console.log(err);
                }
            });
        });
    });

    // Lock User Ajax
    $('.lock-user').on('click', function (e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type: 'POST',
            url: '/users/lock/' + id,
            success: function (response) {
                window.location.href = '/users/userlist';
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    // Unlock User Ajax
    $('.unlock-user').on('click', function (e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type: 'POST',
            url: '/users/unlock/' + id,
            success: function (response) {
                window.location.href = '/users/userlist';
            },
            error: function (err) {
                console.log(err);
            }
        });
    });




});