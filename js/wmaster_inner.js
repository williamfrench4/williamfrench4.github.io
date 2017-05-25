// ==UserScript==
// @name         wmaster
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @match        *://*/*
// @author       You
// @grant        none
// @require      http://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/* jshint undef: true, unused: true, esversion: 6 */
/* globals $, alert, console, document, window, URLSearchParams */


//alert(36);
$(function () {
  'use strict';
  //alert(8);
  //return;
  const
    dark_theme_background_color = '#000',
    dark_theme_background_rule  = 'background-color: ' + dark_theme_background_color + ';',
    dark_theme_foreground_color = '#0f0',
    dark_theme_foreground_rule  =            'color: ' + dark_theme_foreground_color + ';',
    program_name = 'wmaster';
  var
    alternate,
    alternates,
    alternates_length,
    css_text,
    css_rules,
    css_rules_split,
    css_hides,
    location,
    location_href,
    location_origin,
    location_pathname,
    page_level,
    prefix_index,
    site_data,
    sites_data,
    sites_data_by_prefix,
    sites_data_length,
    stylesheet;
    var unwanted_classes;
    var unwanted_classes_split;

  sites_data = [
    {
      name: 'New York Times',
      alternate_origins: ['https://cooking.nytimes.com'],
      alternate_prefixes: ['file:///root/wayback/nytimes/', 'file:///root/wayback/nytimes_todayspaper/'],
      count_words: {append: '.byline:last-of-type,.byline-column', prefix: ' ', subject: '.story-body'},
      css_article_rules: '' +
        '.masthead .masthead-menu li, .headline, .kicker, .dateline, .story-quote, .caption, figcaption {' + dark_theme_background_rule + dark_theme_foreground_rule + '}' + // NYT dark theme
        'h1, .dropcap {' + dark_theme_foreground_rule + '} .shell {padding-top: 0} .main {border-top: none} .nytg-chart {color: #000; background-color: #fff}' + // NYT dark theme
        '.App__app {margin-top: 0} .story-body-text {font-family: "Times New Roman"} .caption-text {font-family: Helvetica} .story-header, .image {position: relative}' +
        'figure.layout-large-horizontal .image img {width: 47%; margin-left: 30px}' +
        'figure.layout-small-horizontal .image img {width: 98%; margin-left: 5px}' +
        'figure.layout-large-vertical .image img {width: 47%; margin-left: 30px}' +
        'figure.layout-vertical-full-bleed .image img {width: 47%; margin-left: 30px}' +
        'figure.layout-jumbo-horizontal .image img {width: 87%; margin-left: 30px}' +
        ' figure.layout-jumbo-vertical .image img {width: 47%; margin-left: 30px}',
      css_article_hides: 'nav, #masthead, .newsletter-signup, #whats-next, #site-index, .story-meta-footer-sharetools, .comments-button, [id="18-insider-promo-module"], #obstruction-justice-promo, #how-republican-voted-on-health-bill, #brexit-latest-fallout-tracker,' +
        '#story-ad-1-wrapper, #story-ad-2-wrapper, #story-ad-3-wrapper, #story-ad-4-wrapper, #opinion-aca-callout, #next-steps-for-health-care-bill, [id="06up-acachart"], #house-vote-republican-health-care-bill, #morning-briefing-weather-module, #nyt-weather,' +
        '#related-combined-coverage, .text-ad, #comey-promo, figure.video, .page-footer, .story-info, .story-print-citation, #fbi-congress-trump-russia-investigations, .vis-survey-box, #oil-prices, #Ask-Real-Estate-Promo, #wannacry-ransomware-map,' +
        '#how-self-driving-cars-work, #ransomware-attack-coverage, #fall-upfront-2017, figure[id*=pullquote], figure[id*=email-promo], figure[id*=DAILY-player], #why-its-so-hard-to-have-an-independent-russia-investigation, #navigation-edge, #europe-terror-attacks, ' +
        '#document-Robert-Mueller-Special-Counsel-Russia, #julian-assange-timeline, #anthony-weiner-plea-agreement, #assange-fblive-promo',
      css_homepage_rules: '' +
        //'header {background-color: #aaa}' +
        '.summary {' + dark_theme_foreground_rule + '}' + // NYT dark theme
        '',
      css_homepage_hides: '#masthead-placeholder, .masthead-cap-container, div.editions.tab, #nytint-hp-watching, #site-index .section-header, #markets, .all-sections-button, #mini-navigation, #WelcomAd_optly',
      css_hides: '.ad',
      css_rules: '' + 
        'body, #masthead {' + dark_theme_background_rule + dark_theme_foreground_rule + '}' + // NYT dark theme
        '.story.theme-main .story-meta-footer {border-top: none; border-bottom: none}',
      dark_theme: 1, // to turn this off, change the 1 to a 0 and comment out all other lines that are commented "NYT dark theme"
      origin: 'https://www.nytimes.com',
      unwanted_query_fields: 'action clickSource contentCollection contentPlacement hp module pgtype _r ref region rref smid smtyp src version WT.nav WT.z_jog hF vS utm_campaign utm_content utm_medium utm_source t target',
      unwanted_classes: 'theme-pinned-masthead',
      customize: function () {
        const js_header_class_signature = 'Masthead-mastheadContainer--';
        var
          class_list,
          js_header_class_name = false,
          js_header_element,
          logo_element;
        if (location_href.indexOf('?') != -1) return; //alert(location_href);
        if (page_level == 2) {
          $('figure.video').css({'width': '30%', 'margin-left': '30px'});
          $('.g-artboard' ).css({'width': '90%', 'margin-left': '30px'});
          document.styleSheets[0].addRule('.g-artboard *, .g-graphic *, .nytg-chart *', 'background-color: transparent !important; color: #000 !important');
          //css_text += ' .interactive-graphic * {background-color: #fff !important; color: #000 !important}';
          js_header_element = $('#app>:first-child>:first-child') [0];
          if (js_header_element) {
            //console.log(44, js_header_element);
            class_list = js_header_element.classList;
            $.each(class_list, function (class_index, class_name) {
              //console.log(46, class_index, class_name);
              if (class_name.startsWith(js_header_class_signature)) {
                js_header_class_name = class_name;
                return false; // break out of class_list loop
              }
            });
            if (js_header_class_name) css_hides += '.' + js_header_class_name;
            else alert('class signature "' + js_header_class_signature + '" not found in list "' + class_list + '"');
            //console.log(47, css_hides);
          }
        } else {
          Object.freeze(document.location);
          logo_element = $('h2.branding') [0];
          if (logo_element) logo_element.innerHTML = '<img width="573" height="138" src="file:/home/will/public_html/green_york_times.png">';
          else console.log('warning: logo not found');
        }
        //remove_fixed_positioning(site_data);
      },
    },
    {
      name: 'Manchester Guardian',
      origin: 'https://www.theguardian.com',
      alternate_origins: ['https://interactive.guim.co.uk/'],
      alternate_prefixes: ['file:///root/wayback/guardian_uk/'],
      append_loaded_date: 'footer.l-footer',
      count_words: {append: '.content__dateline, .content__standfirst', subject: '.content__article-body'},
      css_article_rules: '.js-headline-text {font-weight: normal} p {line-height: 170%} a {border-bottom: none} figure.element-tweet {margin-right: 4rem} img.byline-img__img {background: transparent} .content__article-body {font-family: "Adobe Caslon Pro"}' +
        'a:link   [data-link-name="auto-linked-tag"] {color: #00e766} a:link:hover[data-link-name="auto-linked-tag"] {color: #00f} div.explainer {background-color: #002b45;' + dark_theme_foreground_rule + 'border: 1px solid ' + dark_theme_foreground_color + '}' + 
        '.tonal--tone-live, .tonal--tone-feature, .tonal--tone-comment, .content__main, .block--content, .navigation, .local-navigation, .navigation-container, .navigation:before, .top-navigation, .navigation-toggle, .navigation__container--first, .signposting, .tabs__tab--selected a, .tabs__tab--selected .tab__link, .tabs__tab a, .tabs__tab .tab__link {' + dark_theme_background_rule + '}' +
        '.signposting {border-right-width:0} a:visited[data-link-name="auto-linked-tag"] {color: #99d700} a:visited:hover[data-link-name="auto-linked-tag"] {color: purple} .tonal__standfirst, .tonal__header, .content__standfirst, .content__headline, .drop-cap {' + 
        dark_theme_background_rule + dark_theme_foreground_rule + '}' +
        '.tabs__tab {border-top: 0.0625rem solid #aaa}',
      css_hides: '.adverts, .site-message',
      css_article_hides: '.element-video, .contributions__epic, .js-outbrain, .related, .submeta, #onward, #more-in-section, .element-pullquote, .element-rich-link, .meta__twitter, .meta__extras, .meta__email, .selection-sharing, .block-share',
      css_homepage_hides: '.footer__email-container, div.image>div.video, #securedrop',
      dark_theme: 1,
    },
    {
      name: 'Washington Post',
      origin: 'https://www.washingtonpost.com',
      alternate_origins: ['http://www.washingtonpost.com', 'https://live.washingtonpost.com'],
      alternate_prefixes: ['file:///root/wayback/washingtonpost/'],
      count_words: {append: '.pg-pubDate, .bottomizer, .pb-sig-line, .pbHeader', subject: '#article-body>article, #pg-content>article'},
      css_article_rules: '#main-content {background-image: none} #article-body, article p, .pg-bodyCopy, h1 {' + dark_theme_foreground_rule + 'text-shadow: none} #et-nav {position: absolute}' + //.pb-f-homepage-story {background-color: #300},
        '.headline {font-family: "PostoniWide", Georgia, serif} a, .powerpost-header, .layout_article #top-content {border-bottom: none} p {line-height: 155%} body {overflow-y: visible} .skin.skin-card, .skin.skin-button {' + dark_theme_foreground_rule + dark_theme_background_rule + '}',
      css_article_hides: '#wp-header, #top-furniture, .pb-f-ad-flex-2, .pb-f-ad-flex-3, .pb-f-games-gamesWidget, .pb-f-page-footer-v2, .pb-f-page-recommended-strip, .pb-f-page-editors-picks, .chain-wrapper, .extra, .pb-f-generic-promo-image, .interstitial-link,' +
        '.pg-interstitial-link, .pb-f-posttv-sticky-player, .pb-f-posttv-sticky-player-powa, .pb-f-article-article-author-bio, .pb-tool.email, .pb-f-page-newsletter-inLine, .pb-f-page-comments, .inline-video, [channel="wp.com"], .pb-f-page-jobs-search,' +
        '.pb-f-homepage-story, .pb-f-sharebars-top-share-bar, .wp_signin, #wp_Signin, .inline-graphic-linked, .share-individual, .pb-f-page-trump-can-he-do-that-podcast, .pb-f-page-post-most img',
      css_homepage_rules: 'header {position: relative} .pb-f-homepage-story .headline a, .related-links a, #bottom-content a {font-family: "PostoniWide", Georgia, serif; font-weight: normal}',
      css_homepage_hides: '.pb-f-homepage-brandconnect-sidebar, .section-story-photo-1',
      unwanted_query_fields: 'hpid tid utm_term wpisrc wpmk',
      customize: function () {
        var stylesheet_links = $("link[rel='stylesheet']");
        stylesheet_links.each(function () {
          var stylesheet_link = this;
          var stylesheet_link_href = stylesheet_link.href;
          //console.log(stylesheet_link_href);
          var alt_prefix = 'file://www.washingtonpost.com/';
          if (stylesheet_link_href.startsWith(alt_prefix)) {stylesheet_link.href = site_data.origin + stylesheet_link_href.substring(alt_prefix.length - 1);}
          alt_prefix = 'file:///';
          if (stylesheet_link_href.startsWith(alt_prefix)) {stylesheet_link.href = site_data.origin + stylesheet_link_href.substring(alt_prefix.length - 1);}
          //console.log(stylesheet_link.href);
        });
        if (page_level == 2) {
          $('article>p, article>p>i').each(function (element_index, element) {
            var $element = $(element);
            var element_contents = $element.contents();
            if (element_contents.length == 3 && element_contents [0].textContent == "[") $element.hide();
            //console.log(85, $(element).contents() [0], ($(element).contents() [0].textContent == "["));
          });
          $('img.lzyld').each(function (element_index, element) {
            var $element = $(element);
            $element.css({'padding-top': '0'});
            element.src = element.dataset.hiRes;
          });
        $('div.inline-content:has([data-slug="a-look-at-president-trumps-first-year-in-office-so-far"])').hide();
        }
        //regularize_links(site_data);
      }
    },
    {
      name: 'McClatchy DC Bureau',
      origin: 'http://www.mcclatchydc.com',
      css_article_hides: '.share-tools-wrapper, #ndnWidget, .highline-quote, #story-related, .wf_interstitial_link',
      customize: function () {
        var
          content_body_element = $('#content-body-'),
          content_body_element_children = content_body_element.children();
        //console.log(41, content_body_element, content_body_element_children);
        //window.c = [];
        content_body_element_children.each(function(chunk_index, chunk_element) {
          var
            chunk_direct_text,
            chunk_element_child,
            chunk_element_children = chunk_element.children;
          if (chunk_element_children.length == 1) {
            chunk_element_child = chunk_element_children [0];
            if (chunk_element_child.tagName == 'A') {
              chunk_direct_text = direct_text_content(chunk_element);
              if (chunk_direct_text == '[RELATED: ]' || (chunk_direct_text === '' && chunk_element_child.textContent [0] == '[')) {
                $(chunk_element).addClass('wf_interstitial_link');
              }
            }
          }
          //console.log(45, chunk_element, direct_text_content(chunk_element), chunk_element_children);
          //if (direct_text_content(chunk_element) == '' && 
        });
        //console.log(47, direct_text_content(content_body_element_children [61]));
        //console.log(49, direct_text_content(content_body_element_children [62]));
      }
    },
    {
      name: 'The Verge',
      origin: 'https://www.theverge.com',
      css_article_hides: '.c-entry-content>[class^=c-float-]>aside>q',
    },
    {
      name: 'Vox',
      origin: 'https://www.vox.com',
      css_article_hides: '.main-social, .c-article-feedback, .c-tab-bar',
      css_rules: 'header .l-wrapper {max-width: none}',
    },
    {
      name: 'USA Today',
      origin: 'https://www.usatoday.com',
      css_article_hides: '.utility-bar-wrap, .overlay-arrows, .site-header-inner-wrap-fixed, .close-wrap, .feed-stories-module, .interactive-poll-module, .inline-share-tools-asset',
      count_words: {append: '.asset-metabar', subject: '[itemprop=articleBody'},
    },
    {
      name: 'Slate',
      origin: 'http://www.slate.com',
      css_article_hides: '.bottom-banner, .rubricautofeature, .top-comment, .follow-links',
      css_article_rules: '.about-the-author.fancy {background: none} .about-the-author.fancy .author-bio {border-bottom: none}',
    },
    {
      name: 'Daily Beast',
      origin: 'https://www.thedailybeast.com',
      alternate_origins: ['http://www.thedailybeast.com'],
      count_words: {append: '.ArticleBody__byline', subject: 'article.Body'},
      css_article_hides: '.share-icons, .InlineNewsletter',
    },
    {
      name: 'Talking Points Memo',
      origin: 'http://talkingpointsmemo.com',
      count_words: {append: '.FeatureByline', subject: '.Feature'},
      css_article_hides: '.FeatureSocial, .FeatureShare, .Daybreaker, .Hive, .Facebook, .FeatureByline__FacebookLike, .FeatureByline__Count, .BottomAdSlot, .Footer__ExtendBackground, ' +
        '.Feature__Revcontent, .EmbedComments',
    },
    {
      name: 'DCommentary',
      origin: 'Dhttps://www.commentarymagazine.com',
      //css_article_rules: '.super {background: none} h1>span, h1 {background-color: transparent}',
      //css_article_hides: '#onesignal-bell-container, .advads-background, #js-sticky-contents',
    },
    {
      name: 'Politico',
      origin: 'http://www.politico.com',
      css_article_rules: '.super {background: none} h1>span, h1 {background-color: transparent}',
      css_article_hides: '.story-interrupt, .story-tools, .story-related, .story-share',
      count_words: {append: '.timestamp', subject: '.story-text'},
    },
    {
      name: 'FiveThirtyEight',
      origin: 'https://fivethirtyeight.com',
      css_article_rules: '.site-main, .site-wrapper, .header-global, .header-global-wrapper {background-color: inherit} .header-global-logo {max-width: 210px; background-color: #888; padding:6px 0 3px 6px}',
      css_article_hides: '.sticky, #secondary, .share',
      count_words: {append: '.datetime', subject: '.entry-content'}, 
      //dark_theme: 2,
    },
    {
      name: 'The Independent',
      origin: 'http://www.independent.co.uk',
      css_article_rules: 'header {position: static}',
      css_article_hides: '.hide, .partner-slots, .fb-like, .relatedlinkslist, .layout-component-i100, .layout-component-ines-video-sidebar, .box-comments:first-of-type, .syndication-btn',
      customize: function () {
        var elements = $('.box-comments');
        var elements_length = elements.length;
        //console.log(55, elements);
        if (elements_length == 3) {
          $(elements [0]).addClass('hide');
          //console.log(56, elements [0]);
          $(elements [1]).addClass('hide');
        } else {
          alert('warning: expected 3 elements, found:', elements);
        }
      },
      dark_theme: 0,
    },
    {
      name: 'The Atlantic',
      origin: 'https://www.theatlantic.com',
      count_words: {append: '.article-cover-extra', subject: '.article-body'},
      //count_words_grafs: true,
      css_article_hides: '.module-related.video, .js-inject-promo, .social-kit-top, .article-tools',
      css_article_rules: 'figure.lead-img .img {outline: none} .article-cover-extra {padding-bottom: 0; border-bottom: none}',
    },
    {
      name: 'National Review',
      origin: 'http://www.nationalreview.com',
      count_words: {append: 'time', subject: '[itemprop="articleBody"]'},
      css_article_hides: '.horizontal-share-menu, .twitter-follow-header, .pullquote',
      //dark_theme: 0,
    },
    {
      name: 'The Federalist',
      origin: 'http://thefederalist.com',
      customize: function () {
        $('.entry-content>div:has(.perma-ad-wrapper)').hide();
      },
      dark_theme: 0,
    },
    {
      name: 'Associated Press',
      origin: 'https://www.apnews.com',
      count_words: {append: '.mobile h6', subject: '.articleBody'},
      css_article_rules: '.articleView {padding-top: 0}',
      css_article_hides: '#drawerMenu, .mobileTitle ul',
    },
    {
      name: 'Reuters',
      origin: 'http://www.reuters.com',
      count_words: {append: '#article-byline', subject: '#article-text', nbsp_size: '100%'},
      css_article_hides: '#headerNav, .edition-header, .core-share, .related-content',
      css_article_rules: '.wmaster_total_words_count {font-size: 150%; margin-left: 0.3em}',
      unwanted_classes: 'mod-sticky-article article-sticky',
    },
    {
      name: 'Time Magazine',
      origin: 'http://time.com',
      dark_theme: 2,
      count_words: {append: '#editorial-article-wrapper-container>:first-child>:first-child>:first-child>:first-child>:first-child', subject: 'article'},
      //css_article_hides: '.clay-share',
      css_article_rules: 'p:first-letter {' + dark_theme_foreground_rule + '}',
      //css_homepage_rules: '.newsHeadlinesByPublication section, .dek, .hed {' + dark_theme_background_rule + '}',
    },
    {
      name: 'New York Magazine',
      origin: 'http://nymag.com',
      dark_theme: 1,
      count_words: {append: '.article-timestamp', subject: '.article-content'},
      css_article_hides: '.clay-share',
      css_article_rules: 'h1, p, figcaption, time, .by-authors {' + dark_theme_foreground_rule + '} blockquote, blockquote p {' + dark_theme_foreground_rule + 'padding: 0 0 0 14px; border-left: 1px solid #3a3} blockquote:before {border-top: none}',
      css_homepage_rules: '.newsHeadlinesByPublication section, .dek, .hed {' + dark_theme_background_rule + '}',
    },
    {
      name: 'The New Yorker',
      origin: 'http://www.newyorker.com',
      count_words: {append: '.byline-and-date', subject: '#content'},
      //css_article_rules: '.single-post #articleBody p a, .single-post #articleBody .gallery-caption a, .single-post #articleBody u, .articleBody p a, .articleBody .gallery-caption a, .articleBody u, .author-masthead p a, .author-masthead .gallery-caption a, .author-masthead u {text-shadow: none; background: none}',
      css_article_rules: 'a {text-shadow: none; background: none}',
      css_article_hides: 'iframe, .social-module, .strongbox-promo-wrapper, .social-hover',
      css_homepage_hides: '.fixed-topnav, iframe, #strongbox-promo',
      customize: function () {
        var
          logo_element;
        if (location_href.indexOf('?') != -1) alert(location_href);
        if (page_level == 2) {
        } else {
          logo_element = $('h1') [0];
          if (logo_element) logo_element.innerHTML = '<img width="400" height="94" src="file:/home/will/public_html/green_yorker.png">';
          else console.log('warning: logo not found');
        }
        //remove_fixed_positioning(site_data);
      },
      unwanted_classes: 'js-sticky-wrap',
    },
    {
      name: 'The Nation',
      origin: 'https://www.thenation.com',
      css_article_hides: '.header-bar.utility, .sticky, .twitter-quote, .takeaction, .article-share, #paywall, aside.related-article',
      css_article_rules: 'body {overflow: visible}',
      count_words: {append: '.byline', subject: '.article-body'},
    },
    {
      name: 'The Week',
      origin: 'http://theweek.com',
      css_article_rules: '#sub-header {margin-top: 50px}',
      css_article_hides: '.managed-ad, .appendedAds',
      count_words: {append: '.article-date', subject: '.article-body'},
    },
    {
      name: 'Salon',
      origin: 'http://www.salon.com',
    },
    {
      name: 'PJ Media',
      origin: 'https://pjmedia.com',
      css_article_hides: '.navbar-scroll',
    },
    {
      name: 'Los Angeles Times',
      origin: 'http://www.latimes.com',
      css_article_hides: '.trb_nh_lw, .trb_mh_adB, .trb_sc, .trb_ar_bc, .trb_gptAd.trb_ar_rail_ad, .trb_embed[data-content-type=story], .wf_interstitial_link',
      css_article_rules: '.trb_mh {margin-top: 70px} .trb_ar_page[data-content-page="1"]>p:first-child:first-letter {' + dark_theme_foreground_rule + '}' +
        ' a:link[   href^="/topic/"] {color: #00e766} a:link:hover[href^="/topic/"] {color: #00f}' +
        ' a:visited[href^="/topic/"] {color: #99d700} a:visited:hover[href^="/topic/"] {color: purple}' ,
      count_words: {append: '.trb_ar_dateline', subject: 'div[itemprop="articleBody"]', nbsp_size: '100%'},
      customize: function () {
        var
          chunks = $('div[itemprop="articleBody"] p');
        console.log(41, chunks);
        //window.c = [];
        chunks.each(function(chunk_index, chunk_element) {
          const
            children = chunk_element.children,
            debug = true;
          var
            child,
            grandchild,
            grandchildren,
            text;
          if (children.length == 1) {
            if (debug) console.log(42);
            child = children [0];
            if (debug) console.log(43, child);
            if (child.tagName == 'STRONG') {
              if (debug) console.log(44);
              text = direct_text_content(child);
              if (debug) console.log(45, text);
              if (text === '') {
                if (debug) console.log(46);
                grandchildren = child.children;
                if (debug) console.log(47, grandchildren);
                if (grandchildren.length == 1) {
                  if (debug) console.log(48);
                  grandchild = grandchildren [0];
                  if (debug) console.log(49, grandchild);
                  if (grandchild.tagName == 'A') {
                    if (debug) console.log(50);
                    text = direct_text_content(grandchild);
                    if (debug) console.log(51);
                    if (text [text.length - 1] == '»') {
                      if (debug) console.log(52);
                      $(chunk_element).addClass('wf_interstitial_link');
                    }
                  }
                }
              }
            }
          }
          //console.log(45, chunk_element, direct_text_content(chunk_element), chunk_element_children);
          //if (direct_text_content(chunk_element) == '' && 
        });
        //console.log(47, direct_text_content(content_body_element_children [61]));
        //console.log(49, direct_text_content(content_body_element_children [62]));
      }
    },
    {name: 'Just Security'          , origin: 'https://www.justsecurity.org'},
    {name: 'Washington Examiner'    , origin: 'http://www.washingtonexaminer.com'},
    {name: 'Medium'                 , origin: 'https://medium.com'                   , css_article_rules: '.u-fixed, .metabar--affixed {position: static}'},
    {name: 'New York Post'          , origin: 'http://nypost.com'                    , css_article_hides: '.floating-share'},
    {name: 'Stack Overflow'         , origin: 'http://stackoverflow.com'             , dark_theme: 0},
    {name: 'Review of Ophthalmology', origin: 'https://www.reviewofophthalmology.com'},
    {name: 'The Economist'          , origin: 'http://www.economist.com'             , css_article_hides: '.latest-updates-panel__container'},
    {name: 'The Ringer'             , origin: 'https://theringer.com'                , css_article_hides: '.js-postShareWidget, .metabar--spacer', unwanted_classes: 'u-fixed metabar'},
    {name: 'Reason'                 , origin: 'http://reason.com'                    , css_article_rules: 'html, body {font-family: Georgia}'},
    {name: 'Rolling Stone'          , origin: 'http://www.rollingstone.com'          , css_article_rules: 'header {position: static}', dark_theme: 0},
    {name: 'Wikipedia'              , origin: 'https://en.wikipedia.org'             , dark_theme: 0},
    {name: 'Spectator'              , origin: 'https://www.spectator.co.uk'          , dark_theme: 0, css_article_rules: '.floatyFloaty {position: static}', css_article_hides: '.article-promo'},
    {name: 'Local wayback'          , alternate_prefixes: ['file:///root/wayback/'], append_loaded_date: false, count_words_subject: false},
  ];
  //console.table(sites_data);
  window.sites_data = sites_data;
  
  sites_data_by_prefix = {};
  $.each(sites_data, function (site_index, site_data) {
    var
      alternate_origins  = site_data.alternate_origins,
      alternate_prefixes = site_data.alternate_prefixes,
      count_words_settings,
      remove_fixed_positioning_settings,
      origin = site_data.origin,
      prefixes = [],
      unwanted_query_fields = site_data.unwanted_query_fields;
    if (origin) prefixes = prefixes.concat(origin);
    if (alternate_origins ) prefixes = prefixes.concat(alternate_origins );
    if (alternate_prefixes) prefixes = prefixes.concat(alternate_prefixes);
    if (unwanted_query_fields) site_data.unwanted_query_fields_array = unwanted_query_fields.split(/\s+/);
    //console.log(34, site_data.unwanted_query_fields_array);
    //console.log(35, prefixes);
    $.each(prefixes, function (prefix_index, prefix) {
      if (sites_data_by_prefix.hasOwnProperty(prefix)) console.log('warning: URL prefix "' + prefix + '" is a duplicate!');
      else sites_data_by_prefix [prefix] = site_data;
    });
    //console.log(74, site_data.append_loaded_date);
    if      (!site_data                 .hasOwnProperty('append_loaded_date'      )) site_data.append_loaded_date             = 'body';
    if      (!site_data                 .hasOwnProperty('dark_theme'              )) site_data.dark_theme                     = 1;
    if      (!site_data                 .hasOwnProperty('std_link_colors'         )) site_data.std_link_colors                = true;

    if      (!site_data                 .hasOwnProperty('count_words'             )) site_data.count_words                    = {};
    count_words_settings = site_data.count_words;
    if      (!count_words_settings      .hasOwnProperty('append'                  )) count_words_settings.append              = 'body';
    if      (!count_words_settings      .hasOwnProperty('nbsp_size'               )) count_words_settings.nbsp_size           = '50%';
    if      (!count_words_settings      .hasOwnProperty('subject'                 )) count_words_settings.subject             = 'body';
    if      (!count_words_settings      .hasOwnProperty(      'prefix'            )) count_words_settings.      prefix        = '';
    if      (!count_words_settings      .hasOwnProperty( 'graf_prefix'            )) count_words_settings. graf_prefix        = count_words_settings.prefix;
    if      (!count_words_settings      .hasOwnProperty('total_prefix'            )) count_words_settings.total_prefix        = count_words_settings.prefix;

    if      (!site_data                 .hasOwnProperty('remove_fixed_positioning')) site_data.remove_fixed_positioning       = {};
    else if ( site_data.remove_fixed_positioning === false                         ) site_data.remove_fixed_positioning       = {enable: false};
    remove_fixed_positioning_settings = site_data.remove_fixed_positioning;
    if      (!remove_fixed_positioning_settings  .hasOwnProperty('enable'         )) remove_fixed_positioning_settings.enable = true;




    //console.log(76, site_data.append_loaded_date);
  });
  //console.log(36, sites_data_by_prefix);
  window.sites_data2 = sites_data;
  

  function direct_text_content(element) {
    // Return the text from this element only, not including any text from child elements
    var text = '';
    $.each(element.childNodes, function (child_node_index, child_node) {
      if (child_node.nodeType === 3) text += child_node.textContent;
    });
    return text;
  }


  var dateFormat = function () {
    var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
          val = String(val);
          len = len || 2;
          while (val.length < len) val = "0" + val;
          return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
      var dF = dateFormat;

      // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
      if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
        mask = date;
        date = undefined;
      }

      // Passing date through Date applies Date.parse, if necessary
      date = date ? new Date(date) : new Date();
      if (isNaN(date)) throw SyntaxError("invalid date");

      mask = String(dF.masks[mask] || mask || dF.masks["default"]);

      // Allow setting the utc argument via the mask
      if (mask.slice(0, 4) == "UTC:") {
        mask = mask.slice(4);
        utc = true;
      }

      var	_ = utc ? "getUTC" : "get",
          d = date[_ + "Date"](),
          D = date[_ + "Day"](),
          m = date[_ + "Month"](),
          y = date[_ + "FullYear"](),
          H = date[_ + "Hours"](),
          M = date[_ + "Minutes"](),
          s = date[_ + "Seconds"](),
          L = date[_ + "Milliseconds"](),
          o = utc ? 0 : date.getTimezoneOffset(),
          flags = {
            d:    d,
            dd:   pad(d),
            ddd:  dF.i18n.dayNames[D],
            dddd: dF.i18n.dayNames[D + 7],
            m:    m + 1,
            mm:   pad(m + 1),
            mmm:  dF.i18n.monthNames[m],
            mmmm: dF.i18n.monthNames[m + 12],
            yy:   String(y).slice(2),
            yyyy: y,
            h:    H % 12 || 12,
            hh:   pad(H % 12 || 12),
            H:    H,
            HH:   pad(H),
            M:    M,
            MM:   pad(M),
            s:    s,
            ss:   pad(s),
            l:    pad(L, 3),
            L:    pad(L > 99 ? Math.round(L / 10) : L),
            t:    H < 12 ? "a"  : "p",
            tt:   H < 12 ? "am" : "pm",
            T:    H < 12 ? "A"  : "P",
            TT:   H < 12 ? "AM" : "PM",
            Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
            o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
          };

      return mask.replace(token, function ($0) {
        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
      });
    };
  }();

  // Some common format strings
  dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
  };

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };

  // For convenience...
  Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
  };


  function dark_theme(aggressiveness_level) {
    if (!aggressiveness_level) return;
    //$('body').css({'background-color': '' + dark_theme_background_color + ' !important; color: ' + dark_theme_foreground_color + ' !important'});
    if (aggressiveness_level > 1) document.styleSheets[0].addRule('*', 'background-color: ' + dark_theme_background_color + ' !important; color: ' + dark_theme_foreground_color + ' !important');
    css_rules += 'body {' + dark_theme_background_rule + dark_theme_foreground_rule + '} ::-webkit-scrollbar {height: 2px; width: 2px} ::-webkit-scrollbar-track {background: #000} ::-webkit-scrollbar-thumb {background: #f00} ';
  }

  function std_link_colors() {
    css_rules += ' a {text-decoration: none}' +
      ' a:link, a:link h2, a:link h3, a:link h4, a:link h5, a:link div, a:link p, a:link span, a:link em {color: #00f}' +
      ' a:visited, a:visited h2, a:visited h3, a:visited h4, a:visited h5, a:visited div, a:visited p, a:visited span, a:visited em {color: #a0a}';
  }

  function regularize_links() {
    //console.log(10);
    $.each ($('a'), function (element_index, element) {
      //console.log(11);
      var
        href = element.href,
        origin = element.origin,
        query_params,
        query_string,
        query_string_index,
        site_data,
        unwanted_query_fields_array,
        unwanted_query_fields_array_length,
        url_without_query_string;
      //if (typeof href === 'undefined') return;
      site_data = sites_data_by_prefix [origin];
      if (typeof site_data === 'undefined') return;
      unwanted_query_fields_array = site_data.unwanted_query_fields_array;
      if (!unwanted_query_fields_array) return;
      unwanted_query_fields_array_length = unwanted_query_fields_array.length;
      query_string_index = href.indexOf('?');
      console.log(12, href);
      if (query_string_index !== -1) {
        console.log('20');
        query_string = href.substring(query_string_index);
        url_without_query_string = href.substring(0, query_string_index);
        query_params = new URLSearchParams(query_string);
        console.log(22, query_params.toString());
        $.each(unwanted_query_fields_array, function (field_index, field) {
          query_params.delete(field);
        });
        console.log(23, query_params.toString());
        query_string = query_params.toString();
        console.log(24, query_string);
        href = url_without_query_string;
        if (query_string.length) href += '?' + query_string;
        element.href = href;
      }
      console.log(17, href);
    });
  }

  function count_words(site_data) {
    var
      words_count_name = program_name +  '_words_count',
      graf_words_count     ,  graf_words_count_name = words_count_name + '_graf',
      total_words_count = 0, total_words_count_name = words_count_name + '_total',
      html_prefix = '<span class="' + words_count_name + ' ',
      html_suffix = '<span class="nbsp">&nbsp;</span>words</span>',
      html_graf_prefix,
      settings = site_data.count_words,
      nbsp_size         = settings.nbsp_size,
      append_selector   = settings.append , $append_elements,
      prepend_selector  = settings.prepend, $prepend_elements,
      subject_selector  = settings.subject, $subject_elements = $(subject_selector),
      show_graf_counts  = settings.grafs, output;
    console.log(92, subject_selector, $subject_elements);
    if (show_graf_counts) html_graf_prefix = html_prefix + graf_words_count_name + '">' + settings.graf_prefix;
    $subject_elements.find('p').each(function (graf_index, graf) {
      var
        $graf = $(graf),
        graf_text = $graf.text();
      if (graf_text.length) {
        graf_words_count = graf_text.split(/\s+/).length;
        if (show_graf_counts) $graf.append(html_graf_prefix + graf_words_count + html_suffix);
        total_words_count += graf_words_count;
      }
    });
    output = html_prefix + total_words_count_name + '">' + settings.total_prefix + total_words_count + html_suffix;
    if (append_selector) {
      if (append_selector == subject_selector) $append_elements = $subject_elements;
      else                                     $append_elements = $(append_selector);
      $append_elements.append(output);
      console.log(94, append_selector, $append_elements);
    } else if (!prepend_selector) {
      prepend_selector = subject_selector;
    }
    if (prepend_selector) {
      if      (prepend_selector == subject_selector) $prepend_elements = $subject_elements;
      else if (prepend_selector ==  append_selector) $prepend_elements =  $append_elements;
      else $prepend_elements = $(prepend_selector);
      $prepend_elements.prepend(output);
      console.log(96, prepend_selector, $prepend_elements);
    }
    console.log(97, nbsp_size);
    if (show_graf_counts) css_rules += '.' +  graf_words_count_name + ' {color: #333}';
    css_rules                       += '.' + total_words_count_name + ' {color: #880} .' + total_words_count_name + '>.nbsp {font-size: ' + nbsp_size + '}';
  }
  
  function append_loaded_date(e) {
    var html = '';
    //html += location_href + '<br>';
    html += 'Loaded ' + dateFormat(new Date(), 'dddd, mmmm dS, yyyy @ h:MM:ss TT') + '<br><br>';
    e.append(html);
  }
  
  function remove_fixed_positioning(site_data) {
    var settings = site_data.remove_fixed_positioning;
    console.log('remove_fixed_positioning: called with settings: ' + settings);
    if (settings) {} // stub
    $('*').each(function () {
      var $this = $(this);
      if ($this.css('position') == 'fixed' || $this.css('position') == 'sticky') {
        console.log('remove_fixed_positioning:', this);
        $this.css({'position': 'absolute'});
      }
    });
  }


  location = window.location;
  location_href = location.href;
  location_origin = location.origin;
  location_pathname = location.pathname;
  sites_data_length = sites_data.length;
  $.each (sites_data, function (site_index, test_site_data) {
    test_site_data.id = site_index;
    //console.log(33, test_site_data.name, location_origin);
    if (test_site_data.origin && location_origin == test_site_data.origin) {
      site_data = test_site_data;
      if (location_href == location_origin + '/') {
        page_level = 0;
      } else {
        page_level = 2;
      }
      return false;
    }
    if (test_site_data.alternate_prefixes) {
      alternates = test_site_data.alternate_prefixes;
      alternates_length = alternates.length;
      for (prefix_index = 0; prefix_index < alternates_length; prefix_index++) {
        alternate = alternates [prefix_index];
        if (location_href.startsWith(alternate) && location_href != alternate) {
          site_data = test_site_data;
          page_level = 0;
          break;
        }
      }
      if (site_data) return false;
    }
    if (test_site_data.alternate_origins) {
      alternates = test_site_data.alternate_origins;
      alternates_length = alternates.length;
      for (prefix_index = 0; prefix_index < alternates_length; prefix_index++) {
        alternate = alternates [prefix_index];
        //console.log(81, alternate, location_origin, location_href);
        if (location_href.startsWith(alternate)) {
          site_data = test_site_data;
          if (location_href == alternate) {
            page_level = 1;
          } else {
            page_level = 2;
          }
          break;
        }
      }
      if (site_data) return false;
    }
  });
  if (site_data) {
    //alert(site_data.name + ' detected');
    if (site_data.css_hides) css_hides = [site_data.css_hides];
    else css_hides = [];
    if (site_data.css_rules) css_rules = site_data.css_rules;
    else css_rules = '';
    css_text = '';
    if (site_data.dark_theme) dark_theme(site_data.dark_theme);
    if (site_data.std_link_colors) std_link_colors();
    //console.log(44, site_data);
    regularize_links();
    //console.log(46, site_data);
    unwanted_classes = site_data.unwanted_classes;
    //console.log(14);
    if (unwanted_classes) {
       unwanted_classes_split = unwanted_classes.split(/\s+/);
      $.each(unwanted_classes_split, function(unwanted_class_index, unwanted_class) {
        if (!unwanted_class.length) return;
        //console.log(15, $('.' + unwanted_class));
        $('.' + unwanted_class).removeClass(unwanted_class);
      });
    }
    if (site_data.remove_fixed_positioning) remove_fixed_positioning(site_data);
    if (site_data.append_loaded_date) append_loaded_date($(site_data.append_loaded_date));
    //console.log(47, css_hides);
    if (page_level === 0) {
      if (site_data.css_homepage_hides) css_hides.push(    site_data.css_homepage_hides);
      if (site_data.css_homepage_rules) css_rules += ' ' + site_data.css_homepage_rules ;
    } else if (page_level == 2) {
      if (site_data.css_article_hides ) css_hides.push(    site_data. css_article_hides);
      if (site_data.css_article_rules ) css_rules += ' ' + site_data. css_article_rules ;
      count_words(site_data);
    }
    if (site_data.customize) site_data.customize();
    //console.log(48, css_hides);
    if (css_hides) css_rules += ' ' + css_hides.join(', ') + ' {display: none}';
    //console.log(55, css_rules);
    css_rules_split = css_rules.split('}');
    //console.log(63, css_text);
    //console.log(64, css_rules);
    $.each(css_rules_split, function (rule_index, rule) {
      //console.log(56, rule);
      if (!rule) return;
      var
        rule_split = rule.split('{'),
        rule_text,
        declarations = rule_split [1],
        declarations_split = declarations.split(';');
      //console.log(25, declarations, declarations_split);
      rule_text = rule_split [0] + ' {';
      $.each(declarations_split, function (declaration_index, declaration) {
        //console.log(55, declaration);
        if (!declaration) return;
        if (declaration_index) rule_text += '; ';
        rule_text += $.trim(declaration) + ' !important';
      });
      rule_text += '}';
      //console.log('65 ' + rule_text);
      css_text += ' ' + rule_text;
    });
    stylesheet = document.createElement('style');
    stylesheet.innerHTML = css_text;
    //alert(css_text);
    document.body.appendChild(stylesheet);
    window.sss=stylesheet;
  }
  //$('#anti-white-flash-curtain').remove();
  $.noConflict();
});
