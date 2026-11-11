$(function() {
    'use strict';

    // Reusable function to initialize check-in and check-out datepickers
    function initDatePickers(checkInSelector, checkOutSelector) {
        let checkIn = $(checkInSelector);
        let checkOut = $(checkOutSelector);

        // Check-In Date
        checkIn.daterangepicker({
            singleDatePicker: true,
            autoApply: true,
            minDate: moment(),
            autoUpdateInput: false
        }, function (start) {
            checkIn.val(start.format('MM-DD-YYYY'));

            // Set checkout minimum date = same as check-in
            checkOut.data('daterangepicker').setStartDate(start);
            checkOut.data('daterangepicker').minDate = start;
            checkOut.val(start.format('MM-DD-YYYY')); // optional: auto-fill checkout
        });

        // Check-Out Date
        checkOut.daterangepicker({
            singleDatePicker: true,
            autoApply: true,
            minDate: moment(), // will be updated dynamically by check-in selection
            autoUpdateInput: false
        }, function (end) {
            checkOut.val(end.format('MM-DD-YYYY'));
        });
    }

    // Initialize for Intro Form
    initDatePickers('#hotelsCheckIn', '#hotelsCheckOut');

    // Initialize for Check Availability Form
    initDatePickers('#searchCheckIn', '#searchCheckOut');
});