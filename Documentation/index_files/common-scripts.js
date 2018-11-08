/**
 * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.3
 */
;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(!e)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,e,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);

/*
 * jQuery One Page Nav Plugin
 * http://github.com/davist11/jQuery-One-Page-Nav
 *
 * Copyright (c) 2010 Trevor Davis (http://trevordavis.net)
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://jquery.org/license
 *
 * @version 2.2.0
 *
 * Example usage:
 * $('#nav').onePageNav({
 *   currentClass: 'current',
 *   changeHash: false,
 *   scrollSpeed: 750
 * });
 */

;(function($, window, document, undefined){

	// our plugin constructor
	var OnePageNav = function(elem, options){
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = this.$elem.data('plugin-options');
		this.$nav = this.$elem.find('a');
		this.$win = $(window);
		this.sections = {};
		this.didScroll = false;
		this.$doc = $(document);
		this.docHeight = this.$doc.height();
	};

	// the plugin prototype
	OnePageNav.prototype = {
		defaults: {
			currentClass: 'current',
			changeHash: false,
			easing: 'swing',
			filter: '',
			scrollSpeed: 750,
			scrollOffset: 0,
			scrollThreshold: 0.5,
			begin: false,
			end: false,
			scrollChange: false
		},

		init: function() {
			var self = this;
			
			// Introduce defaults that can be extended either
			// globally or using an object literal.
			self.config = $.extend({}, self.defaults, self.options, self.metadata);
			
			//Filter any links out of the nav
			if(self.config.filter !== '') {
				self.$nav = self.$nav.filter(self.config.filter);
			}
			
			//Handle clicks on the nav
			self.$nav.on('click.onePageNav', $.proxy(self.handleClick, self));

			//Get the section positions
			self.getPositions();
			
			//Handle scroll changes
			self.bindInterval();
			
			//Update the positions on resize too
			self.$win.on('resize.onePageNav', $.proxy(self.getPositions, self));

			return this;
		},
		
		adjustNav: function(self, $parent) {
			self.$elem.find('.' + self.config.currentClass).removeClass(self.config.currentClass);
			$parent.addClass(self.config.currentClass);
		},
		
		bindInterval: function() {
			var self = this;
			var docHeight;
			
			self.$win.on('scroll.onePageNav', function() {
				self.didScroll = true;
			});
			
			self.t = setInterval(function() {
				docHeight = self.$doc.height();
				
				//If it was scrolled
				if(self.didScroll) {
					self.didScroll = false;
					self.scrollChange();
				}
				
				//If the document height changes
				if(docHeight !== self.docHeight) {
					self.docHeight = docHeight;
					self.getPositions();
				}
			}, 250);
		},
		
		getHash: function($link) {
			return $link.attr('href').split('#')[1];
		},
		
		getPositions: function() {
			var self = this;
			var linkHref;
			var topPos;
			var $target;
			
			self.$nav.each(function() {
				linkHref = self.getHash($(this));
				$target = $('#' + linkHref);

				if($target.length) {
					topPos = $target.offset().top;
					self.sections[linkHref] = Math.round(topPos) - self.config.scrollOffset;
				}
			});
		},
		
		getSection: function(windowPos) {
			var returnValue = null;
			var windowHeight = Math.round(this.$win.height() * this.config.scrollThreshold);

			for(var section in this.sections) {
				if((this.sections[section] - windowHeight) < windowPos) {
					returnValue = section;
				}
			}
			
			return returnValue;
		},
		
		handleClick: function(e) {
			var self = this;
			var $link = $(e.currentTarget);
			var $parent = $link.parent();
			var newLoc = '#' + self.getHash($link);
			
			if(!$parent.hasClass(self.config.currentClass)) {
				//Start callback
				if(self.config.begin) {
					self.config.begin();
				}
				
				//Change the highlighted nav item
				self.adjustNav(self, $parent);
				
				//Removing the auto-adjust on scroll
				self.unbindInterval();
				
				//Scroll to the correct position
				$.scrollTo(newLoc, self.config.scrollSpeed, {
					axis: 'y',
					easing: self.config.easing,
					offset: {
						top: -self.config.scrollOffset
					},
					onAfter: function() {
						//Do we need to change the hash?
						if(self.config.changeHash) {
							window.location.hash = newLoc;
						}
						
						//Add the auto-adjust on scroll back in
						self.bindInterval();
						
						//End callback
						if(self.config.end) {
							self.config.end();
						}
					}
				});
			}

			e.preventDefault();
		},
		
		scrollChange: function() {
			var windowTop = this.$win.scrollTop();
			var position = this.getSection(windowTop);
			var $parent;
			
			//If the position is set
			if(position !== null) {
				$parent = this.$elem.find('a[href$="#' + position + '"]').parent();
				
				//If it's not already the current section
				if(!$parent.hasClass(this.config.currentClass)) {
					//Change the highlighted nav item
					this.adjustNav(this, $parent);
					
					//If there is a scrollChange callback
					if(this.config.scrollChange) {
						this.config.scrollChange($parent);
					}
				}
			}
		},
		
		unbindInterval: function() {
			clearInterval(this.t);
			this.$win.unbind('scroll.onePageNav');
		}
	};

	OnePageNav.defaults = OnePageNav.prototype.defaults;

	$.fn.onePageNav = function(options) {
		return this.each(function() {
			new OnePageNav(this, options).init();
		});
	};
	
})( jQuery, window , document );


;(function($){
	
	
		$('body').on('change', 'input.screenshots',function(){
			
			var inputs = $('input.screenshots').length;
			
			if( inputs <= 4 ) {
				var $input = $(this);
				var clone = $input.clone();
				$( clone ).insertAfter( $input );
			}
			
		});
	
	
	
		$(window).scroll(function(){
			if ($(this).scrollTop() > 100) {
				$('#scrollup').stop().fadeIn();
			} else {
				$('#scrollup').stop().fadeOut();
			}
		}); 
		
		$('#scrollup').click(function(){
			$("html, body").animate({ scrollTop: 0 }, 600); 
			return false;
		});
	
		$('#btnRestorePassword').click( function() {
			
			var submit = $(this);
			
			if( submit.hasClass('processed') ) {
				return false;
			}
			
			var login = $('#resetPassLogin');
			var loginVal = login.val();
			var email = $('#resetPassEmail');
			var emailVal = email.val();
			
			if( $.trim( loginVal ) == '' ) {
				login.focus();
				return false;
			}
			
			if( $.trim( emailVal ) == '' ) {
				email.focus();
				return false;
			}
			
			submit.addClass('processed').attr('disabled', 'disabled');
			
			$.ajax({
				url: wpdata.url+"wp-admin/admin-ajax.php",
				type: "POST",
				data: {
					'action' : 'theme_reset_password',
					'login' : loginVal,
					'email' : emailVal
				},
				success: function( response ) {
					
					if( response == 'ok' ) {
						
						$('.modal-title').html('');
						$('#restoreResultContent').html('Your new password was successfully emailed to you!');
						
						$('#restorePassword').modal('hide');
						$('#restoreResult').modal('show');
						
						submit.removeClass('processed').removeAttr('disabled');
						
					} else {

						$('#restoreResultContent').html( response );
						
						$('#restorePassword').modal('hide');
						$('#restoreResult').modal('show');
						
						submit.removeClass('processed').removeAttr('disabled');
						
					}
					
				}
			});
			
			return false;
		});
	
    $(function(){
        "use strict";
        $('select').customSelect();
    });

    $(function(){
        "use strict";
        /*$('input').iCheck({
            checkboxClass: 'icheckbox_minimal',
            radioClass: 'iradio_minimal',
            increaseArea: '20%' // optional
        });*/
    });



    $(".forum-body").css("cursor","pointer");
    $(".no-post").css("cursor","default");
    $(".forum-body").on("click",function(){
        if(!$(this).hasClass("no-post")){
            location.href = $(this).find("a").attr("href");
        }
    });
    $(".ticket-nav-details li").css("cursor","pointer")
    $(".ticket-nav-details li").on("click",function(){
        location.href = $(this).find("a").attr("href");
    });

    $("document").ready(function(){
//        alert("yum");
        checkNotification();

        $("#owl-demo").owlCarousel({

            navigation : true, // Show next and prev buttons
            slideSpeed : 300,
            paginationSpeed : 400,
            singleItem:true,

            // "singleItem:true" is a shortcut for:
            items : 1
            // itemsDesktop : false,
            // itemsDesktopSmall : false,
            // itemsTablet: false,
            // itemsMobile : false

        });

        $('ul.sf-menu').superfish({
            pathClass:	'current'
        });

    });
    /*---SYNTAX HIGHLIGHTER----*/
    $(function () {
    "use strict"
        window.prettyPrint && prettyPrint()
    });

		var wplabDocsContents = $('#docs-content');

		if( wplabDocsContents.length ) {
			wplabDocsContents.onePageNav({
				changeHash: true,
				scrollSpeed: 750,
				scrollOffset: 5
			});	
		}


})(jQuery);

function checkNotification(){
    "use strict"
    var $ = jQuery;
    $.getJSON(wpdata.url+"wp-admin/admin-ajax.php",{action:"notification_check"},function(data){
        //console.log(data.notifications.length);
        if(data.notifications.length>0){
            $("#admin-notification").show();
            for(i in data.notifications){
                n = data.notifications[i];
                var text = n.actor + " commented on " + n.ticket_name;
                showNotification(n.ticket_link, text, n.avatar, n.product_name);
            }
        }
    });
    setTimeout(checkNotification,5000);
}

function showNotification(link, text, img, product){

    var $ = jQuery;
    $.gritter.add({
        text: '<a href="'+link+'" class="full-noty"><span class="n-title">'+product+'</span> '+text+' </a> ',
        sticky: false,
        image: img,
        time: '6000'
    });
}