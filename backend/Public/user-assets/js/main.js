/*
==================================================================================
* Template:  	 The Mist - Luxury Hotel HTML Template
* Written by: 	 Harnish Design - (http://www.harnishdesign.net)
* Description:   Main Custom Script File
==================================================================================
*/

(function ($) {
	"use strict";

// Preloader
$(window).on('load', function () {
	$('.lds-ellipsis').fadeOut(); // will first fade out the loading animation
	$('.preloader').delay(333).fadeOut('slow'); // will fade out the white DIV that covers the website.
	$('body').delay(333);
});

// Header Sticky
$(window).on('scroll',function() {
	var stickytop = $('#header.sticky-top .bg-transparent');
	var stickytopslide = $('#header.sticky-top-slide');
	
	if ($(this).scrollTop() > 1){
		stickytop.addClass("sticky-on-top");
		stickytop.find(".logo img").attr('src',stickytop.find('.logo img').data('sticky-logo'));
	}
	else {
		stickytop.removeClass("sticky-on-top");
		stickytop.find(".logo img").attr('src',stickytop.find('.logo img').data('default-logo'));
	}
	
	if ($(this).scrollTop() > 180){
		stickytopslide.find(".primary-menu").addClass("sticky-on");
		stickytopslide.find(".logo img").attr('src',stickytopslide.find('.logo img').data('sticky-logo'));
	}
	else{
		stickytopslide.find(".primary-menu").removeClass("sticky-on");
		stickytopslide.find(".logo img").attr('src',stickytopslide.find('.logo img').data('default-logo'));
	}
});

/*--------------------------------------
    Primary Menu
---------------------------------------- */
// Dropdown show on hover

$('.primary-menu:not(.navbar-overlay):not(.navbar-sidebar):not(.navbar-expand-none) ul.navbar-nav li.dropdown').on("mouseover", function() {
	if ($(window).width() > 991) {
		$(this).find('> .dropdown-menu').stop().slideDown('fast');
		$(this).on('mouseleave', function() {
			$(this).find('> .dropdown-menu').stop().css('display', 'none'); 
		});
		
	// When dropdown going off to the out of the screen.
	$('.primary-menu ul.navbar-nav > li.dropdown > .dropdown-menu').each(function() {
		var menu = $('#header .primary-menu > div').offset();
		var dropdown = $(this).parent().offset();
		if ($("html").attr("dir") == 'rtl') {
			var rd = ($(window).width() - (dropdown.left + $(this).parent().outerWidth()));
			var i = (rd + $(this).outerWidth()) - (menu.left + $('#header .primary-menu > div').outerWidth());
		}else{
			var i = (dropdown.left + $(this).outerWidth()) - (menu.left + $('#header .primary-menu > div').outerWidth());
		}
		if (i > 0) {
			if ($("html").attr("dir") == 'rtl') {
				$(this).css('margin-right', '-' + (i) + 'px');
			}else{
				$(this).css('margin-left', '-' + (i) + 'px');
			}
		}
	});
	}
});

$(function () {
    $(".dropdown li").on('mouseenter mouseleave', function (e) {
		if ($(window).width() > 991) {
			if ($('.dropdown-menu', this).length) {
				var elm = $('.dropdown-menu', this);
				var off = elm.offset();
				var l = off.left;
				var w = elm.width();
				var docW = $(window).width();
				var lr = ($(window).width() - (off.left + elm.outerWidth())); //offset right
				if ($("html").attr("dir") == 'rtl') {
					var isEntirelyVisible = (lr + w + 30 <= docW);
				}else{
					var isEntirelyVisible = (l + w + 30 <= docW);
				}
				if (!isEntirelyVisible) {
					$(elm).addClass('dropdown-menu-end');
					$(elm).parents('.dropdown:first').find('> a.dropdown-toggle > .arrow').addClass('arrow-end');
				} else {
					$(elm).removeClass('dropdown-menu-end');
					$(elm).parents('.dropdown:first').find('> a.dropdown-toggle > .arrow').removeClass('arrow-end');
				}
			}
		}
    });
});

// DropDown Arrow
$('.primary-menu').find('a.dropdown-toggle').append($('<i />').addClass('arrow'));

// Mobile Collapse Nav
$('.primary-menu .dropdown-toggle[href="#"], .primary-menu .dropdown-toggle[href!="#"] .arrow').on('click', function(e) {
	if ($('nav').hasClass('navbar-overlay') &&  $('nav').hasClass('navbar-expand-none') || $('nav').hasClass('navbar-sidebar')) {
			var ww = 4000;
		}else{
			var ww = 991;
	}
	if ($(window).width() < (ww)) {
        e.preventDefault();
        var $parentli = $(this).closest('li');
        $parentli.siblings('li').find('.dropdown-menu:visible').slideUp();
        $parentli.find('> .dropdown-menu').stop().slideToggle();
        $parentli.siblings('li').find('a .arrow.show').toggleClass('show');
		$parentli.find('> a .arrow').toggleClass('show');
	}
});

// Mobile Menu
$('.navbar-toggler').on('click', function() {
	$(this).toggleClass('show');
	$('#header.sticky-top-slide').find(".primary-menu").toggleClass("show");
});
$('.navbar-nav a:not(.dropdown-toggle)').on('click', function() {
    $('.navbar-collapse, .navbar-toggler').removeClass('show');
});

// Overlay Menu
$('.navbar-overlay .collapse').on('show.bs.collapse hide.bs.collapse', function(e) {
    e.preventDefault();
}),
$('.navbar-overlay [data-bs-toggle="collapse"]').on('click', function(e) {
   e.preventDefault();
   $($(this).data('bs-target')).toggleClass('show');
});

// Sidebar Menu
if($(".primary-menu").hasClass("navbar-sidebar")){
	$("body").addClass("sidebar");
}



/*--------------------------------------
    Lenis Smooth Scroll
---------------------------------------- */
// Initialize Lenis
const lenis = new Lenis({
  prevent: (node) => {
    return node.closest('.navbar-nav');
  }
});
// Use requestAnimationFrame to continuously update the scroll
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


/*------------------------------------
    Swiper Slider/Carousel
-------------------------------------- */
document.querySelectorAll('.swiper').forEach(function (el) {
    const data = el.dataset;

    const swiperOptions = {
        loop: data.loop === "true",
        slidesPerView: 1,
        effect: data.effect || "slide",
        spaceBetween: data.margin ? parseInt(data.margin) : 30,
		speed: parseInt(data.speed) || 400,
        autoplay: data.autoplay === "true" ? {
            delay: parseInt(data.delay) || 5000,
            disableOnInteraction: false
        } : false,
        navigation: {
            nextEl: el.querySelector('.swiper-button-next'),
            prevEl: el.querySelector('.swiper-button-prev'),
        },
        pagination: {
            el: el.querySelector('.swiper-pagination'),
            clickable: true
        },
        breakpoints: {
            0: {
                slidesPerView: parseInt(data.itemsXs) || 1
            },
            576: {
                slidesPerView: parseInt(data.itemsSm) || 1
            },
            768: {
                slidesPerView: parseInt(data.itemsMd) || 2
            },
            992: {
                slidesPerView: parseInt(data.itemsLg) || 2
            }
        }
    };
	if (data.effect === "fade") {
        swiperOptions.fadeEffect = {
            crossFade: true
        };
    }
    if (data.effect === "creative") {
        swiperOptions.creativeEffect = {
            prev: {
                shadow: true,
                translate: ["-120%", 0, -500],
            },
            next: {
                shadow: true,
                translate: ["120%", 0, -500],
            },
        };
    }
    new Swiper(el, swiperOptions);
});

/*------------------------------------
    GLightbox for Gallery
-------------------------------------- */
function initLightbox() {
  if (typeof GLightbox !== "undefined") {
    return GLightbox({
      selector: '.glightbox'
    });
  }
}
initLightbox();


/*------------------------------------
    WOW animation
-------------------------------------- */

$(".wow").each(function() {
 if ($(window).width() > 767) {
   var wow = new WOW({
     boxClass: 'wow',
     animateClass: 'animated',
     offset: 0,
     mobile: false,
     live: true
   });
  new WOW().init();
 }
});

/*------------------------
    Jarallax Bg
-------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  if (typeof jarallax !== "undefined") {
    jarallax(document.querySelectorAll('.jarallax'), {
      speed: 0.4
    });
  }
});


/*------------------------
   Tooltips
-------------------------- */
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})


/*------------------------
   Scroll to top
-------------------------- */
$(function () {
  const $btn = $('#back-to-top');
  let ticking = false;
  $(window).on('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        if ($(window).scrollTop() > 400) {
          $btn.addClass('show');
        } else {
          $btn.removeClass('show');
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  // Click scroll to top
  $btn.on("click", function () {
    $('html, body').animate({ scrollTop: 0 }, 600);
    return false;
  });
});

/*------------------------
   Contact Form
-------------------------- */
var form = $('#contact-form'); // contact form
var submit = $('#submit-btn'); // submit button

// form submit event
form.on('submit', function (e) {
	e.preventDefault(); // prevent default form submit

	if (typeof $('#google-recaptcha-v3').val() != "undefined") {
		grecaptcha.ready(function () {
			var site_key = $('#google-recaptcha-v3').attr('src').split("render=")[1];
			grecaptcha.execute(site_key, {action: 'contact'}).then(function (token) {
				var gdata = form.serialize() + '&g-recaptcha-response=' + token;
				$.ajax({
					url: 'php/mail.php',  // form action url
					type: 'POST', 		  // form submit method get/post
					dataType: 'json', 	  // request type html/json/xml
					data: gdata, 		  // serialize form data
					beforeSend: function () {
						submit.attr("disabled", "disabled");
						var loadingText = '<span role="status" aria-hidden="true" class="spinner-border spinner-border-sm align-self-center me-2"></span>Sending.....'; // change submit button text
						if (submit.html() !== loadingText) {
							submit.data('original-text', submit.html());
							submit.html(loadingText);
						}
					},
					success: function (data) {
						submit.before(data.Message).fadeIn("slow"); // fade in response data 
						submit.html(submit.data('original-text'));// reset submit button text
						submit.removeAttr("disabled", "disabled");
						if (data.response == 'success') {
							form.trigger('reset'); // reset form
						}
						setTimeout(function () {
							$('.alert-dismissible').fadeOut('slow', function(){
								$(this).remove();
							});
						}, 3000);
					},
					error: function (e) {
						console.log(e)
					}
				});
			});
		});
	} else {
		$.ajax({
			url: 'php/mail.php', // form action url
			type: 'POST', // form submit method get/post
			dataType: 'json', // request type html/json/xml
			data: form.serialize(), // serialize form data
			beforeSend: function () {
				submit.attr("disabled", "disabled");
				var loadingText = '<span role="status" aria-hidden="true" class="spinner-border spinner-border-sm align-self-center me-2"></span>Sending.....'; // change submit button text
				if (submit.html() !== loadingText) {
					submit.data('original-text', submit.html());
					submit.html(loadingText);
				}
			},
			success: function (data) {
				submit.before(data.Message).fadeIn("slow"); // fade in response data 
				submit.html(submit.data('original-text'));// reset submit button text
				submit.removeAttr("disabled", "disabled");
				if (data.response == 'success') {
					form.trigger('reset'); // reset form
				}
				setTimeout(function () {
					$('.alert-dismissible').fadeOut('slow', function(){
						$(this).remove();
					});
				}, 3500);
				if (typeof $('#recaptcha-v2').val() != "undefined") {
					grecaptcha.reset(); // reset reCaptcha
				}
			},
			error: function (e) {
				console.log(e)
			}
		});
	}
});

})(jQuery)