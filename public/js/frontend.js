    // ------------------------
    // Date/Time Converter to German Layout DD.MM.YYYY HH:MM:SS
    // ------------------------
    function DEDate (ISOdate){

        var year = ISOdate.getFullYear();
        var month = ISOdate.getMonth()+1;
        var day = ISOdate.getDate();
        var hour = ISOdate.getHours();
        var minute = ISOdate.getMinutes();
        var second = ISOdate.getSeconds();

        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }
        if (hour < 10) {
            hour = '0' + hour;
        }
        if (minute < 10) {
            minute = '0' + minute;
        }
        if (second < 10) {
            second = '0' + second;
        }

        var formattedDate = day + '.' + month + '.' + year + ' ' + hour + ':' + minute + ':' + second;
        
        return formattedDate;
    }

$(document).ready(function () {

    // ------------------------
    // user_edit page functions
    // ------------------------

    // Get Clicked picture
    $('.change-picture').on('click', function (e) {
        $("input[name=picture]").val($("#" + e.target.id).attr("src"));
        // remove border from all picture
        $('.img-thumbnail').removeClass('border border-primary');
        // add border on selected picture
        $("#" + e.target.id).addClass('border border-primary');
    });

    // ------------------------
    // user_listall page functions
    // ------------------------

    // Delete User Ajax
    $('.delete-user').on('click', function (e) {
        e.preventDefault();
        $target = $(e.target);
        const id = $target.attr('data-id');
        $('#dangerModal').modal('show');
        $('.danger-confirm').on('click', function () {
            $.ajax({
                type: 'DELETE',
                url: '/users/' + id,
                success: function (response) {
                    window.location.href = '/users/listall';
                },
                error: function (err) {
                    console.log(err);
                }
            });
        });
    });

    // Lock User Ajax
    $('.lock-user').on('click', function (e) {
        e.preventDefault();
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type: 'POST',
            url: '/users/lock/' + id,
            success: function (response) {
                window.location.href = '/users/listall';
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    // Unlock User Ajax
    $('.unlock-user').on('click', function (e) {
        e.preventDefault();
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type: 'POST',
            url: '/users/unlock/' + id,
            success: function (response) {
                window.location.href = '/users/listall';
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    // Delete Account Ajax
    $('.delete-account').on('click', function (e) {
        e.preventDefault();
        $target = $(e.target);
        const id = $target.attr('data-id');
        $('#dangerModal').modal('show');
        $('.danger-confirm').on('click', function () {
            $.ajax({
                type: 'DELETE',
                url: '/accounts/' + id,
                success: function (response) {
                    window.location.href = '/users/listall';
                },
                error: function (err) {
                    console.log(err);
                }
            });
        });
    });

    // ------------------------
    // overview_show page functions
    // ------------------------

    // File Upload and Pictuire Preview for the News Section
    $('#fileinput').on('change', function(){
        var file = this.files[0];
        previewImage(file);
    });

    function previewImage(file) {

        var imageType = /image.*/;

        if (!file.type.match(imageType)) {
            console.log("File Type must be an image");
        }

        var img = document.createElement("img");
        img.file = file;

        $('.thumbnail').empty();
        $('.thumbnail').append(img);

        // Using FileReader to display the image content
        var reader = new FileReader();
        reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
        reader.readAsDataURL(file);

        //Output of MetaData for the selected File
        var ISOTime = new Date(file.lastModified);
        var myDate = DEDate(ISOTime);
        $('.filemetadata').html('Name: ' + file.name + '<br>Größe: ' + file.size + '<br>Typ: ' + file.type + '<br>Letzte Änderung: ' + myDate);
    }

    // Delete News Ajax
    $('.delete-news').on('click', function (e) {
        e.preventDefault();
        $target = $(e.target);
        const id = $target.attr('data-id');
        $('#dangerModal').modal('show');
        $('.danger-confirm').on('click', function () {
            $.ajax({
                type: 'DELETE',
                url: '/overview/news/' + id,
                success: function (response) {
                    window.location.href = '/overview/show';
                },
                error: function (err) {
                    console.log(err);
                }
            });
        });
    });
});