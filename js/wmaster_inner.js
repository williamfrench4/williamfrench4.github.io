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
let DEBUGMODE;

//alert(36);
$(function () {
  'use strict';
  //alert(8);
  //return;
  const
    program_name           = 'wmaster',
    theme_background_color = '#000',
    theme_background_rule  = 'background: ' + theme_background_color + '; background-color: ' + theme_background_color + ';',
    theme_foreground_color = '#0f0',
    theme_foreground_rule  = 'color: '      + theme_foreground_color + '; text-shadow: none;';
  let hide_selector, page_level, raw_site_css, site_data, theme_background_selector, theme_foreground_selector, theme_selector;

  const sites_data = [
    {
      name: 'New York Times',
      alternate_origins: ['https://cooking.nytimes.com', 'https://douthat.blogs.nytimes.com', 'https://krugman.blogs.nytimes.com', 'https://kristof.blogs.nytimes.com', 'https://www.nytimes.com/section/magazine'],
      alternate_prefixes: ['file:///root/wayback/nytimes/', 'file:///root/wayback/nytimes_todayspaper/'],
      count_words: {append: '.byline:last-of-type, .byline-column', prefix: ' ', subject: '.story-body'},
      article_theme_selector: '.masthead .masthead-menu li, .headline, .kicker, .dateline, .story-quote, .caption, figcaption, input, textarea, .columnGroup', // NYT dark theme
      article_theme_background_selector: '.bcColumn, .cColumn', // NYT dark theme
      article_theme_foreground_selector: 'h1, h2, h3, h4, h5, h6, .byline, .dropcap, .g-artboard *, .g-graphic *, .nytg-chart *' +
        selector_for_elements_with_a_class_that_starts_with('ResponsiveMedia-captionText--'),
      article_css: '.App__app {margin-top: 0} .story-body-text {font-family: "Times New Roman"} .caption-text {font-family: sans-serif} .story-header, .image {position: relative}' +
        'input, textarea {background-image: none} .shell {padding-top: 0} .main {border-top: none} .nytg-chart {color: #000; background-color: #fff}' + // NYT dark theme
        selector_for_elements_with_a_class_that_starts_with('SectionBar-sectionBar--') + '{border-width: 0} ' +
        'figure.layout-vertical-full-bleed .image img {width: 47%; margin-left: 30px}' +
        'figure.layout-small-horizontal .image img {width: 98%; margin-left: 5px}' +
        'figure.layout-large-horizontal .image img {width: 47%; margin-left: 30px}' +
        'figure.layout-jumbo-horizontal .image img {width: 87%; margin-left: 30px}' +
        'figure.layout-large-vertical .image img {width: 47%; margin-left: 30px}' +
        'figure.layout-jumbo-vertical .image img {width: 47%; margin-left: 30px}',
      article_hide_selector: 'nav, #masthead, .newsletter-signup, #whats-next, #site-index, .story-meta-footer-sharetools, .comments-button, [id="18-insider-promo-module"], #obstruction-justice-promo, #how-republican-voted-on-health-bill, #brexit-latest-fallout-tracker, #news-tips-article-promo, .cColumn>.first, ' +
        '#story-ad-1-wrapper, #story-ad-2-wrapper, #story-ad-3-wrapper, #story-ad-4-wrapper, #opinion-aca-callout, #next-steps-for-health-care-bill, [id="06up-acachart"], #house-vote-republican-health-care-bill, #morning-briefing-weather-module, #nyt-weather,' +
        '#related-combined-coverage, .text-ad, #comey-promo, figure.video, .page-footer, .story-info, .story-print-citation, #fbi-congress-trump-russia-investigations, .vis-survey-box, #oil-prices, #Ask-Real-Estate-Promo, #wannacry-ransomware-map, #app > div > div' +
        '#how-self-driving-cars-work, #ransomware-attack-coverage, #fall-upfront-2017, figure[id*=pullquote], figure[id*=email-promo], figure[id*=DAILY-player], #why-its-so-hard-to-have-an-independent-russia-investigation, #navigation-edge, #europe-terror-attacks, ' +
        '#document-Robert-Mueller-Special-Counsel-Russia, #julian-assange-timeline, #anthony-weiner-plea-agreement, #assange-fblive-promo, .meter-asset-wrapper, ' +
        selector_for_elements_with_a_class_that_starts_with('Masthead-mastheadContainer--') + ',' +
        selector_for_elements_with_a_class_that_starts_with('SectionBarShare-shareMenu--') + ',' +
        selector_for_elements_with_a_class_that_starts_with('Recirculation-recirculation--'),
      homepage_theme_foreground_selector: '.summary', // NYT dark theme
      //homepage_css: 'header {background-color: #aaa}', // NYT dark theme
      homepage_hide_selector: '#masthead-placeholder, .masthead-cap-container, div.editions.tab, #nytint-hp-watching, #site-index .section-header, #markets, .all-sections-button, #mini-navigation, #WelcomeAd_optly',
      hide_selector: '.ad',
      theme_selector: 'body, #masthead, .searchsubmit', // NYT dark theme
      site_css: '.story.theme-main .story-meta-footer {border-top: none; border-bottom: none}',
      dark_theme: 1, // to turn this off, change the 1 to a 0 and comment out all other lines that are commented "NYT dark theme"
      origin: 'https://www.nytimes.com',
      unwanted_query_fields: 'action clickSource contentCollection contentPlacement hp module pgtype _r ref region rref smid smtyp src version WT.nav WT.z_jog hF vS utm_campaign utm_content utm_medium utm_source t target mcubz gwh gwt mtrref',
      unwanted_classes: 'theme-pinned-masthead',
      customize() {
        const
          //js_header_class_signature = 'Masthead-mastheadContainer--',
          js_header_selector = selector_for_elements_with_a_class_that_starts_with('HeaderBasic-bylineTimestamp--');
        //let
          //class_list,
          //js_header_class_name = false,
          //js_header_element,
          //logo_element;
        this.article_theme_foreground_selector += ',' + selector_for_elements_with_a_class_that_starts_with('HeaderBasic-headerBasic--');
        this.count_words.append                += ',' + js_header_selector;
        console.log(11, this.article_theme_foreground_selector);
        if (location_href.indexOf('?') != -1) alert('location_href: ' + location_href);
        if (page_level == 2) {
          $('figure.video').css({'width': '30%', 'margin-left': '30px'});
          $('.g-artboard' ).css({'width': '90%', 'margin-left': '30px'});
          document.styleSheets[0].addRule('.g-artboard *, .g-graphic *, .nytg-chart *', 'background-color: transparent !important; color: #000 !important');
          //cooked_site_css += ' .interactive-graphic * {background-color: #fff !important; color: #000 !important}';
          /* This block replaced by selector_for_elements_with_a_class_that_starts_with('Masthead-mastheadContainer--')
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
            if (js_header_class_name) hide_selector += ', .' + js_header_class_name;
            else alert('class signature "' + js_header_class_signature + '" not found in list "' + class_list + '"');
            //console.log(47, hide_selector);
          }
          */
        } else {
          //Object.freeze(document.location); // doesn't work -- and why would anyone expect it to?
          const logo_element = $('h2.branding') [0];
          if (logo_element) logo_element.innerHTML = '<img width="573" height="138" src="file:/home/will/public_html/green_york_times.png">';
          else console.log('warning: logo not found');
        }
        for (const element of $('img.g-lazy')) {
        //$('img.g-lazy').each(function () {
          $(element).css({'padding-top': '0'});
          element.src = element.dataset.hiRes || element.dataset.hiResSrc;
        }
        //remove_fixed_positioning(site_data);
      },
    },
    {
      name: 'Manchester Guardian',
      origin: 'https://www.theguardian.com',
      alternate_origins: ['https://interactive.guim.co.uk/'],
      alternate_prefixes: ['file:///root/wayback/guardian_uk/'],
      alternate_homepages: ['https://www.theguardian.com/us', 'https://www.theguardian.com/uk'],
      append_loaded_date: 'footer.l-footer',
      count_words: {append: '.content__dateline, .content__standfirst', subject: '.content__article-body'},
      article_css: '.js-headline-text {font-weight: normal} p {line-height: 170%} a {border-bottom: none} figure.element-tweet {margin-right: 4rem} img.byline-img__img {background: transparent} .content__article-body {font-family: "Adobe Caslon Pro"}' +
        'a:link   [data-link-name="auto-linked-tag"] {color: #00e766} a:link:hover[data-link-name="auto-linked-tag"] {color: #00f} div.explainer {background-color: #002b45; border: 1px solid ' + theme_foreground_color + '}' + 
        '.signposting {border-right-width:0} a:visited[data-link-name="auto-linked-tag"] {color: #99d700} a:visited:hover[data-link-name="auto-linked-tag"] {color: purple} .tabs__tab {border-top: 0.0625rem solid #aaa}',
      article_theme_selector: '.tonal__standfirst, .tonal__header, .content__standfirst, .content__headline, .byline, .d-top-comment__bubble',
      article_theme_background_selector: '.tonal--tone-live, .tonal--tone-editorial, .tonal--tone-feature, .tonal--tone-comment, .tonal--tone-analysis, .tonal--tone-review, .content__main, .block--content, .navigation, .local-navigation, .navigation-container,' +
        '.top-navigation, .navigation:before, .navigation-toggle, .navigation__container--first, .signposting, .tabs__tab--selected a, .tabs__tab--selected .tab__link, .tabs__tab a, .tabs__tab .tab__link',
      article_theme_foreground_selector: '.content__dateline, div.explainer, .caption5~',
      hide_selector: '.adverts, .site-message',
      article_hide_selector: '.element-video, .contributions__epic, .js-outbrain, .related, .submeta, #onward, #more-in-section, .element-pullquote, .element-rich-link, .meta__twitter, .meta__extras, .meta__email, .selection-sharing, .block-share, .ad-slot, ' +
        'figure[data-canonical-url="https://interactive.guim.co.uk/embed/2017/05/americas-unequal-future/embed.html"], figure[data-canonical-url="https://interactive.guim.co.uk/embed/2017/02/outside-in-america/embed.html"], #this_land_epic_bottom_environment_iframe',
      homepage_hide_selector: '.footer__email-container, div.image>div.video, #securedrop',
      homepage_theme_selector: '.fc-container--story-package, .facia-page, .index-page, .voices-and-votes-container__wrapper, .l-side-margins, .fc-container--thrasher, .tone-news--item.fc-item, .u-faux-block-link--hover, .tone-feature--item, .fc-container--story-package .fc-item, .tone-analysis--item.fc-item, .tone-comment--item.fc-item, .tone-editorial--item, .tone-media--item, .tone-review--item',
      homepage_css: '.tone-live--item {background-color: #5a0b00}',
      dark_theme: 1,
    },
    {
      name: 'Washington Post',
      origin: 'https://www.washingtonpost.com',
      alternate_origins: ['http://www.washingtonpost.com', 'https://live.washingtonpost.com'],
      alternate_prefixes: ['file:///root/wayback/washingtonpost/'],
      article_css: '#main-content {background-image: none} #et-nav {position: absolute}.headline {font-family: sans-serif} a, .powerpost-header, .layout_article #top-content {border-bottom: none} p {line-height: 155%} body {overflow-y: visible}' +
        '.fixed-image {position: static}', //.pb-f-homepage-story {background-color: #300},
      article_hide_selector: '#wp-header, #top-furniture, .pb-f-ad-flex-2, .pb-f-ad-flex-3, .pb-f-games-gamesWidget, .pb-f-page-footer-v2, .pb-f-page-recommended-strip, .pb-f-page-editors-picks, .chain-wrapper, .extra, .pb-f-generic-promo-image, .interstitial-link,' +
        '.pg-interstitial-link, .pb-f-posttv-sticky-player, .pb-f-posttv-sticky-player-powa, .xpb-f-article-article-author-bio, .pb-tool.email, .pb-f-page-newsletter-inLine, .pb-f-page-comments, .inline-video, [channel="wp.com"], .pb-f-page-jobs-search,' +
        '.pb-f-homepage-story, .pb-f-sharebars-top-share-bar, .wp_signin, #wp_Signin, .inline-graphic-linked, .share-individual, .pb-f-page-trump-can-he-do-that-podcast',
      article_theme_selector: '#article-body, article p, .pg-bodyCopy',
      article_theme_background_selector: '.wp-volt-gal-embed-promo-container, .wp-volt-gal-embed-promo-bottom, #weather-glance, #weather_now, .cwgdropdown, #heat-tracker, #weather-almanac, .pb-f-capital_weather_gang-weather-almanac select',
      article_theme_foreground_selector: '.pb-caption, .pb-bottom-author, .pb-timestamp, .weather-gray, #weather_now .time',
      count_words: {append: '.pg-pubDate, .bottomizer, .pb-sig-line, .pbHeader', subject: '#article-body>article, #pg-content>article'},
      homepage_css: 'header {position: relative} .pb-f-homepage-story .headline a, .related-links a, #bottom-content a {font-family: sans-serif; font-weight: normal}',
      homepage_theme_background_selector: '#pb-root, .homepage-footer-button, .pb-f-page-todays-paper-rr .large, .pb-f-homepage-chat-schedule .chat-schedule-button a',
      homepage_theme_selector: '.pb-f-homepage-card .panel',
      //hide_selector:'.pb-f-page-post-most img',
      homepage_theme_foreground_selector: '.label, .blurb, .byline, .caption',
      homepage_hide_selector: '.pb-f-homepage-brandconnect-sidebar, .section-story-photo-1', //, .standard-chain img, .opinions-chain img',
      site_css: '.overlineLabel {font-family: "Helvetica Black", sans-serif; font-weight: bold}',
      theme_foreground_selector: 'h1, h2, h3, h4, h5, h6',
      theme_selector: 'body, .skin.skin-card, .skin.skin-button, input',
      unwanted_query_fields: 'hpid tid utm_term wpisrc wpmk',
      customize() {
        //let stylesheet_links = $("link[rel='stylesheet']");
        for (const stylesheet_link of $("link[rel='stylesheet']")) {
        //stylesheet_links.each(function () {
          //let stylesheet_link = this;
          const stylesheet_link_href = stylesheet_link.href;
          //console.log(stylesheet_link_href);
/*          
          let alt_prefix = 'file://www.washingtonpost.com/';
          if (stylesheet_link_href.startsWith(alt_prefix)) {stylesheet_link.href = site_data.origin + stylesheet_link_href.substring(alt_prefix.length - 1);}
          alt_prefix = 'file:///';
          if (stylesheet_link_href.startsWith(alt_prefix)) {stylesheet_link.href = site_data.origin + stylesheet_link_href.substring(alt_prefix.length - 1);}
*/        
          for (const prefix of ['file://www.washingtonpost.com/', 'file:///']) {
            if (stylesheet_link_href.startsWith(prefix)) {
              stylesheet_link.href = site_data.origin + stylesheet_link_href.substring(prefix.length - 1);
              break;
            }
          }
          
          //console.log(stylesheet_link.href);
        }
        for (const element of $('img.lzyld, img.placeholder')) {
        //$('img.lzyld, img.placeholder').each(function () {
          $(element).css({'padding-top': '0'});
          element.src = element.dataset.hiRes || element.dataset.hiResSrc;
        }
        if (page_level == 2) {
          for (const element of $('article p, article p>i, article p>em')) {
          //$('article p, article p>i, article p>em').each(function () {
            const
              $element = $(element),
              element_contents = $element.contents();
            if (element_contents.length == 3 && element_contents [0].textContent == "[") $element.hide();
            //console.log(85, $(element).contents() [0], ($(element).contents() [0].textContent == "["));
          }
        $('div.inline-content:has([data-slug="a-look-at-president-trumps-first-year-in-office-so-far"])').hide();
        }
        //regularize_links(site_data);
      }
    },
    {
      name: 'McClatchy DC Bureau',
      origin: 'http://www.mcclatchydc.com',
      article_hide_selector: '.share-tools-wrapper, #ndnWidget, .highline-quote, #story-related, .wf_interstitial_link',
      customize() {
        const
          content_body_element = $('#content-body-'),
          content_body_element_children = content_body_element.children();
        //console.log(41, content_body_element, content_body_element_children);
        //window.c = [];
        for (const content_body_element_child of content_body_element_children) {
        //content_body_element_children.each(function() {
          const content_body_element_grandchildren = content_body_element_child.children;
          if (content_body_element_grandchildren.length == 1) {
            const content_body_element_grandchild = content_body_element_grandchildren [0];
            if (content_body_element_grandchild.tagName == 'A') {
              const chunk_direct_text = direct_text_content(content_body_element_child);
              if (chunk_direct_text == '[RELATED: ]' || (chunk_direct_text === '' && content_body_element_grandchild.textContent [0] == '[')) {
                $(content_body_element_child).addClass('wf_interstitial_link');
              }
            }
          }
          //console.log(45, content_body_element_child, direct_text_content(content_body_element_child), content_body_element_grandchildren);
          //if (direct_text_content(content_body_element_child) == '' && 
        }
        //console.log(47, direct_text_content(content_body_element_children [61]));
        //console.log(49, direct_text_content(content_body_element_children [62]));
      }
    },
    {
      name: 'The Verge',
      origin: 'https://www.theverge.com',
      article_hide_selector: '.c-entry-content>[class^=c-float-]>aside>q',
    },
    {
      name: 'The Intercept',
      origin: 'https://theintercept.com',
      article_theme_foreground_selector: '.PostContent, .PostContent u, h1, h2, h3, h4, h5, h6, .caption',
    },
    {
      name: 'Vox',
      origin: 'https://www.vox.com',
      article_hide_selector: '.main-social, .c-article-feedback, .c-tab-bar, .c-rock-newsletter',
      article_theme_background_selector: 'header .l-wrapper {max-width: none} .l-main-content, .c-global-header:before, .c-global-header__logo, .c-rock-list__title-wrapper:before, .c-compact-river__entry, .c-footer',
      article_theme_foreground_selector: '.c-page-title, .c-byline, .p-dek, .p-rock-head',
      count_words: {append: '.c-byline', subject: '.c-entry-content'},
      site_css: '.c-global-header__logo path {fill: ' + theme_foreground_color + '} .c-compact-river__entry, .c-footer {border-top-width: 0}',
    },
    {
      name: 'USA Today',
      origin: 'https://www.usatoday.com',
      article_hide_selector: '.utility-bar-wrap, .overlay-arrows, .site-header-inner-wrap-fixed, .close-wrap, .feed-stories-module, .interactive-poll-module, .inline-share-tools-asset',
      count_words: {append: '.asset-metabar', subject: '[itemprop=articleBody'},
    },
    {
      name: 'Slate',
      origin: 'http://www.slate.com',
      article_hide_selector: '.bottom-banner, .rubricautofeature, .top-comment, .follow-links',
      article_css: '.about-the-author.fancy {background: none} .about-the-author.fancy .author-bio {border-bottom: none}',
    },
    {
      name: 'Daily Beast',
      origin: 'https://www.thedailybeast.com',
      alternate_origins: ['http://www.thedailybeast.com'],
      count_words: {append: '.ArticleBody__byline', subject: 'article.Body'},
      article_hide_selector: '.share-icons, .InlineNewsletter',
    },
    {
      name: 'Talking Points Memo',
      origin: 'http://talkingpointsmemo.com',
      count_words: {append: '.FeatureByline', subject: '.Feature'},
      article_hide_selector: '.FeatureSocial, .FeatureShare, .Daybreaker, .Hive, .Facebook, .FeatureByline__FacebookLike, .FeatureByline__Count, .BottomAdSlot, .Footer__ExtendBackground, ' +
        '.Feature__Revcontent, .EmbedComments',
    },
    {
      name: 'DCommentary',
      origin: 'Dhttps://www.commentarymagazine.com',
      //article_css: '.super {background: none} h1>span, h1 {background-color: transparent}',
      //article_hide_selector: '#onesignal-bell-container, .advads-background, #js-sticky-contents',
    },
    {
      name: 'Politico',
      origin: 'http://www.politico.com',
      article_css: '.super {background: none} h1>span, h1 {background-color: transparent}',
      article_hide_selector: '.story-interrupt, .story-tools, .story-related, .story-share',
      count_words: {append: '.timestamp', subject: '.story-text'},
    },
    {
      name: 'FiveThirtyEight',
      origin: 'https://fivethirtyeight.com',
      article_css: '.site-main, .site-wrapper, .header-global, .header-global-wrapper {background-color: inherit} .header-global-logo {max-width: 210px; background-color: #888; padding:6px 0 3px 6px}',
      article_hide_selector: '.sticky, #secondary, .share',
      count_words: {append: '.datetime', subject: '.entry-content'}, 
      //dark_theme: 2,
    },
    {
      name: 'The Independent',
      origin: 'http://www.independent.co.uk',
      article_css: 'header {position: static}',
      article_hide_selector: '.hide, .partner-slots, .fb-like, .relatedlinkslist, .layout-component-i100, .layout-component-ines-video-sidebar, .box-comments:first-of-type, .syndication-btn',
      customize() {
        const
          elements = $('.box-comments'),
          elements_length = elements.length;
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
      article_hide_selector: '.module-related.video, .js-inject-promo, .social-kit-top, .article-tools',
      theme_background_selector: '#site',
      article_theme_background_selector: '.article-body blockquote',
      homepage_theme_background_selector: '.c-hp, .c-hp-lead__content, .c-hp-news, .c-hp-filmstrip, .c-hp-offlead, .c-hp-featured, .c-writers__container, .c-latest, .c-popular__container, .c-sections, input',
      homepage_hide_selector: '.c-writers__item--magazine',
      article_css: 'figure.lead-img .img {outline: none} .article-cover-extra {padding-bottom: 0; border-bottom: none}',
    },
    {
      name: 'National Review',
      origin: 'http://www.nationalreview.com',
      count_words: {append: 'time', subject: '[itemprop="articleBody"]'},
      article_hide_selector: '.horizontal-share-menu, .twitter-follow-header, .pullquote, .pullad, form[action="http://www.nationalreview.com/content/get-free-nr-e-newsletters"]',
      dark_theme: 2,
    },
    {
      name: 'The Federalist',
      origin: 'http://thefederalist.com',
      customize() {
        $('.entry-content>div:has(.perma-ad-wrapper)').hide();
      },
      dark_theme: 0,
    },
    {
      name: 'Medium',
      origin: 'https://medium.com',
      article_css: '.u-fixed, .metabar--affixed {position: static}',
      article_theme_background_selector: '#container, .screenContent, .canvas-renderer, .metabar, .u-backgroundGrayLightest, .u-backgroundWhite',
      article_theme_foreground_selector: '.postMetaInline, .u-textColorDark, .graf--h2, .graf--h3, .graf--h4',
      article_hide_selector: '.postActions',
    },
    {
      name: 'Free Code Camp',
      origin: 'https://www.freecodecamp.com',
      alternate_origins: ['https://medium.freecodecamp.com'],
      article_theme_background_selector: '#container, .screenContent, .canvas-renderer, .metabar, .u-backgroundGrayLightest, .u-backgroundWhite',
      article_theme_foreground_selector: '.postMetaInline, .u-textColorDark, .graf--h2, .graf--h3, .graf--h4',
      article_hide_selector: '.js-stickyFooter',
    },
    {
      name: 'Associated Press',
      origin: 'https://apnews.com',
      alternate_origins: ['https://www.apnews.com'],
      count_words: {append: '.mobile h6', subject: '.articleBody'},
      article_css: '.articleView {padding-top: 80px}',
      article_hide_selector: '#drawerMenu, .mobileTitle ul, footer',
    },
    {
      name: 'Reuters',
      origin: 'http://www.reuters.com',
      article_css: '.wmaster_total_words_count {font-size: 150%; margin-left: 0.3em} #headerNav {top: 0} #content {margin-top: 0px} #breakingNewsContainer.breaking {background-color: #840}',
      article_hide_selector: '#headerNav, .edition-header, .nav-white-space, .core-share, .related-content',
      article_theme_foreground_selector: '#article-text p, .article-headline, .module-caption',
      article_theme_background_selector: '.info-box, .footer, .footer-body, .footer-body .product',
      count_words: {append: '#article-byline', subject: '#article-text', nbsp_size: '100%'},
      unwanted_classes: 'mod-sticky-article article-sticky',
    },
    {
      name: 'LEDs Magazine',
      origin: 'http://www.ledsmagazine.com',
      alternate_homepages: ['http://www.ledsmagazine.com/index.html'],
      //count_words: {append: '#editorial-article-wrapper-container>:first-child>:first-child>:first-child>:first-child>:first-child', subject: 'article'},
      //article_hide_selector: '.clay-share',
      homepage_theme_background_selector: '#templateOuterLeft, #container',
    },
    {
      name: 'Time Magazine',
      origin: 'http://time.com',
      dark_theme: 2,
      count_words: {append: '#editorial-article-wrapper-container>:first-child>:first-child>:first-child>:first-child>:first-child', subject: 'article'},
      //article_hide_selector: '.clay-share',
      article_theme_foreground_selector: 'p:first-letter',
    },
    {
      name: 'New York Magazine',
      origin: 'http://nymag.com',
      dark_theme: 1,
      count_words: {append: '.article-timestamp', subject: '.article-content'},
      article_hide_selector: '.clay-share',
      article_theme_foreground_selector: 'h1, p, figcaption, time, .by-authors',
      article_css: 'blockquote, blockquote p {' + theme_foreground_rule + 'padding: 0 0 0 14px; border-left: 1px solid #3a3} blockquote:before {border-top: none}',
      homepage_theme_background_selector: '.newsHeadlinesByPublication section, .dek, .hed',
    },
    {
      name: 'The New Yorker',
      origin: 'http://www.newyorker.com',
      count_words: {append: '.byline-and-date', subject: '#content'},
      //article_css: '.single-post #articleBody p a, .single-post #articleBody .gallery-caption a, .single-post #articleBody u, .articleBody p a, .articleBody .gallery-caption a, .articleBody u, .author-masthead p a, .author-masthead .gallery-caption a, .author-masthead u {text-shadow: none; background: none}',
      article_css: 'a {text-shadow: none; background: none}',
      article_hide_selector: 'iframe, .social-module, .strongbox-promo-wrapper, .social-hover, .footer-content, #recirc-pos-2',
      article_theme_background_selector: 'article>header, .hamburger-dropdowns-navigation__top-level, footer',
      article_theme_foreground_selector: 'article>header .title, article>header time.blog-post-date, .articleBody p, .caption, .author-masthead',
      homepage_hide_selector: '.fixed-topnav, iframe, #strongbox-promo',
      homepage_theme_background_selector: '#main, .logo-container',
      customize() {
        if (location_href.indexOf('?') != -1) alert(location_href);
        if (page_level == 2) {
        } else {
          const logo_element = $('h1') [0];
          if (logo_element) logo_element.innerHTML = '<img width="400" height="94" src="file:/home/will/public_html/green_yorker.png">';
          else console.log('warning: logo not found');
        }
        //remove_fixed_positioning(site_data);
      },
      unwanted_classes: 'js-sticky-wrap',
      unwanted_query_fields: 'intcid',	
    },
    {
      name: 'The Nation',
      origin: 'https://www.thenation.com',
      article_hide_selector: '.header-bar.utility, .sticky, .twitter-quote, .takeaction, .article-share, #paywall, aside.related-article',
      article_css: 'body {overflow: visible}',
      count_words: {append: '.byline', subject: '.article-body'},
    },
    {
      name: 'Defense One',
      origin: 'http://www.defenseone.com',
      article_css: 'body, .d1-article-subhead {font-family: Georgia} .d1-sticky-nav-stick {position: absolute}',
      article_hide_selector: '.conversion-module-bootstrap, .d1-social-article',
      article_theme_background_selector: '.content, .d1-article-subhead-inner-a, .d1-article-subhead-inner-b, .d1-article-subhead-inner-c',
      article_theme_foreground_selector: '.d1-article-subhead',
    },
    {
      name: 'The Week',
      origin: 'http://theweek.com',
      article_css: '#sub-header {margin-top: 50px}',
      article_hide_selector: '.managed-ad, .appendedAds',
      count_words: {append: '.article-date', subject: '.article-body'},
    },
    {
      name: 'Salon',
      origin: 'http://www.salon.com',
      article_theme_background_selector: '.mainContent .mainInner',
      article_theme_foreground_selector: 'h1, h2, .byline',
      count_words: {append: '.byline', subject: '.articleContent'},
    },
    {
      name: 'Tampa Bay Times',
      origin: 'http://www.tampabay.com',
      article_theme_foreground_selector: '.dateline, .blurb, .head',
    },
    {
      name: 'PJ Media',
      origin: 'https://pjmedia.com',
      article_hide_selector: '.navbar-scroll',
    },
    {
      name: 'Weather Underground',
      origin: 'https://www.wunderground.com/',
      dark_theme: 0,
    },
    {
      name: 'The Baltimore Sun',
      origin: 'http://www.baltimoresun.com',
      article_hide_selector: '.trb_nls_c, .trb_bnn, .trb_mh_adB', //, aside:has([data-content-kicker="Related"])',
      article_theme_background_selector: '.trb_allContentWrapper, .trb_nh_lw',
      article_theme_foreground_selector: '.trb_ar_page>ol, .trb_ar_page>p, .trb_ar_page>ul, .trb_ar_page[data-content-page="1"]>p:first-child:first-letter',
      //article_css: 'body {overflow: visible}',
      count_words: {append: '.trb_ar_dateline', subject: '[itemprop=articleBody'},
      //count_words: {append: '.byline', subject: '.article-body'},
      customize() {
        $('aside:has([data-content-kicker="Related"])').hide(); // This would be in article_hide_selector, but that fails enigmatically as of 2017-05-30
      },
    },
    {
      name: 'Los Angeles Times',
      origin: 'http://www.latimes.com',
      article_hide_selector: '.trb_nh_lw, .trb_mh_adB, .trb_sc, .trb_ar_bc, .trb_gptAd.trb_ar_rail_ad, .trb_embed[data-content-type=story], .wf_interstitial_link, [name="support-our-journalism"], [data-content-type="pullquote"]',
      article_theme_background_selector: '.trb_allContentWrapper',
      article_theme_foreground_selector: 'article p, .dropcap, .trb_ar_page[data-content-page="1"]>p:first-child:first-letter',
      article_css: '.trb_mh {margin-top: 70px} a:link[   href^="/topic/"] {color: #00e766} a:link:hover[href^="/topic/"] {color: #00f} a:visited[href^="/topic/"] {color: #99d700} a:visited:hover[href^="/topic/"] {color: purple}' ,
      count_words: {append: '.trb_ar_dateline', subject: 'div[itemprop="articleBody"]', nbsp_size: '100%'},
      customize() {
        const chunks = $('div[itemprop="articleBody"] p');
        console.log(41, chunks);
        //window.c = [];
        for (const chunk of chunks) {
        //chunks.each(function() {
          const children = chunk.children;
          const debug = true;
          if (children.length == 1) {
            if (debug) console.log(42);
            const child = children [0];
            if (debug) console.log(43, child);
            if (child.tagName == 'STRONG') {
              if (debug) console.log(44);
              const child_text = direct_text_content(child);
              if (debug) console.log(45, child_text);
              if (child_text === '') {
                if (debug) console.log(46);
                const grandchildren = child.children;
                if (debug) console.log(47, grandchildren);
                if (grandchildren.length == 1) {
                  if (debug) console.log(48);
                  const grandchild = grandchildren [0];
                  if (debug) console.log(49, grandchild);
                  if (grandchild.tagName == 'A') {
                    if (debug) console.log(50);
                    const grandchild_text = direct_text_content(grandchild);
                    if (debug) console.log(51);
                    if (grandchild_text [grandchild_text.length - 1] == '»') {
                      if (debug) console.log(52);
                      $(chunk).addClass('wf_interstitial_link');
                    }
                  }
                }
              }
            }
          }
          //console.log(45, this, direct_text_content(this), this_children);
          //if (direct_text_content(this) == '' && 
        }
        //console.log(47, direct_text_content(content_body_element_children [61]));
        //console.log(49, direct_text_content(content_body_element_children [62]));
      }
    },
    {
      name: 'Huffington Post',
      origin: 'http://www.huffingtonpost.com',
      article_hide_selector: '.nav-sticky__bar, .header__social-list',
      article_theme_foreground_selector: '.headline__title, .headline__subtitle, .entry__body',
      article_css: 'html {font-family: sans-serif}',
    },
    {name: 'Just Security'          , origin: 'https://www.justsecurity.org'},
    {name: 'Washington Examiner'    , origin: 'http://www.washingtonexaminer.com'},
    {name: 'New York Post'          , origin: 'http://nypost.com'                    , article_hide_selector: '.floating-share'},
    {name: 'Stack Overflow'         , origin: 'http://stackoverflow.com'             , dark_theme: 0},
    {name: 'Review of Ophthalmology', origin: 'https://www.reviewofophthalmology.com'},
    {name: 'The Economist'          , origin: 'http://www.economist.com'             , article_hide_selector: '.latest-updates-panel__container'},
    {name: 'The Ringer'             , origin: 'https://theringer.com'                , article_hide_selector: '.js-postShareWidget, .metabar--spacer', unwanted_classes: 'u-fixed metabar'},
    {name: 'Reason'                 , origin: 'http://reason.com'                    , article_css: 'html, body {font-family: Georgia}'},
    {name: 'Rolling Stone'          , origin: 'http://www.rollingstone.com'          , article_css: 'header {position: static}', dark_theme: 0},
    {name: 'Wikipedia'              , origin: 'https://en.wikipedia.org'             , dark_theme: 0},
    {name: 'Spectator'              , origin: 'https://www.spectator.co.uk'          , dark_theme: 0, article_css: '.floatyFloaty {position: static}', article_hide_selector: '.article-promo'},
    {name: 'Local wayback'          , alternate_prefixes: ['file:///root/wayback/'], append_loaded_date: false, count_words_subject: false},
  ];
  //console.table(sites_data);
  //window.sites_data = sites_data;

//begin lg
  
const _log = (function(undefined) {
	var Log = Error; // does this do anything?  proper inheritance...?
	Log.prototype.write = function (args) {
		/// <summary>
		/// Paulirish-like console.log wrapper.  Includes stack trace via @fredrik SO suggestion (see remarks for sources).
		/// </summary>
		/// <param name="args" type="Array">list of details to log, as provided by `arguments`</param>
		/// <remarks>Includes line numbers by calling Error object -- see
		/// * http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
		/// * http://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number
		/// * http://stackoverflow.com/a/3806596/1037948
		/// </remarks>
		
		// via @fredrik SO trace suggestion; wrapping in special construct so it stands out
		var suffix = {
				"@": (this.lineNumber? this.fileName + ':' + this.lineNumber + ":1" // add arbitrary column value for chrome linking
					: extractLineNumberFromStack(this.stack)
				)
			};
		
		args = args.concat([suffix]);
		// via @paulirish console wrapper
		if (console && console.log) {
			if (console.log.apply) { console.log.apply(console, args); } else { console.log(args); } // nicer display in some browsers
		}
	};
	var extractLineNumberFromStack = function (stack) {
		/// <summary>
		/// Get the line/filename detail from a Webkit stack trace.  See http://stackoverflow.com/a/3806596/1037948
		/// </summary>
		/// <param name="stack" type="String">the stack string</param>
		
		// correct line number according to how Log().write implemented
		var line = stack.split('\n')[3];
		// fix for various display text
		line = (line.indexOf(' (') >= 0? line.split(' (')[1].substring(0, line.length - 1): line.split('at ')[1]);
		return line;
	};
	
	return function () {
		/// <summary>
		/// Paulirish-like console.log wrapper
		/// </summary>
		/// <param name="params" type="[...]">list your logging parameters</param>
		
		// only if explicitly true somewhere
		if (typeof DEBUGMODE === typeof undefined || !DEBUGMODE) return;
		
		// call handler extension which provides stack trace
		Log().write(Array.prototype.slice.call(arguments, 0)); // turn into proper array
	};//--	fn	_log
	
})();

// no debug mode
_log('this should not appear');

// turn it on
DEBUGMODE = true;

_log('you should', 'see this', {a:1, b:2, c:3});
console.log('--- regular log ---');
_log('you should', 'also see this', {a:4, b:8, c:16});

// turn it off
DEBUGMODE = false;

_log('disabled, should not appear');
console.log('--- regular log2 ---');

// end lg

  const sites_data_by_prefix = {};
  for (const site_data of sites_data) {
  //$.each(sites_data, function (site_index, site_data) {
    const unwanted_query_fields = site_data.unwanted_query_fields;
    let prefixes, remove_fixed_positioning_settings;
    if (site_data.origin) prefixes = [site_data.origin];
    else        prefixes = [];
    if (site_data.alternate_origins ) prefixes = prefixes.concat(site_data.alternate_origins );
    if (site_data.alternate_prefixes) prefixes = prefixes.concat(site_data.alternate_prefixes);
    if (unwanted_query_fields) site_data.unwanted_query_fields_array = unwanted_query_fields.split(/\s+/);
    console.log(34, site_data.unwanted_query_fields_array);
    //console.log(35, prefixes);
    //$.each(prefixes, function (prefix_index, prefix) {
    for (const prefix of prefixes) {
      if (sites_data_by_prefix.hasOwnProperty(prefix)) console.log('warning: URL prefix "' + prefix + '" is a duplicate!');
      else sites_data_by_prefix [prefix] = site_data;
    }
    //console.log(74, site_data.append_loaded_date);
    if      (!site_data                 .hasOwnProperty('append_loaded_date'      )) site_data.append_loaded_date             = 'body';
    if      (!site_data                 .hasOwnProperty('dark_theme'              )) site_data.dark_theme                     = 1;
    if      (!site_data                 .hasOwnProperty('std_link_colors'         )) site_data.std_link_colors                = true;
    if      (!site_data                 .hasOwnProperty('theme_selector'            )) site_data.theme_selector                   = 'body';
    if      (!site_data                 .hasOwnProperty('theme_background_selector' )) site_data.theme_background_selector        = ''; 
    if      (!site_data                 .hasOwnProperty('theme_foreground_selector' )) site_data.theme_foreground_selector        = '';

    if      (!site_data                 .hasOwnProperty('count_words'             )) site_data.count_words                    = {};
    const count_words_settings = site_data.count_words;
    if      (!count_words_settings      .hasOwnProperty('append'                  )) count_words_settings.append              = 'body';
    if      (!count_words_settings      .hasOwnProperty('nbsp_size'               )) count_words_settings.nbsp_size           = '50%';
    if      (!count_words_settings      .hasOwnProperty('subject'                 )) count_words_settings.subject             = 'body';
    if      (!count_words_settings      .hasOwnProperty(      'prefix'            )) count_words_settings.      prefix        = '';
    if      (!count_words_settings      .hasOwnProperty( 'graf_prefix'            )) count_words_settings. graf_prefix        = count_words_settings.prefix;
    if      (!count_words_settings      .hasOwnProperty('total_prefix'            )) count_words_settings.total_prefix        = count_words_settings.prefix;

    if      (!site_data                 .hasOwnProperty('remove_fixed_positioning')) remove_fixed_positioning_settings       = {};
    else if ( site_data.remove_fixed_positioning === false                         ) remove_fixed_positioning_settings       = {enable: false};
    else                                                                             remove_fixed_positioning_settings       = site_data.remove_fixed_positioning;
    if      (!remove_fixed_positioning_settings  .hasOwnProperty('enable'         )) remove_fixed_positioning_settings.enable = true;




    //console.log(76, site_data.append_loaded_date);
  }
  //console.log(36, sites_data_by_prefix);
  window.sites_data2 = sites_data;
  

  function direct_text_content(element) {
    // Return the text from this element only, not including any text from child elements
    let text = '';
    for (const child_node of element.childNodes) {
    //$.each(element.childNodes, function (child_node_index, child_node) {
      if (child_node.nodeType === 3) text += child_node.textContent;
    }
    return text;
  }

  function selector_for_elements_with_a_class_that_starts_with(target) {
    const logging = true;
    const result =  '[class^="' + target + '"], [class*=" ' + target + '"]';
    if (logging) console.log(31, target, result);
    return result;
  }


  const dateFormat = function () {
    const	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
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
      const dF = dateFormat;

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

      const	_ = utc ? "getUTC" : "get",
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


  function dark_theme(aggressiveness_level) { //, target) {
    if (!aggressiveness_level) return;
    //$('body').css({'background-color': '' + theme_background_color + ' !important; color: ' + theme_foreground_color + ' !important'});
    if (aggressiveness_level > 1) document.styleSheets[0].addRule('*', 'background-color: ' + theme_background_color + ' !important; color: ' + theme_foreground_color + ' !important');
    //raw_site_css += target + '{' + theme_background_rule + theme_foreground_rule + '}';
    raw_site_css += '::-webkit-scrollbar {height: 2px; width: 2px} ::-webkit-scrollbar-track {background: #000} ::-webkit-scrollbar-thumb {background: #f00} ';
  }

  function std_link_colors() {
    raw_site_css += ' a {text-decoration: none}' +
      ' a:link, a:link h2, a:link h3, a:link h4, a:link h5, a:link div, a:link p, a:link span, a:link em {color: #00f}' +
      ' a:visited, a:visited h2, a:visited h3, a:visited h4, a:visited h5, a:visited div, a:visited p, a:visited span, a:visited em {color: #a0a}';
  }

  function regularize_links() {
  const logging = false;
    if (logging) console.log(10);
    //$.each ($('a'), function (element_index, element) {
    for (const element of $('a')) {
      if (logging) console.log(11);
      let href = element.href;
      //if (typeof href === 'undefined') return;
      const origin = element.origin;
      const site_data = sites_data_by_prefix [origin];
      if (typeof site_data === 'undefined') return;
      const unwanted_query_fields_array = site_data.unwanted_query_fields_array;
      if (!unwanted_query_fields_array) return;
      //const unwanted_query_fields_array_length = unwanted_query_fields_array.length;
      const query_string_index = href.indexOf('?');
      if (logging) console.log(12, href);
      if (query_string_index !== -1) {
        if (logging) console.log('20');
        let query_string = href.substring(query_string_index);
        const url_without_query_string = href.substring(0, query_string_index);
        const query_params = new URLSearchParams(query_string);
        if (logging) console.log(22, query_params.toString());
        for (const field of unwanted_query_fields_array) {
        //$.each(unwanted_query_fields_array, function (field_index, field) {
          query_params.delete(field);
          if (logging) console.log(22.5, field, query_params.toString());
        }
        if (logging) console.log(23, query_params.toString());
        query_string = query_params.toString();
        if (logging) console.log(24, query_string);
        href = url_without_query_string;
        if (query_string.length) href += '?' + query_string;
        element.href = href;
      }
      if (logging) console.log(17, href);
    }
  }

  function count_words(site_data) {

    const words_count_name = program_name +  '_words_count';
    const graf_words_count_name = words_count_name + '_graf';
    let total_words_count = 0;
    const total_words_count_name = words_count_name + '_total';
    const html_prefix = '<span class="' + words_count_name + ' ';
    const html_suffix = '<span class="nbsp">&nbsp;</span>words</span>';
    let html_graf_prefix;
    const settings = site_data.count_words;
    const nbsp_size       = settings.nbsp_size;
    const append_selector   = settings.append ;
    let $append_elements;
    let prepend_selector  = settings.prepend;
    const subject_selector  = settings.subject;
    const $subject_elements = $(subject_selector);
    const show_graf_counts  = settings.grafs;
 
    console.log(92, subject_selector, $subject_elements);
    if (show_graf_counts) html_graf_prefix = html_prefix + graf_words_count_name + '">' + settings.graf_prefix;
    for (const graf of $subject_elements.find('p')) {
    //$subject_elements.find('p').each(function () {
      let $graf = $(graf);
      let graf_text = $graf.text();
      if (graf_text.length) {
        const graf_words_count = graf_text.split(/\s+/).length;
        if (show_graf_counts) $graf.append(html_graf_prefix + graf_words_count + html_suffix);
        total_words_count += graf_words_count;
      }
    }
    const output = html_prefix + total_words_count_name + '">' + settings.total_prefix + total_words_count + html_suffix;
    if (append_selector) {
      if (append_selector == subject_selector) $append_elements = $subject_elements;
      else                                     $append_elements = $(append_selector);
      $append_elements.append(output);
      console.log(94, append_selector, $append_elements);
    } else if (!prepend_selector) {
      prepend_selector = subject_selector;
    }
    if (prepend_selector) {
      let $prepend_elements;
      if      (prepend_selector == subject_selector) $prepend_elements = $subject_elements;
      else if (prepend_selector ==  append_selector) $prepend_elements =  $append_elements;
      else $prepend_elements = $(prepend_selector);
      $prepend_elements.prepend(output);
      console.log(96, prepend_selector, $prepend_elements);
    }
    console.log(97, nbsp_size);
    if (show_graf_counts) raw_site_css += '.' +  graf_words_count_name + ' {color: #333}';
    raw_site_css                       += '.' + total_words_count_name + ' {color: #880} .' + total_words_count_name + '>.nbsp {font-size: ' + nbsp_size + '}';
  }
  
  function append_loaded_date(e) {
    let html = '';
    //html += location_href + '<br>';
    html += 'Loaded ' + dateFormat(new Date(), 'dddd, mmmm dS, yyyy @ h:MM:ss TT') + '<br><br>';
    e.append(html);
  }
  
  function remove_fixed_positioning(site_data) {
    const settings = site_data.remove_fixed_positioning;
    console.log('remove_fixed_positioning: called with settings: ' + settings);
    if (settings) {} // stub
    for (const element of $('*')) {
    //$('*').each(function () {
      const $element = $(element);
      const old_position = $element.css('position');
      if (old_position == 'fixed' || old_position == 'sticky') {
        console.log('remove_fixed_positioning:', element);
        $element.css({'position': 'absolute'});
      }
    }
  }

  console.log(91);
  const
    location = window.location,
    location_href = location.href,
    location_origin = location.origin;
  //$.each (sites_data, function (site_index, test_site_data) {
  for (const test_site_data of sites_data) {
    console.log(33, test_site_data.name, location_origin, test_site_data.origin);
    if (test_site_data.origin && location_origin == test_site_data.origin) {
      if (location_href == location_origin + '/') {
        site_data = test_site_data;
        page_level = 0;
        break;
      }
    }
    console.log(92);
    if (test_site_data.alternate_homepages) {
/*
      alternates = test_site_data.alternate_homepages;
      alternates_length = alternates.length;
      for (prefix_index = 0; prefix_index < alternates_length; prefix_index++) {
        alternate = alternates [prefix_index];
*/
      for (const alternate of test_site_data.alternate_homepages) {

        console.log(92.5, location_href, alternate);
        if (location_href == alternate) {
          site_data = test_site_data;
          page_level = 0;
          console.log(92.6);
          break;
        }
      }
      if (site_data) break;
    }
    console.log(93);
    if (test_site_data.origin && location_origin == test_site_data.origin) {
      site_data = test_site_data;
      page_level = 2;
      break;
    }
    if (test_site_data.alternate_prefixes) {
/*      
      alternates = test_site_data.alternate_prefixes;
      alternates_length = alternates.length;
      for (prefix_index = 0; prefix_index < alternates_length; prefix_index++) {
        alternate = alternates [prefix_index];
*/      
      for (const alternate of test_site_data.alternate_prefixes) {
      
        if (location_href.startsWith(alternate) && location_href != alternate) {
          site_data = test_site_data;
          page_level = 0;
          break;
        }
      }
      if (site_data) break;
    }
    console.log(94);
    if (test_site_data.alternate_origins) {
/*    
      alternates = test_site_data.alternate_origins;
      alternates_length = alternates.length;
      for (prefix_index = 0; prefix_index < alternates_length; prefix_index++) {
        alternate = alternates [prefix_index];
*/
      for (const alternate of test_site_data.alternate_origins) {
              
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
      if (site_data) break;
    }
    console.log(95);
  }
  if (site_data) {
    //alert(site_data.name + ' detected');
    if (site_data.customize) site_data.customize();
    if (site_data.theme_selector           ) theme_selector            = [site_data.theme_selector           ];
    else                                     theme_selector            = [                                   ];
    if (site_data.theme_background_selector) theme_background_selector = [site_data.theme_background_selector];
    else                                     theme_background_selector = [                                   ];
    if (site_data.theme_foreground_selector) theme_foreground_selector = [site_data.theme_foreground_selector];
    else                                     theme_foreground_selector = [                                   ];
    if (site_data.hide_selector            ) hide_selector             = [site_data.hide_selector            ];
    else                                     hide_selector             = [                                   ];
    console.log(48.1, theme_foreground_selector);
    if (site_data.site_css                 ) raw_site_css              = site_data.site_css;
    else                                     raw_site_css              = '';
    let cooked_site_css = '';
    if (site_data.std_link_colors) std_link_colors();
    console.log(44, site_data);
    regularize_links();
    const unwanted_classes = site_data.unwanted_classes;
    //console.log(14, site_data);
    if (unwanted_classes) {
      const unwanted_classes_split = unwanted_classes.split(/\s+/);
      //$.each(unwanted_classes_split, function(unwanted_class_index, unwanted_class) {
      for (const unwanted_class of unwanted_classes_split) {
        if (!unwanted_class.length) return;
        //console.log(15, $('.' + unwanted_class));
        $('.' + unwanted_class).removeClass(unwanted_class);
      }
    }
    if (site_data.remove_fixed_positioning) remove_fixed_positioning(site_data);
    if (site_data.append_loaded_date) append_loaded_date($(site_data.append_loaded_date));
    console.log(48.2, theme_foreground_selector);
    if (page_level === 0) {
      if (site_data.homepage_theme_selector           ) theme_selector           .push(site_data.homepage_theme_selector);
      if (site_data.homepage_theme_background_selector) theme_background_selector.push(site_data.homepage_theme_background_selector);
      if (site_data.homepage_theme_foreground_selector) theme_foreground_selector.push(site_data.homepage_theme_foreground_selector);
      if (site_data.homepage_hide_selector            ) hide_selector            .push(site_data.homepage_hide_selector);
      if (site_data.homepage_css                      ) raw_site_css += ' ' +          site_data.homepage_css;
    } else if (page_level == 2) {
      if (site_data. article_theme_selector           ) theme_selector           .push(site_data. article_theme_selector);
      if (site_data. article_theme_background_selector) theme_background_selector.push(site_data. article_theme_background_selector);
      if (site_data. article_theme_foreground_selector) theme_foreground_selector.push(site_data. article_theme_foreground_selector);
      if (site_data. article_hide_selector            ) hide_selector            .push(site_data. article_hide_selector);
      if (site_data. article_css                      ) raw_site_css += ' ' +          site_data. article_css;
      count_words(site_data);
    }
    console.log(46, site_data.article_hide_selector);
    console.log(47, theme_background_selector);
    if (site_data.dark_theme) dark_theme(site_data.dark_theme);
    console.log(48.4, theme_foreground_selector);
    if (hide_selector            .length) raw_site_css += hide_selector                       + '{display: none}';
    if (theme_selector           .length) raw_site_css += theme_selector           .join(',') + '{' + theme_background_rule + theme_foreground_rule + '}';
    if (theme_background_selector.length) raw_site_css += theme_background_selector.join(',') + '{' + theme_background_rule + '}';
    if (theme_foreground_selector.length) raw_site_css += theme_foreground_selector.join(',') + '{' + theme_foreground_rule + '}';
    console.log(55, raw_site_css);
    const raw_site_css_split = raw_site_css.split('}');
    console.log(63, cooked_site_css);
    console.log(64, raw_site_css);
    //$.each(raw_site_css_split, function (rule_index, rule) {
    for (const rule of raw_site_css_split) {
      console.log(56, rule);
      if (!rule) break;
      const
        rule_split = rule.split('{'),
        declarations = rule_split [1],
        declarations_split = declarations.split(';');
      console.log(25, declarations, declarations_split);
      let rule_text = rule_split [0] + ' {';
      //$.each(declarations_split, function (declaration_index, declaration) {
      for (const [declaration_index, declaration] of declarations_split.entries()) {
        console.log(55, declaration_index, declaration);
        if (!declaration) break;
        if (declaration_index) rule_text += '; ';
        rule_text += $.trim(declaration) + ' !important';
      }
      rule_text += '}';
      console.log('65 ' + rule_text);
      cooked_site_css += ' ' + rule_text;
    }
    const stylesheet = document.createElement('style');
    stylesheet.innerHTML = cooked_site_css;
    //alert(cooked_site_css);
    document.body.appendChild(stylesheet);
    window.sss=stylesheet;
  }
  //$('#anti-white-flash-curtain').remove();
  $.noConflict();
});
