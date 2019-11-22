/* Version Control */
/* v24, 24/05/2019 */

$(document).ready(function() {
    //Login screen
    $("div#divLoginMessage:contains(Password must be at least 8 characters long)").html("<div class=\"complex\">Please enter a valid password. Note that password must contain at least 8 non-blank printable characters, must not contain the Username and at  least 3 out of the following 4:-</div><ol><li>At least one upper case</li><li>At least one lower case</li><li>At least one numeric</li><li>At least one special character</li></ol>");

    $("div#divLoginMessage:contains(Password cannot match the last 10 passwords)").html("New password must not match previous 10 passwords");

    $("div#divLoginMessage:contains(The system was unable to log you on. Please check with your administrator that your Username is registered and try again)").html("The system was unable to log you on. Please confirm your Username/Password is correct and try again.");

    $("div#divLoginMessage:contains(Password does not meet complexity requirements. Must contain an upper case, lower case, digit and special character. Must not contain the Username)").html("<div class=\"complex\">Please enter a valid password. Note that password must contain at least 8 non-blank printable characters, must not contain the Username and at  least 3 out of the following 4:-</div><ol><li>At least one upper case</li><li>At least one lower case</li><li>At least one numeric</li><li>At least one special character</li></ol>");

    $("div#divLoginMessage:contains(Passwords do not match)").html("New Password and Confirm Password do not match.");

    $("div#divLogin span.field-validation-error:contains(The UserName field is required)").html("The Username field is required");

    $("#tblChangePassword span#valCompare:contains(Passwords do not match)").html("New Password and Confirm Password do not match.");

    $("#tblChangePassword label:contains(New Password):not(:contains(Confirm))").html("Create New Password");

});

$(document).ready(function() {
    // Forgotten Password
    $("#divForgotPassword #lblForgotPwdMsg:contains(Please enter your email address. An email will be sent to this address advising you with further instructions)").html("Enter your email to receive instructions to reset your password.");

    $(".forgotPwdError:contains(Password must be at least 8 characters long)").html("<div class=\"complex\">Please enter a valid password. Note that password must contain at least 8 non-blank printable characters, must not contain the Username and at  least 3 out of the following 4:-</div><ol><li>At least one upper case</li><li>At least one lower case</li><li>At least one numeric</li><li>At least one special character</li></ol>");

    $(".forgotPwdError:contains(Password cannot match the last 10 passwords)").html("New password must not match previous 10 passwords");

    $(".forgotPwdError:contains(Passwords do not match)").html("New Password and Confirm Password do not match.");

    $(".forgotPwdError:contains(The system was unable to log you on. Please check with your administrator that your Username is registered and try again)").html("The system was unable to log you on. Please confirm your Username/Password is correct and try again.");

    $(".forgotPwdError:contains(Password does not meet complexity requirements. Must contain an upper case, lower case, digit and special character. Must not contain the Username)").html("<div class=\"complex\">Please enter a valid password. Note that password must contain at least 8 non-blank printable characters, must not contain the Username and at  least 3 out of the following 4:-</div><ol><li>At least one upper case</li><li>At least one lower case</li><li>At least one numeric</li><li>At least one special character</li></ol>");

    $("#divLogin #divConfirmMessage:contains(Your password has been successfully reset. You may now login using your new details.)").html("Your password has been successfully reset.<br/>You may now login using your new details.")

});
