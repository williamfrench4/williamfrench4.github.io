// ==UserScript==
// @name         wmaster
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @match        *://*/*
// @author       You
// @grant       GM_addStyle

// ==/UserScript==

/* jshint asi: true, esversion: 6, undef: true, unused: true */
/* globals jQuery, alert, console, document, window, URL, setTimeout, XMLHttpRequest, TextDecoder */

/* eslint-disable camelcase */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable padded-blocks */
/* eslint-disable no-multi-spaces */
/* eslint-disable no-whitespace-before-property */
/* eslint-disable spaced-comment */
/* eslint-disable key-spacing */
/* eslint-disable comma-spacing */
/* eslint-disable comma-dangle */
/* eslint-disable space-in-parens */
/* deslint-disable one-var */

//alert(36)
jQuery(() => {
  'use strict'
  //alert(8)
  //console.log ('wmaster running')
  //return
  const wasd_scrolling                          = true
  const $body                                   = jQuery('body')
  const program_name                            = 'wmaster'
  const theme_autolink_foreground_color         = '#00c080'
  const theme_autolink_visited_foreground_color = '#99d700'
  const theme_background_color                  = '#000'
  const theme_foreground_color                  = '#0f0'
  const theme_link_foreground_color             = '#00f'
  const theme_link_visited_foreground_color     = 'purple' // #a0a
  const theme_background_rule                   = 'background: ' + theme_background_color + '; background-color: ' + theme_background_color + ';'
  const theme_foreground_rule                   = 'color: '      + theme_foreground_color + '; text-shadow: none;'
  const location = window.location
  const location_href = location.href
  const location_origin = location.origin
  let theme_selector                            = []
  let theme_background_selector                 = []
  let theme_foreground_selector                 = []
  let hide_selector                             = []
  let main_dialog_is_open                       = false
  let raw_site_css                              = ''
  let cooked_site_css                           = ''
  let page_level
  let site_data
  let getMatchedCSSRules
  let wf_getMatchedCSSRules
  console.log(101, location_href)
  const ui_css_prefix                           = program_name   + '_ui'
  const main_dialog_id                          = ui_css_prefix  + '_main'
  const main_dialog_word_count_id               = main_dialog_id + '_word_count'
  const main_dialog_close_id                    = main_dialog_id + '_close'
  const main_dialog_cli_id                      = main_dialog_id + '_cli'
  let new_html                                  = '' +
    //'<div id="' + main_dialog_id + '" style="position: fixed; top: 0; left: 0; z-index: 2147483647; background-color: yellow; display: none">' +
    '<div id="' + main_dialog_id + '" style="position: fixed; top: 0; left: 0; z-index: 2147483647; display: none">' +
      '<button id="'   + main_dialog_word_count_id + '">Word count</button>' +
      '<button id="'   + main_dialog_close_id      +      '">Close</button>' +
      '<div id="'      + main_dialog_cli_id        + '" class="terminal"></div>' +
    '</div>'
  const main_dialog_selector = '#' + main_dialog_id
  cooked_site_css += main_dialog_selector + '{position: fixed; top: 0; left: 0; z-index: 2147483647; background-color: yellow}' // + main_dialog_selector + ' * {all: unset}';// #wmaster_ui_main_cli .cmd .clipboard {color: transparent}'

  console.log(495, new_html)
  $body.append(new_html)
  const $main_dialog                            = jQuery('#' + main_dialog_id)
  const $main_dialog_word_count                 = jQuery('#' + main_dialog_word_count_id)
  const $main_dialog_close                      = jQuery('#' + main_dialog_close_id)
  const $main_dialog_cli                        = jQuery('#' + main_dialog_cli_id)
  //$main_dialog.hide()
  $main_dialog_cli.terminal((command) => {
    const parsed_command = jQuery.terminal.parse_command(command)
    console.log(382, 30, command, parsed_command)
    const parsed_command_name = parsed_command.name
    const parsed_command_args = parsed_command.args
    const parsed_command_args_0 = parsed_command_args [0]
    if (parsed_command_name === 'fp') {
      const $fixed_or_sticky_elements = jQuery('*').filter((index, element) => {
        const position = jQuery(element).css('position')
        return position === 'fixed' || position === 'sticky'
      })
      console.log(382, 40, $fixed_or_sticky_elements)
      for (const element of $fixed_or_sticky_elements) {
        const matched_rules = wf_getMatchedCSSRules(element)
        console.log(382, 50, element, matched_rules)
        if (matched_rules) {
          for (const rule of matched_rules) {
            console.log(382, 60, rule)
            if (rule.style.position === 'fixed' || rule.style.position === 'sticky') {
              console.log(382, 70, rule)
              rule.style.position = ''
            }
          }
        }
      }
      //this.echo(fp.length)
      if (parsed_command_args_0 === 'rm') {
        $fixed_or_sticky_elements.not($main_dialog).remove()
      }
    } else  if (parsed_command_name === 'pp') {
      console.log(382, 80, parsed_command_args_0)
      process_page()
    } else  if (parsed_command_name === 'wa') {
      console.log(382, 85, parsed_command_args_0)
      if (parsed_command_args_0 !== '') {
        throw new Error('args not implemented')
      }

    } else  if (parsed_command_name === 'wc') {
      console.log(382, 90, parsed_command_args_0)
      if (parsed_command_args_0 !== '') {
        site_data.count_words.grafs = parseInt(parsed_command_args_0)
      }
      count_words(site_data)
    } else {
      this.echo('Unrecognized command')
    }
  }, {
    greetings: '',
    //name: 'js_demo',
    //height: 200,
    prompt: '> '
  })
  const $main_dialog_cli_textarea = $main_dialog_cli.find('textarea')

  const sites_data = [
    {
      name: 'New York Times',
      alternate_origins: ['https://cooking.nytimes.com', 'https://douthat.blogs.nytimes.com', 'https://krugman.blogs.nytimes.com', 'https://kristof.blogs.nytimes.com', 'https://well.blogs.nytimes.com', 'https://lens.blogs.nytimes.com', 'https://www.nytimes.com/section/magazine'],
      alternate_prefixes: ['file:///root/wayback/nytimes/', 'file:///root/wayback/nytimes_todayspaper/'],
      count_words: {append: '.byline:last-of-type, .byline-column, ' + selector_for_elements_with_a_class_that_starts_with('Byline-bylineAuthor--'), prefix: ' ', subject: ['.story-body-text, .g-body', '.story-body', '#story'], grafs: 0},
      article_theme_selector: 'input, textarea, .columnGroup', // NYT dark theme
      article_theme_background_selector: '.bcColumn, .cColumn', // NYT dark theme
      article_theme_foreground_selector: '.masthead .masthead-menu li, .headline, .kicker, .dateline, .story-quote, .caption, figcaption, h1, h2, h3, h4, h5, h6, .byline, .dropcap, .g-body, .swiper-text p, .story-body-text, .story-body-text strong:first-child,' +
        selector_for_elements_with_a_class_that_starts_with('ResponsiveMedia-captionText-- HeaderBasic-bylineTimestamp-- HeaderBasic-summary-- HeaderBasic-label--'),
      article_css: '.App__app {margin-top: 0} .story-body-text {font-family: "Times New Roman"} .caption-text {font-family: sans-serif} .story-header, .image {position: relative}' +
        'input, textarea {background-image: none} .shell {padding-top: 0} .main {border-top: none} .nytg-chart {color: #000; background-color: #fff}' + // NYT dark theme
        selector_for_elements_with_a_class_that_starts_with('SectionBar-sectionBar--') + '{border-width: 0} ' +
        'figure.layout-vertical-full-bleed .image img {width: 47%; margin-left: 30px}' +
        'figure.layout-small-horizontal .image img {width: 98%; margin-left: 5px}' +
        'figure.layout-large-horizontal .image img {width: 47%; margin-left: 30px}' +
        'figure.layout-jumbo-horizontal, figure.layout-full-bleed-horizontal .image img {width: 87%; margin-left: 30px}' +
        'figure.layout-large-vertical .image img {width: 47%; margin-left: 30px}' +
        'figure.layout-jumbo-vertical .image img {width: 47%; margin-left: 30px}',
      article_hide_selector: 'nav, #masthead, .newsletter-signup, #whats-next, #site-index, .story-meta-footer-sharetools, .comments-button, [id="18-insider-promo-module"], #obstruction-justice-promo, #how-republican-voted-on-health-bill, #brexit-latest-fallout-tracker,' +
        '#story-ad-1-wrapper, #story-ad-2-wrapper, #story-ad-3-wrapper, #story-ad-4-wrapper, #story-ad-5-wrapper, #opinion-aca-callout, #next-steps-for-health-care-bill, [id="06up-acachart"], #house-vote-republican-health-care-bill, #morning-briefing-weather-module,' +
        '#related-combined-coverage, .text-ad, #comey-promo, figure.video, .page-footer, .story-info, .story-print-citation, #fbi-congress-trump-russia-investigations, .vis-survey-box, #oil-prices, #Ask-Real-Estate-Promo, #wannacry-ransomware-map, #app > div > div' +
        '#how-self-driving-cars-work, #ransomware-attack-coverage, #fall-upfront-2017, figure[id*=pullquote], figure[id*=email-promo], figure[id*=DAILY-player], #why-its-so-hard-to-have-an-independent-russia-investigation, #navigation-edge, #europe-terror-attacks, ' +
        '#document-Robert-Mueller-Special-Counsel-Russia, #julian-assange-timeline, #anthony-weiner-plea-agreement, #assange-fblive-promo, .meter-asset-wrapper, #news-tips-article-promo, .cColumn>.first, #nyt-weather, ' +
        selector_for_elements_with_a_class_that_starts_with('Masthead-mastheadContainer--') + ',' +
        selector_for_elements_with_a_class_that_starts_with('SectionBarShare-shareMenu--') + ',' +
        selector_for_elements_with_a_class_that_starts_with('Recirculation-recirculation--'),
      extra_sub_element_selectors: 'h3.story-heading',
      homepage_theme_foreground_selector: '.summary', // NYT dark theme
      //homepage_css: 'header {background-color: #aaa}', // NYT dark theme
      homepage_hide_selector: '#masthead-placeholder, .masthead-cap-container, .masthead.theme-in-content, div.editions.tab, #nytint-hp-watching, #site-index .section-header, #markets, .all-sections-button, #mini-navigation, #WelcomeAd_optly',
      hide_selector: '.ad',
      theme_selector: 'body, #masthead, .searchsubmit', // NYT dark theme
      css: '.story.theme-main .story-meta-footer {border-top: none; border-bottom: none}',
      dark_theme: 1, // to turn this off, change the 1 to a 0 and comment out all other lines that are commented "NYT dark theme"
      origin: 'https://www.nytimes.com',
      unwanted_query_fields: 'action clickSource contentCollection contentPlacement hp module pgtype _r ref region rref smid smtyp src version WT.nav WT.z_jog hF vS utm_campaign utm_content utm_medium utm_source t target mcubz gwh gwt mtrref',
      unwanted_classes: 'theme-pinned-masthead',
      customize () {
        if (location_href.startsWith('https://www.nytimes.com/newsletters/')) return
        const
          //js_header_class_signature = 'Masthead-mastheadContainer--',
          js_header_selector = selector_for_elements_with_a_class_that_starts_with('HeaderBasic-bylineTimestamp--')
        //let
          //class_list,
          //js_header_class_name = false,
          //js_header_element,
          //logo_element
        this.article_theme_foreground_selector += ',' + selector_for_elements_with_a_class_that_starts_with('HeaderBasic-headerBasic--')
        this.count_words.append                += ',' + js_header_selector
        //console.log(11, this.article_theme_foreground_selector)
        if (location_href.indexOf('?') !== -1) alert('location_href: ' + location_href)
        if (page_level === 2) {
          jQuery('figure.video').css({'width': '30%', 'margin-left': '30px'})
          jQuery('.g-artboard' ).css({'width': '90%', 'margin-left': '30px'})
          document.styleSheets[0].addRule('.g-artboard *, .g-graphic *, .nytg-chart *', 'background-color: transparent !important')
          //cooked_site_css += ' .interactive-graphic * {background-color: #fff !important; color: #000 !important}'
          $body.removeClass('lens-hide-titles')
        } else {
          //Object.freeze(document.location); // doesn't work -- and why would anyone expect it to?
          const logo_element = jQuery('h2.branding') [0]
          if (logo_element) logo_element.innerHTML = '<img width="573" height="138" src="file:/home/will/public_html/green_york_times.png">'
          else console.log('warning: logo not found')
        }
        for (const img of jQuery('img.g-freebird-lazy')) {
          //jQuery(img).css({'padding-top': '0'})
          img.src = img.dataset.src
        }
        for (const img of jQuery('img[data-superjumbosrc]')) {
          jQuery(img).css({'padding-top': '0'})
          img.src = img.dataset.superjumbosrc
        }
        console.log(571, 10)
        for (const img of jQuery('img.media-viewer-candidate')) {
          const mediaviewer_src = img.dataset.mediaviewerSrc
          console.log(571, 20, mediaviewer_src)
          if (mediaviewer_src) {
            console.log(571, 30)
            img.src = mediaviewer_src
          } else {
            const raw_widths = img.dataset.widths
            console.log(571, 40, raw_widths)
            const parsed_widths = JSON.parse(raw_widths)
            let max_width_found = 0
            let slug = ''
            console.log(571, 50, parsed_widths)
            for (const width of parsed_widths) {
              const size = width.size
              console.log(571, 60, width)
              if (size > max_width_found) {
                max_width_found = size
                slug = width.slug
                console.log(571, 70)
              }
            }
            if (max_width_found) {
              img.src = slug
              console.log(571, 80, slug)
            }
          }
          console.log(571, 90)
        }
        console.log(571, 100)
        //remove_fixed_positioning(site_data)
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
      article_css: '.js-headline-text {font-weight: normal} p {line-height: 170%} a {border-bottom: none} figure.element-tweet {margin-right: 4rem} .tweet {font-family: sans-serif} img.byline-img__img {background: transparent} .content {padding-bottom: 0}' +
        'a:' + 'link[data-link-name="auto-linked-tag"] {color:' +         theme_autolink_foreground_color + '} a:' + 'link:hover[data-link-name="auto-linked-tag"] {color:' +         theme_link_foreground_color + '}' +
        'a:visited[data-link-name="auto-linked-tag"] {color:' + theme_autolink_visited_foreground_color + '} a:visited:hover[data-link-name="auto-linked-tag"] {color:' + theme_link_visited_foreground_color + '}' +
        'div.explainer {background-color: #00252f; border: 1px solid ' + theme_foreground_color + '} .signposting {border-right-width:0} .tabs__tab {border-top: 0.0625rem solid #aaa} .content__article-body {font-family: Adobe Caslon Pro; font-size: 109%}',
      article_theme_selector: '.tonal__standfirst, .tonal__header, .content__standfirst, .content__headline, .byline, .d-top-comment__bubble',
      article_theme_background_selector: '.tonal--tone-live, .tonal--tone-editorial, .tonal--tone-feature, .tonal--tone-comment, .tonal--tone-analysis, .tonal--tone-review, .content__main, .block--content, .navigation, .local-navigation, .navigation-container,' +
        '.top-navigation, .navigation:before, .navigation-toggle, .navigation__container--first, .signposting, .tabs__tab--selected a, .tabs__tab--selected .tab__link, .tabs__tab a, .tabs__tab .tab__link',
      article_theme_foreground_selector: '.content__dateline, div.explainer, .caption, .quoted',
      article_hide_selector: '.element-video, .contributions__epic, .js-outbrain, .related, .submeta, #onward, #more-in-section, .element-pullquote, .element-rich-link, .meta__twitter, .meta__extras, .meta__email, .selection-sharing, .block-share, .ad-slot,' +
        'figure[data-canonical-url="https://interactive.guim.co.uk/embed/2017/05/americas-unequal-future/embed.html"], figure[data-canonical-url="https://interactive.guim.co.uk/embed/2017/02/outside-in-america/embed.html"],' +
        ' #this_land_epic_bottom_environment_iframe, #this_land_epic_bottom_series_iframe, .vav-callout',
      dark_theme: 1,
      homepage_hide_selector: '#most-viewed, .footer__email-container, div.image>div.video, #securedrop, #membership-thrasher, #support-the-guardian, .treats__container',
      // '.fc-container--story-package, .facia-page, .index-page, .voices-and-votes-container__wrapper, .l-side-margins, .fc-container--thrasher, .tone-news--item.fc-item, .du-faux-block-link--hover, .tone-feature--item, .fc-container--story-package .fc-item, .tone-analysis--item.fc-item, .tone-comment--item.fc-item, .tone-editorial--item, .tone-media--item, .tone-review--item',
      homepage_theme_background_selector: '.fc-container--story-package, .u-faux-block-link--hover, .facia-page, .fc-item__container',
      homepage_theme_selector: '',
      homepage_css: '.tone-live--item {background-color: #5a0b00} .fc-item.tone-letters--item {background-color: #333} .fc-container--story-package {border-top-width: 0} .js-on .fc-show-more--hidden .fc-show-more--hide {display: block}',
      hide_selector: '.adverts, .site-message',
      customize () {
        if (page_level === 0) {
          //jQuery('#opinion .button--show-more, #from-the-uk .button--show-more, #around-the-world .button--show-more').click()
          //d
          jQuery('.button--show-more').click()
        }
      },
    },
    {
      name: 'Washington Post',
      origin: 'https://www.washingtonpost.com',
      alternate_origins: ['http://washingtonpost.com', 'http://www.washingtonpost.com', 'https://live.washingtonpost.com'],
      alternate_prefixes: ['file:///root/wayback/washingtonpost/'],
      article_css: '#main-content {background-image: none} #et-nav {position: absolute}.headline {font-family: sans-serif} a, .powerpost-header, .layout_article #top-content {border-bottom: none} p {line-height: 155%} body {overflow-y: visible}' + //.pb-f-homepage-story {background-color: #300},
        '.fixed-image {position: static} .g-artboard img {border-bottom: 30px solid white} .g-artboard p {color: black; background-color: transparent} .bg-none {background-color: transparent} .note-button {padding: 0; box-shadow: none}' +
        '.chain-wrapper {background-color: #500}' +
        'a.note-button:link    {color:' +         theme_autolink_foreground_color + '} a.note-button:link:hover    {color:' +         theme_link_foreground_color + '}' +
        'a.note-button:visited {color:' + theme_autolink_visited_foreground_color + '} a.note-button:visited:hover {color:' + theme_link_visited_foreground_color + '}',
      article_hide_selector: '#wp-header, #top-furniture, .pb-f-ad-flex-2, .pb-f-ad-flex-3, .pb-f-games-gamesWidget, .pb-f-page-footer-v2, .pb-f-page-recommended-strip, .pb-f-page-editors-picks, disabled.chain-wrapper, .extra, .pb-f-generic-promo-image, .interstitial-link,' +
        '.pg-interstitial-link, .pb-f-posttv-sticky-player, .pb-f-posttv-sticky-player-powa, .xpb-f-article-article-author-bio, .pb-tool.email, .pb-f-page-newsletter-inLine, .pb-f-page-comments, .inline-video, [channel="wp.com"], .pb-f-page-jobs-search,' +
        '.pb-f-homepage-story, .pb-f-sharebars-top-share-bar, .pb-f-page-share-bar, .wp_signin, #wp_Signin, .inline-graphic-linked, .share-individual, .pb-f-page-trump-can-he-do-that-podcast, .bottom-ad--bigbox',
      article_theme_selector: '#article-body, p, blockquote, .pg-bodyCopy',
      article_theme_background_selector: '.wp-volt-gal-embed-promo-container, .wp-volt-gal-embed-promo-bottom, #weather-glance, #weather_now, .cwgdropdown, #heat-tracker, #weather-almanac, .pb-f-capital_weather_gang-weather-almanac select, .border-bottom-hairline::after, .span12, .note-button',
      article_theme_foreground_selector: '.pb-caption, .pg-caption, .pb-bottom-author, .pb-timestamp, .pg-pubDate, .weather-gray, #weather_now .time, .firstgraf::first-letter',
      count_words: {append: '.pg-pubDate, .bottomizer, .pb-sig-line, .pbHeader, .publish-date', subject: '#article-body>article, #pg-content>article, .sections>.container'},
      homepage_css: 'header {position: relative} .pb-f-homepage-story .headline a, .related-links a, #bottom-content a {font-family: sans-serif; font-weight: normal} img.wplogo {-webkit-filter: invert(70%) sepia(100%) hue-rotate(65deg) saturate(7)}',
      homepage_theme_background_selector: '#pb-root, .homepage-footer-button, .pb-f-page-todays-paper-rr .large, .pb-f-homepage-chat-schedule .chat-schedule-button a',
      homepage_theme_selector: '.pb-f-homepage-card .panel',
      //hide_selector:'.pb-f-page-post-most img',
      homepage_theme_foreground_selector: '.label, .blurb, .byline, .author, .caption',
      homepage_hide_selector: '.pb-f-homepage-brandconnect-sidebar, .section-story-photo-1', //, .standard-chain img, .opinions-chain img',
      css: '.overlineLabel {font-family: "Helvetica Black", sans-serif; font-weight: bold}',
      theme_foreground_selector: 'h1, h2, h3, h4, h5, h6',
      theme_selector: 'body, .skin.skin-card, .skin.skin-button, input',
      unwanted_query_fields: 'hpid tid utm_term wpisrc wpmk',
      customize () {
        console.log(848, 0)
        for (const stylesheet_link of jQuery("link[rel='stylesheet']")) {
          const stylesheet_link_href = stylesheet_link.href
          //console.log(stylesheet_link_href)
/*
          let alt_prefix = 'file://www.washingtonpost.com/'
          if (stylesheet_link_href.startsWith(alt_prefix)) {stylesheet_link.href = site_data.origin + stylesheet_link_href.substring(alt_prefix.length - 1);}
          alt_prefix = 'file:///'
          if (stylesheet_link_href.startsWith(alt_prefix)) {stylesheet_link.href = site_data.origin + stylesheet_link_href.substring(alt_prefix.length - 1);}
*/
          for (const prefix of ['file://www.washingtonpost.com/', 'file:///']) {
            if (stylesheet_link_href.startsWith(prefix)) {
              stylesheet_link.href = site_data.origin + stylesheet_link_href.substring(prefix.length - 1)
              break
            }
          }

          //console.log(stylesheet_link.href)
        }
        const $imgs = jQuery('img.unprocessed')
        console.log(848, 100, $imgs)
        for (const img of $imgs) {
          console.log(848, 110, img)
          img.src = img.dataset.hiResSrc
          //jQuery(img).css({'filter': 'none', 'webkit-filter': 'none'})
          //jQuery(img).removeClass('unprocessed')
        }
        $imgs.removeClass('unprocessed')
        /*
        for (const img of jQuery('img.lzyld, img.placeholder')) {
          jQuery(img).css({'padding-top': '0'})
          img.src = img.dataset.hiRes || img.dataset.hiResSrc
        }
        */
        for (const img of jQuery('img.lazy-image')) {
          img.src = img.dataset.original + '&w=1200'
        }
        if (page_level === 2) {
          const $elements = jQuery('p span') // For some strange reason this site occasionally has <span style="color: #000000;"> in the middle of a graf, which is invisible on the unmodified site but hides the text under dark_theme.
          for (const element of $elements) {
            const $element = jQuery(element)
            if ($element.attr('style')) {
              //window.e = element
              //document.e = element
              const element_style = element.style
              //console.log(511, 40, element, element_style, element_style.color)
              if (element_style.color !== '') {
                //console.log(511, 60)
                element_style.color = '' //'rgb(255, 0, 0)'
              }
            }
          }
          for (const element of jQuery('article p, article p>i, article p>em')) { // hide interstitial links
            const $element = jQuery(element)
            const element_contents = $element.contents()
            if (element_contents.length === 3 && element_contents [0].textContent === '[') $element.hide()
            //console.log(85, jQuery(element).contents() [0], (jQuery(element).contents() [0].textContent === "["))
          }
          jQuery('div.inline-content:has([data-slug="a-look-at-president-trumps-first-year-in-office-so-far"])').hide()
        }
        //regularize_links(site_data)
      }
    },
    {
      name: 'McClatchy DC Bureau',
      origin: 'http://www.mcclatchydc.com',
      article_hide_selector: '.share-tools-wrapper, #ndnWidget, .highline-quote, #story-related, .wf_interstitial_link',
      customize () {
        const content_body_element = jQuery('#content-body-')
        const content_body_element_children = content_body_element.children()
        //console.log(41, content_body_element, content_body_element_children)
        //window.c = []
        for (const content_body_element_child of content_body_element_children) {
          const content_body_element_grandchildren = content_body_element_child.children
          if (content_body_element_grandchildren.length === 1) {
            const content_body_element_grandchild = content_body_element_grandchildren [0]
            if (content_body_element_grandchild.tagName === 'A') {
              const chunk_direct_text = direct_text_content(content_body_element_child)
              if (chunk_direct_text === '[RELATED: ]' || (chunk_direct_text === '' && content_body_element_grandchild.textContent [0] === '[')) {
                jQuery(content_body_element_child).addClass('wf_interstitial_link')
              }
            }
          }
          //console.log(45, content_body_element_child, direct_text_content(content_body_element_child), content_body_element_grandchildren)
          //if (direct_text_content(content_body_element_child) === '' &&
        }
        //console.log(47, direct_text_content(content_body_element_children [61]))
        //console.log(49, direct_text_content(content_body_element_children [62]))
      }
    },
    {
      name: 'The Intercept',
      origin: 'https://theintercept.com',
      article_theme_foreground_selector: '.PostContent, .PostContent u, h1, h2, h3, h4, h5, h6, .caption',
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
      article_hide_selector: '.bottom-banner, .rubricautofeature, .top-comment, .follow-links, .social',
      css: '.user-link, .search-link, .global-nav-handle {background-color:' + theme_background_color + '; -webkit-filter: brightness(70%) sepia(100%) hue-rotate(55deg) saturate(7)}' +
        '.logo, .prop-image img {-webkit-filter: hue-rotate(180deg) brightness(60%) sepia(100%) hue-rotate(55deg) saturate(7)}',
      article_css: '.roll-up {position: absolute} .meta {background: none}', //'.about-the-author.fancy {background: none} .about-the-author.fancy .author-bio {border-bottom: none}',
      count_words: {append: '.pub-date', subject: '.body .text'},
      theme_background_selector: '.page, .nav-header',
    },
    {
      name: 'Google Voice',
      origin: 'https://voice.google.com',
      dark_theme: 0,
      customize () {
        (function monitor () {
          const titles = jQuery('p[gv-test-id="conversation-title"]')
          console.log(718, 20, titles, titles.length)
          if (titles.length) {
            const title_text = titles [0].textContent
            console.log(718, 30, title_text, title_text.indexOf('Rebecca Rivers'))
            let theme_color, theme_color2
            if (title_text.indexOf('Rebecca Rivers') !== -1) {
              theme_color = '#cfc'
              theme_color2 = '#ebffeb'
            } else  if (title_text.indexOf('Xavier Rivers') !== -1) {
              theme_color = '#fcc'
              theme_color2 = '#ffebeb'
            } else {
              theme_color = '#ffc'
              theme_color2 = '#ffffeb'
            }
            jQuery('gv-message-entry .md-body-1').css('background', theme_color)
            jQuery('md-content').css('background', theme_color2)
          }
          setTimeout(monitor, 2000)
        })()
      }
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
      name: 'Jacobin',
      origin: 'https://www.jacobinmag.com',
      article_css: '.si-hr {position: absolute} .lt__image {-webkit-filter: brightness(70%) sepia(100%) hue-rotate(55deg) saturate(7)} .py-nv__menu-icon, .py-nv__toggle--login, .py-nv__toggle--search {-webkit-filter: brightness(70%) sepia(100%) hue-rotate(55deg) saturate(7) brightness(60%)}',
      article_hide_selector: '.sr-dock',
      article_theme_foreground_selector: '.po-hr-cn, p::first-letter, .po-hr-im, .po-cn__subhead',
      article_theme_selector: '.si-hr',
      theme_foreground_selector: '.py-nv__toggle-label',
    },
    {
      name: 'Politico',
      origin: 'http://www.politico.com',
      article_css: '.super {background: none} h1>span, h1 {background-color: transparent}',
      article_hide_selector: '.story-interrupt, .story-tools, .story-related, .story-share',
      count_words: {append: '.timestamp', subject: '.story-text'},
    },
    {
      name: 'Bloomberg',
      origin: 'https://www.bloomberg.com',
      article_css: '.lede-text-only__highlight {box-shadow: none} .bb-nav[data-theme=view] {background-color: #600} .wmaster_words_count_total {margin-left: 0.4em} .sticky-container {position: absolute}',
      article_hide_selector: '#adBlockerContainer, .persist-nav, .sticky-social-buttons, .inline-newsletter',
      article_theme_foreground_selector: '.body-copy, blockquote, .lede-media-image__caption, .lede-text-only__byline',
      article_theme_selector: '.lede-text-only__highlight',
      count_words: {append: '.article-timestamp', subject: '.body-copy'},
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
      article_css: '#masthead {position: absolute}',
      article_theme_background_selector: '#masthead nav, .article-wrapper',
      article_theme_foreground_selector: '.dark-background',
      article_hide_selector: '.hide, .partner-slots, .fb-like, .relatedlinkslist, .layout-component-i100, .layout-component-ines-video-sidebar, .box-comments:first-of-type, .syndication-btn, .video-playlist, .video-popout-wrap',
      customize () {
        const elements = jQuery('.box-comments')
        const elements_length = elements.length
        /*
        const w = jQuery ('.video-poput-wrap')
        console.log(455, w)
        w.remove()
        */
        //console.log(55, elements)
        if (elements_length === 3) {
          jQuery(elements [0]).addClass('hide')
          //console.log(56, elements [0])
          jQuery(elements [1]).addClass('hide')
        } else {
          console.log(site_data.name + ': warning: expected 3 elements, found:', elements_length)
        }
      },
      ddark_theme: 0,
    },
    {
      name: 'The Atlantic',
      origin: 'https://www.theatlantic.com',
      count_words: {append: '.article-cover-extra', subject: '.article-body'},
      //count_words_grafs: true,
      article_hide_selector: '.module-related.video, .js-inject-promo, .social-kit-top, .article-tools, .callout, .pullquote',
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
      customize () {
        jQuery('.entry-content>div:has(.perma-ad-wrapper)').hide()
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
      article_css: '.articleView {padding-top: 80px} .header {position: absolute}',
      article_hide_selector: '#drawerMenu, .mobileTitle ul, footer, .header.smaller',
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
      count_words: {append: '#editorial-article-wrapper-container>:first-child>:first-child>:first-child>:first-child>:first-child', subject: 'article'},
      article_hide_selector: '.ssv3__nav',
      article_theme_background_selector: 'h1, h2, h3, blockquote, .article-viewport',
      article_theme_foreground_selector: '.xxx_oneoff_special_story_v3_headline',
      article_theme_selector: 'p',
      //article_hide_selector: '.clay-share',
      //article_theme_foreground_selector: 'p:first-letter',
    },
    {
      name: 'New York Magazine',
      origin: 'http://nymag.com',
      count_words: {append: '.article-timestamp', subject: '.article-content'},
      article_hide_selector: '.clay-share, .page-header',
      article_theme_foreground_selector: 'h1, p, figcaption, time, .by-authors',
      article_theme_background_selector: '.video-promo-for-articles',
      article_css: 'blockquote, blockquote p {' + theme_foreground_rule + 'padding: 0 0 0 14px; border-left: 1px solid #3a3} blockquote:before {border-top: none} .mediaplay-image-figcaption {text-align: left} ' +
        'nav.rubric-wrap svg>path:last-child {fill: white}', // "Intelligencer" in Daily Intelligencer logo
      homepage_theme_background_selector: '.newsHeadlinesByPublication section, .dek, .hed',
    },
    {
      name: 'The Cut',
      origin: 'https://www.thecut.com',
      count_words: {append: '.article-timestamp', subject: '.article-content'},
      article_hide_selector: '.related-stories',
      article_theme_foreground_selector: 'h1, .clay-paragraph, .mediaplay-image-figcaption',
    },
    {
      name: 'Vulture',
      origin: 'http://www.vulture.com',
      article_theme_background_selector: '.global-nav',
      article_hide_selector: '.clay-share',
      article_theme_foreground_selector: 'h1, .clay-paragraph, .mediaplay-image-figcaption, .by-authors, time',
      article_css: '.logo-wrap {background-color: #333}',
      count_words: {append: '.article-timestamp', subject: '.article-content'},
    },
    {
      name: 'Vox',
      origin: 'https://www.vox.com',
      article_hide_selector: '.main-social, .c-article-feedback, .c-tab-bar, .c-rock-newsletter',
      article_theme_background_selector: 'header .l-wrapper {max-width: none} .l-main-content, .c-global-header:before, .c-global-header__logo, .c-rock-list__title-wrapper:before, .c-compact-river__entry, .c-footer',
      article_theme_foreground_selector: '.c-page-title, .c-byline, .p-dek, .p-rock-head',
      count_words: {append: '.c-byline', subject: '.c-entry-content'},
      css: '.c-global-header__logo path {fill: ' + theme_foreground_color + '} .c-compact-river__entry, .c-footer {border-top-width: 0}',
    },
    {
      name: 'The Verge',
      origin: 'https://www.theverge.com',
      article_hide_selector: '.c-entry-content>[class^=c-float-]>aside>q, #newsletter-signup-short-form, .tab-bar-fixed',
      article_theme_background_selector: '.l-main-content',
      article_theme_foreground_selector: '.c-page-title, .c-byline, .e-image__meta, .p-dek' //, .p-rock-head',
    },
    {
      name: 'The New Yorker',
      origin: 'http://www.newyorker.com',
      css: selector_for_elements_with_a_class_that_starts_with('Logo__logo___') + '{-webkit-filter: invert(70%) sepia(100%) hue-rotate(65deg) saturate(7)}',
      count_words: {append: selector_for_elements_with_a_class_that_starts_with('ArticleHeader__metaInfo___'), subject: '#articleBody'},
      //article_css: '.single-post #articleBody p a, .single-post #articleBody .gallery-caption a, .single-post #articleBody u, .articleBody p a, .articleBody .gallery-caption a, .articleBody u, .author-masthead p a, .author-masthead .gallery-caption a, .author-masthead u {text-shadow: none; background: none}',
      article_css: 'a {text-shadow: none; background: none} body>header {position: static}' + selector_for_elements_with_a_class_that_starts_with('ArticleHeader__articleHeader___') + '{border-bottom-width: 0}' +
        selector_for_elements_with_a_class_that_starts_with('PageContainer__pageContent___') + '{padding-top: 0}',
      //article_hide_selector: '.social-module, .strongbox-promo-wrapper, .social-hover, .footer-content, #recirc-pos-2',
      article_hide_selector: selector_for_elements_with_a_class_that_starts_with('MainHeader__topBarItems___ MainHeader__topBar MainHeader__collapsed___ Layout__social___ RecirculationMostPopular__default___'),
      article_theme_background_selector: 'article>header, .hamburger-dropdowns-navigation__top-level, footer',
      //article_theme_foreground_selector: 'article>header .title, article>header time.blog-post-date, .articleBody p, .caption, .author-masthead, .hero-image-caption',
      article_theme_foreground_selector: '.caption, blockquote, p:first-child:first-letter,' + selector_for_elements_with_a_class_that_starts_with('ArticleBody__articleBody___ ImageCaption__caption___ ArticleContributors__bio___ ArticleHeader__dek___'),
      homepage_css: selector_for_elements_with_a_class_that_starts_with('SiteHeader__siteHeader___') + '{position: absolute}',
      homepage_hide_selector: '.fixed-topnav, iframe, #strongbox-promo',
      homepage_theme_background_selector: '#main, .logo-container,' + selector_for_elements_with_a_class_that_starts_with('MainHeader__mainHeader___ MainHeader__mainHeader___:after MainHeader__topBar___:after'),
      homepage_theme_foreground_selector: selector_for_elements_with_a_class_that_starts_with(
        'Hero__dek___ River__dek___ Card__dek___ Byline__by___ RecirculationMostPopular__counter___ RecirculationMostPopular__byLine___ RecirculationMostPopular__title___ Card__timestamp___ ImageCaption__cartoon Video__description___'),
      hide_selector: 'iframe, ' + selector_for_elements_with_a_class_that_starts_with('MainHeader__partial___ Ad__header___'),
      customize () {
        //if (location_href.indexOf('?') !== -1) alert(location_href)
        if (page_level === 2) {
          /*
          //console.log(390, 1, location_href)
          for (const element of jQuery('body>header')) {
            //console.log(390, 2, element)
          }
          */
        } else {
          /*
          const logo_element = jQuery('h1') [0]
          if (logo_element) logo_element.innerHTML = '<img width="400" height="94" src="file:/home/will/public_html/green_yorker.png">'
          else console.log('warning: logo not found')
          */
        }
        //remove_fixed_positioning(site_data)
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
      origin: 'https://www.wunderground.com',
      dark_theme: 0,
    },
    {
      name: 'Ars Technica',
      origin: 'https://arstechnica.com',
      alternate_origins: ['https://arstechnica.co.uk'],
      hide_selector: '.site-header.is_stuck.scrolled-up',
      article_hide_selector: '.share-links, .pullbox',
      article_css: '.site-wrapper {background-color: transparent}', // if set to black, this hides images in Chrome as of 6/19/2017
      count_words: {append: '.byline', subject: '.article-content', grafs: 2},
    },
    {
      name: 'The Baltimore Sun',
      origin: 'http://www.baltimoresun.com',
      css: '.trb_nh {position: absolute} .trb_nh_lw {border-bottom-width: 0}',
      hide_selector: '.trb_bnn, .met-promo',
      article_hide_selector: '#reg-overlay, .trb_nls_c, .trb_mh_adB, .trb_gptAd, .trb_ar_sponsoredmod, [data-content-type="tweetembed"]', //, aside:has([data-content-kicker="Related"])',
      theme_background_selector: '.trb_nh_uw, .trb_nh_lw, .trb_allContentWrapper',
      article_theme_foreground_selector: '.trb_ar_page>ol, .trb_ar_page>p, .trb_ar_page>ul, .trb_ar_page[data-content-page="1"]>p:first-child:first-letter',
      article_css: 'html, body {overflow: visible}',
      homepage_theme_foreground_selector: '.trb_outfit_group_list_item_brief',
      count_words: {append: '.trb_ar_dateline', subject: '[itemprop=articleBody'},
      //count_words: {append: '.byline', subject: '.article-body'},
      customize () {
        //body.css('overflow', 'visible')
        jQuery('aside:has([data-content-kicker="Related"])').hide() // This would be in article_hide_selector, but that fails enigmatically as of 2017-05-30
        for (const img of jQuery('img[data-baseurl]')) img.src = img.dataset.baseurl
      },
    },
    {
      name: 'Los Angeles Times',
      origin: 'http://www.latimes.com',
      css: '.trb_nh {position: absolute} .trb_nh_l, .trb_nh_sm_o_svg {fill:' + theme_foreground_color + '} .trb_nh_unh_hr {border-color:' + theme_foreground_color + '}',
      article_hide_selector: '.trb_nh_lw, .trb_mh_adB, .trb_sc, .trb_ar_bc, .trb_gptAd.trb_ar_rail_ad, .trb_embed[data-content-type=story], .wf_interstitial_link, [name="support-our-journalism"], [data-content-type="pullquote"], .journo-promo, .promo, .trb_rhsAdSidebar',
      theme_background_selector: '.trb_allContentWrapper',
      theme_foreground_selector: '.trb_nh_un_hw:before',
      article_theme_background_selector: '.trb_article',
      article_theme_foreground_selector: 'article p, article ul, .dropcap, .trb_ar_page[data-content-page="1"]>p:first-child:first-letter, #story>p:first-child:first-letter',
      article_css: '.trb_mh {margin-top: 70px} a:link[   href^="/topic/"] {color: #00e766} a:link:hover[href^="/topic/"] {color: #00f} a:visited[href^="/topic/"] {color: #99d700} a:visited:hover[href^="/topic/"] {color: purple}' ,
      hide_selector: '.met-promo',
      count_words: {append: '.trb_ar_dateline', subject: 'div[itemprop="articleBody"]', nbsp_size: '100%'},
      unwanted_query_fields: 'bn',
      customize () {
        const chunks = jQuery('div[itemprop="articleBody"] p')
        //console.log(41, chunks)
        //window.c = []
        for (const chunk of chunks) {
          const children = chunk.children
          const debug = false
          if (children.length === 1) {
            if (debug) console.log(42)
            const child = children [0]
            if (debug) console.log(43, child)
            if (child.tagName === 'STRONG') {
              if (debug) console.log(44)
              const child_text = direct_text_content(child)
              if (debug) console.log(45, child_text)
              if (child_text === '') {
                if (debug) console.log(46)
                const grandchildren = child.children
                if (debug) console.log(47, grandchildren)
                if (grandchildren.length === 1) {
                  if (debug) console.log(48)
                  const grandchild = grandchildren [0]
                  if (debug) console.log(49, grandchild)
                  if (grandchild.tagName === 'A') {
                    if (debug) console.log(50)
                    const grandchild_text = direct_text_content(grandchild)
                    if (debug) console.log(51)
                    if (grandchild_text [grandchild_text.length - 1] === '»') {
                      if (debug) console.log(52)
                      jQuery(chunk).addClass('wf_interstitial_link')
                    }
                  }
                }
              }
            }
          }
          //console.log(45, this, direct_text_content(this), this_children)
          //if (direct_text_content(this) === '' &&
        }
        //console.log(47, direct_text_content(content_body_element_children [61]))
        //console.log(49, direct_text_content(content_body_element_children [62]))
      }
    },
    {
      name: 'Huffington Post',
      origin: 'http://www.huffingtonpost.com',
      article_hide_selector: '.nav-sticky__bar, .header__social-list',
      article_theme_foreground_selector: '.headline__title, .headline__subtitle, .entry__body',
      article_css: 'html {font-family: sans-serif}',
    },
    {
      name: 'Washington Examiner',
      origin: 'http://www.washingtonexaminer.com',
      article_css: '.fixed-top {position: absolute}',
    },
    {
      name: 'Yale Law Journal',
      origin: 'http://www.yalelawjournal.org',
      article_theme_foreground_selector: 'p, .author, h1, #content_type',
      article_css: 'nav {position: absolute} .wmaster_words_count_total {margin-left: 0.5em}',
      article_hide_selector: '#article_tool_stack',
      count_words: {append: '.author', subject: '#article_wrapper'}
    },
    {
      name: 'Wired',
      origin: 'https://www.wired.com',
      article_css: '.header {position: absolute} .nav--design.nav--is-active {background-color: #344} .article-body-component a {border-bottom-width: 0; box-shadow: none}',
      article_theme_background_selector: '.article-main-component, .header, .logo-bar--design',
      article_theme_foreground_selector: '.article-body-component, .title, .brow-component, .content-header-component .meta-list li, .lede, .caption-component__credit, .article-body-component h3',
    },
    {
      name: 'Union of Concerned Scientists',
      origin: 'http://www.ucsusa.org',
      alternate_origins: ['http://blog.ucsusa.org', 'http://allthingsnuclear.org'],
      count_words: {append: '.username', subject: '.article-content'},
      css: 'div#header {position: absolute} #logo {-webkit-filter: invert(70%) sepia(100%) hue-rotate(65deg) saturate(7)}',
      theme_foreground_selector: 'h1, h2, h3, h4, h5, h6',
      theme_background_selector: '#wrap, #white-inner, #header',
      article_theme_background_selector: '.blog_series',
      article_css: '.blog_series {border-width: 0}',
    },
    {
      name: 'New York Post',
      origin: 'http://nypost.com',
      article_hide_selector: '.floating-share',
    },
    {
      name: 'Just Security',
      origin: 'https://www.justsecurity.org',
      article_theme_selector: 'blockquote',
    },
    {name: 'Stack Overflow'         , origin: 'http://stackoverflow.com'             , dark_theme: 0},
    {name: 'Review of Ophthalmology', origin: 'https://www.reviewofophthalmology.com'},
    {name: 'The Economist'          , origin: 'http://www.economist.com'             , article_hide_selector: '.latest-updates-panel__container'},
    {name: 'The Ringer'             , origin: 'https://theringer.com'                , article_hide_selector: '.js-postShareWidget, .metabar--spacer', unwanted_classes: 'u-fixed metabar'},
    {name: 'Reason'                 , origin: 'http://reason.com'                    , article_css: 'html, body {font-family: Georgia}'},
    {name: 'Rolling Stone'          , origin: 'http://www.rollingstone.com'          , article_css: 'header {position: static}', dark_theme: 0},
    {name: 'Wikipedia'              , origin: 'https://en.wikipedia.org'             , dark_theme: 0},
    {name: 'Spectator'              , origin: 'https://www.spectator.co.uk'          , dark_theme: 0, article_css: '.floatyFloaty {position: static}', article_hide_selector: '.article-promo'},
    {name: 'Local wayback'          , alternate_prefixes: ['file:///root/wayback/'], append_loaded_date: false, count_words_subject: false},
  ]
  //console.table(sites_data)
  //window.sites_data = sites_data

  const sites_data_by_prefix = {}
  for (const site_data of sites_data) {
    const unwanted_query_fields = site_data.unwanted_query_fields
    let prefixes
    if (site_data.origin) prefixes = [site_data.origin]
    else        prefixes = []
    if (site_data.alternate_origins ) prefixes = prefixes.concat(site_data.alternate_origins )
    if (site_data.alternate_prefixes) prefixes = prefixes.concat(site_data.alternate_prefixes)
    if (unwanted_query_fields) site_data.unwanted_query_fields_array = unwanted_query_fields.split(/\s+/)
    //console.log(34, site_data.unwanted_query_fields_array)
    //console.log(35, prefixes)
    for (const prefix of prefixes) {
      if (sites_data_by_prefix.hasOwnProperty(prefix)) console.log('warning: URL prefix "' + prefix + '" is a duplicate!')
      else sites_data_by_prefix [prefix] = site_data
    }
    //console.log(74, site_data.append_loaded_date)
    if      (!site_data                         .hasOwnProperty('append_loaded_date'       )) site_data.append_loaded_date              = 'body'
    if      (!site_data                         .hasOwnProperty('dark_theme'               )) site_data.dark_theme                      = 1

    if      (!site_data                         .hasOwnProperty('std_link_colors'          )) site_data.std_link_colors                 = {}
    else if ( site_data.std_link_colors === false                                           ) site_data.std_link_colors                 = {enable: false}
    if      (!site_data.std_link_colors         .hasOwnProperty('enable'                   )) site_data.std_link_colors.enable          = true

    if      (!site_data                         .hasOwnProperty('theme_selector'           )) site_data.theme_selector                  = 'body'
    if      (!site_data                         .hasOwnProperty('theme_background_selector')) site_data.theme_background_selector       = ''
    if      (!site_data                         .hasOwnProperty('theme_foreground_selector')) site_data.theme_foreground_selector       = ''

    if      (!site_data                         .hasOwnProperty('count_words'              )) site_data.count_words                     = {}
    const count_words_settings = site_data.count_words
    if      (!count_words_settings              .hasOwnProperty('append'                   )) count_words_settings.append               = 'body'
    if      (!count_words_settings              .hasOwnProperty('nbsp_size'                )) count_words_settings.nbsp_size            = '50%'
    if      (!count_words_settings              .hasOwnProperty('subject'                  )) count_words_settings.subject              = 'body'
    if      (!count_words_settings              .hasOwnProperty(      'prefix'             )) count_words_settings.      prefix         = ''
    if      (!count_words_settings              .hasOwnProperty( 'graf_prefix'             )) count_words_settings. graf_prefix         = count_words_settings.prefix
    if      (!count_words_settings              .hasOwnProperty('total_prefix'             )) count_words_settings.total_prefix         = count_words_settings.prefix

    if      (!site_data                         .hasOwnProperty('remove_fixed_positioning' )) site_data.remove_fixed_positioning        = {}
    else if ( site_data.remove_fixed_positioning === false                                  ) site_data.remove_fixed_positioning        = {enable: false}
    if      (!site_data.remove_fixed_positioning.hasOwnProperty('enable'                   )) site_data.remove_fixed_positioning.enable = true




    //console.log(76, site_data.append_loaded_date)
  }
  //console.log(36, sites_data_by_prefix)
  //window.sites_data = sites_data

  function in_iframe () {
    try {
      return window.self !== window.top
    } catch (e) {
      return true
    }
  }


  function direct_text_content (element) {
    // Return the text from this element only, not including any text from child elements
    let text = ''
    for (const child_node of element.childNodes) {
      if (child_node.nodeType === 3) text += child_node.textContent
    }
    return text
  }

  function selector_for_elements_with_a_class_that_starts_with (targets) {
    const logging = false
    const targets_split = targets.split(/\s+/)
    let target, pseudo_element
    let result = ''
    for (const target_with_possible_pseudo_element of targets_split) {
      if (target_with_possible_pseudo_element [0] === '.') throw new Error('selector_for_elements_with_a_class_that_starts_with: target "' + target_with_possible_pseudo_element + '" begins with a dot')
      const colon_index = target_with_possible_pseudo_element.indexOf(':')
      if (colon_index === 0) {
        throw new Error('selector_for_elements_with_a_class_that_starts_with: target "' + target_with_possible_pseudo_element + '" begins with a colon')
      } else if (colon_index === -1) {
        target         = target_with_possible_pseudo_element
        pseudo_element = ''
      } else {
        target         = target_with_possible_pseudo_element.substr(0, colon_index)
        pseudo_element = target_with_possible_pseudo_element.substr(colon_index)
      }
      if (result) result += ', '
      result +=  '[class^="' + target + '"]' + pseudo_element + ', [class*=" ' + target + '"]' + pseudo_element
      if (logging) console.log(31, target, result)
    }
    return result
  }


  const dateFormat = (function () {
    const token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g
    const timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g
    const timezoneClip = /[^-+\dA-Z]/g
    const pad = function (val, len) {
      val = String(val)
      len = len || 2
      while (val.length < len) val = '0' + val
      return val
    }

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
      const dF = dateFormat

      // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
      if (arguments.length === 1 && Object.prototype.toString.call(date) === '[object String]' && !/\d/.test(date)) {
        mask = date
        date = undefined
      }

      // Passing date through Date applies Date.parse, if necessary
      date = date ? new Date(date) : new Date()
      if (isNaN(date)) throw SyntaxError('invalid date')

      mask = String(dF.masks[mask] || mask || dF.masks['default'])

      // Allow setting the utc argument via the mask
      if (mask.slice(0, 4) === 'UTC:') {
        mask = mask.slice(4)
        utc = true
      }

      const _ = utc ? 'getUTC' : 'get'
      const d = date[_ + 'Date']()
      const D = date[_ + 'Day']()
      const m = date[_ + 'Month']()
      const y = date[_ + 'FullYear']()
      const H = date[_ + 'Hours']()
      const M = date[_ + 'Minutes']()
      const s = date[_ + 'Seconds']()
      const L = date[_ + 'Milliseconds']()
      const o = utc ? 0 : date.getTimezoneOffset()
      const flags = {
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
        t:    H < 12 ? 'a'  : 'p',
        tt:   H < 12 ? 'am' : 'pm',
        T:    H < 12 ? 'A'  : 'P',
        TT:   H < 12 ? 'AM' : 'PM',
        Z:    utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
        o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
      }
      return mask.replace(token, function ($0) {
        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1)
      })
    }
  })()

  // Some common format strings
  dateFormat.masks = {
    'default':      'ddd mmm dd yyyy HH:MM:ss',
    shortDate:      'm/d/yy',
    mediumDate:     'mmm d, yyyy',
    longDate:       'mmmm d, yyyy',
    fullDate:       'dddd, mmmm d, yyyy',
    shortTime:      'h:MM TT',
    mediumTime:     'h:MM:ss TT',
    longTime:       'h:MM:ss TT Z',
    isoDate:        'yyyy-mm-dd',
    isoTime:        'HH:MM:ss',
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
  }

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  }

  // For convenience...
  /*
  Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc)
  }
  */

  function convUrlToAbs (baseURI, url_text) {
    const url = new URL(url_text, baseURI)
    return url.toString()
  }


  /* eslint-disable yoda */
  function isutf8 (bytes) {
    var i = 0
    while (i < bytes.length) {
      if (bytes[i] === 0x09 || bytes[i] === 0x0A || bytes[i] === 0x0D || (0x20 <= bytes[i] && bytes[i] <= 0x7E)) { // ASCII
        i += 1
        continue
      }
      if ((0xC2 <= bytes[i] && bytes[i] <= 0xDF) && (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF)) { // non-overlong 2-byte
        i += 2
        continue
      }
      if (
        (bytes[i] === 0xE0 && (0xA0 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) && (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)) || // excluding overlongs
        (((0xE1 <= bytes[i] && bytes[i] <= 0xEC) || bytes[i] === 0xEE || bytes[i] === 0xEF) && (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) && (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)) || // straight 3-byte
        (bytes[i] === 0xED && (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x9F) && (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)) // excluding surrogates
      ) {
        i += 3
        continue
      }
      if (
        (bytes[i] === 0xF0 && (0x90 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) && (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) && (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)) || // planes 1-3
        ((0xF1 <= bytes[i] && bytes[i] <= 0xF3) && (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) && (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) && (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)) || // planes 4-15
        (bytes[i] === 0xF4 && (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x8F) && (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) && (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)) // plane 16
      ) {
        i += 4
        continue
      }
      return false
    }
    return true
  }
  /* eslint-enable yoda */


  function makeRequest (url) {
    var result = {}
    result.url = url
    console.log(221, 10, url)
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest()
      xhr.responseType = 'arraybuffer'
      xhr.open('get', url)
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          var decoder
          if (isutf8(new Uint8Array(xhr.response))) {
            decoder = new TextDecoder('UTF-8')
          } else {
            decoder = new TextDecoder('gbk')
          }
          result.cssraw = decoder.decode(xhr.response).replace(/url\((['"]?)(.*?)\1\)/g, function (a, p1,p2) {
            return 'url(' + convUrlToAbs(url, p2) + ')'
          })
          result.status = this.status
          result.statusText = this.statusText
          resolve(result)
          console.log(221, 50, url)
        } else {
          result.cssraw = ''
          result.status = this.status
          result.statusText = this.statusText
          resolve(result)
        }
      }
      xhr.onerror = function () {
        result.cssraw = ''
        result.status = this.status
        result.statusText = this.statusText
        resolve(result)
      }
      xhr.send()
    })
  }



  function add_getMatchedCSSRules_to_window () {

    // polyfill window.getMatchedCSSRules() in FireFox 6+
    var ELEMENT_RE = /[\w-]+/g
    var ID_RE = /#[\w-]+/g
    var CLASS_RE = /\.[\w-]+/g
    var ATTR_RE = /\[[^\]]+\]/g
    // :not() pseudo-class does not add to specificity, but its content does as if it was outside it
    /* eslint-disable no-useless-escape */
    var PSEUDO_CLASSES_RE = /\:(?!not)[\w-]+(\(.*\))?/g
    var PSEUDO_ELEMENTS_RE = /\:\:?(after|before|first-letter|first-line|selection)/
    /* eslint-enable no-useless-escape */

    // handles extraction of `cssRules` as an `Array` from a stylesheet or something that behaves the same
    function getSheetRules (stylesheet) {
      var sheet_media = stylesheet.media && stylesheet.media.mediaText
      // if this sheet is disabled skip it
      if (stylesheet.disabled) return []
      // if this sheet's media is specified and doesn't match the viewport then skip it
      if (sheet_media && sheet_media.length && !window.matchMedia(sheet_media).matches) return []
      // get the style rules of this sheet
      //console.log(294, stylesheet)
      const raw_rules = stylesheet.cssRules
      if (typeof raw_rules === 'undefined' || raw_rules === null) return []
      return Array.from(stylesheet.cssRules)
    }

    function _find (string, re) {
      var matches = string.match(re)
      return matches ? matches.length : 0
    }

    // calculates the specificity of a given `selector`
    function calculateScore (selector) {
      var score = [0,0,0]
      var parts = selector.split(' ')
      var part
      var match
      //TODO: clean the ':not' part since the last ELEMENT_RE will pick it up
      while (true) {
        part = parts.shift()
        if (typeof part !== 'string') break
        // find all pseudo-elements
        match = _find(part, PSEUDO_ELEMENTS_RE)
        score[2] += match
        // and remove them
        // match && (part = part.replace(PSEUDO_ELEMENTS_RE, ''))
        if (match) part = part.replace(PSEUDO_ELEMENTS_RE, '')
        // find all pseudo-classes
        match = _find(part, PSEUDO_CLASSES_RE)
        score[1] += match
        // and remove them
        //match && (part = part.replace(PSEUDO_CLASSES_RE, ''))
        if (match) part = part.replace(PSEUDO_CLASSES_RE, '')
        // find all attributes
        match = _find(part, ATTR_RE)
        score[1] += match
        // and remove them
        //match && (part = part.replace(ATTR_RE, ''))
        if (match) part = part.replace(ATTR_RE, '')
        // find all IDs
        match = _find(part, ID_RE)
        score[0] += match
        // and remove them
        //match && (part = part.replace(ID_RE, ''))
        if (match) part = part.replace(ID_RE, '')
        // find all classes
        match = _find(part, CLASS_RE)
        score[1] += match
        // and remove them
        //match && (part = part.replace(CLASS_RE, ''))
        if (match) part = part.replace(CLASS_RE, '')
        // find all elements
        score[2] += _find(part, ELEMENT_RE)
      }
      return parseInt(score.join(''), 10)
    }

    // returns the heights possible specificity score an element can get from a give rule's selectorText
    function getSpecificityScore (element, selector_text) {
      var selectors = selector_text.split(',')
      var selector
      var score
      var result = 0
      while (true) {
        selector = selectors.shift()
        if (!selector) break
        if (matchesSelector(element, selector)) {
          score = calculateScore(selector)
          result = score > result ? score : result
        }
      }
      return result
    }

    function sortBySpecificity (element, rules) {
      // comparing function that sorts CSSStyleRules according to specificity of their `selectorText`
      function compareSpecificity (a, b) {
        return getSpecificityScore(element, b.selectorText) - getSpecificityScore(element, a.selectorText)
      }

      return rules.sort(compareSpecificity)
    }

    // Find correct matchesSelector impl
    function matchesSelector (element, selector) {
      let result
      if      (element.      matchesSelector) result = element.      matchesSelector(selector)
      else if (element.   mozMatchesSelector) result = element.   mozMatchesSelector(selector)
      else if (element.webkitMatchesSelector) result = element.webkitMatchesSelector(selector)
      else if (element.     oMatchesSelector) result = element.     oMatchesSelector(selector)
      else if (element.    msMatchesSelector) result = element.    msMatchesSelector(selector)
      else throw new Error('no matcher function found')
      console.log(380, 10, element, selector, result)
    }

    //TODO: not supporting 2nd argument for selecting pseudo elements
    //TODO: not supporting 3rd argument for checking author style sheets only

    function ajax_data_handler (jqXHR, textStatus) {
      console.log(380, 44, jqXHR, textStatus)
    }

    wf_getMatchedCSSRules = element => {
      var style_sheets
      var sheet //sheet_media
      var rules
      var rule
      var result = []
      // get stylesheets and convert to a regular Array
      style_sheets = Array.from(window.document.styleSheets)
      console.log(380, 20, element, style_sheets)

      // assuming the browser hands us stylesheets in order of appearance
      // we iterate them from the beginning to follow proper cascade order
      while (true) {
        sheet = style_sheets.shift()
        console.log(380, 30, sheet)
        if (!sheet) break
        // get the style rules of this sheet
        rules = getSheetRules(sheet)
        if (rules.length) {
          console.log(380, 40, rules)
        } else {
          console.log(380, 45, rules)
          jQuery.ajax(sheet.href, {complete: ajax_data_handler, type: 'GET'})
        }
        while (true) {                   // loop the rules in order of appearance
          rule = rules.shift()
          console.log(380, 50, rule)
          if (!rule) break
          // if this is an @import rule
          const rule_sheet = rule.styleSheet
          console.log(380, 55)
          if (rule_sheet) {
            console.log(380, 60, rule_sheet)
            rules = getSheetRules(rule_sheet).concat(rules)            // insert the imported stylesheet's rules at the beginning of this stylesheet's rules
            continue                                                   // and skip this rule
          } else if (rule.media) {                           // if there's no stylesheet attribute BUT there IS a media attribute it's a media rule
            console.log(380, 70, rule.media)
            rules = getSheetRules(rule).concat(rules)            // insert the contained rules of this media rule to the beginning of this stylesheet's rules
            continue                                          // and skip it
          }
          console.log(380, 75)
          const rule_selectorText = rule.selectorText
          if (rule_selectorText && matchesSelector(element, rule_selectorText)) { // check if this element matches this rule's selector
            result.push(rule) // push the rule to the results set
          }
        }
      }
      // sort according to specificity
      return sortBySpecificity(element, result)
    }
    document.wf_getMatchedCSSRules = wf_getMatchedCSSRules
    window.wf_getMatchedCSSRules = wf_getMatchedCSSRules
    console.log(380, 160)
    getMatchedCSSRules = window.getMatchedCSSRules
    if (typeof getMatchedCSSRules === 'function') {
      console.log(380, 170)
      window.native_getMatchedCSSRules = getMatchedCSSRules
      document.native_getMatchedCSSRules = getMatchedCSSRules
    } else {
      console.log(380, 180)
      getMatchedCSSRules = window.wf_getMatchedCSSRules
      window.getMatchedCSSRules = getMatchedCSSRules
    }
    document.getMatchedCSSRules = getMatchedCSSRules
    console.log(380, 190)
  }

  add_getMatchedCSSRules_to_window()

  function dark_theme (aggressiveness_level) { //, target) {
    //body.css({'background-color': '' + theme_background_color + ' !important; color: ' + theme_foreground_color + ' !important'})
    console.log(847, 'dark_theme_' + aggressiveness_level)
    $body.addClass('dark_theme dark_theme_' + aggressiveness_level)
    if (!aggressiveness_level) return
    if (aggressiveness_level > 1) document.styleSheets[0].addRule('*', 'background-color: ' + theme_background_color + ' !important; color: ' + theme_foreground_color + ' !important')
    //raw_site_css += target + '{' + theme_background_rule + theme_foreground_rule + '}'
    raw_site_css += '.dark_theme {' + theme_background_rule + theme_foreground_rule + '} ::-webkit-scrollbar {height: 2px; width: 2px} ::-webkit-scrollbar-track {background:' + theme_background_color + '} ::-webkit-scrollbar-thumb {background: #f00} '
  }

  function std_link_colors (site_data) {
    /*
    raw_site_css += ' a {text-decoration: none}' +
      ' a:link   , a:link    h1, a:link    h2, a:link    h3, a:link    h4, a:link    h5, a:link    div, a:link    p, a:link    span, a:link    em {color:' +         theme_link_foreground_color + '}' +
      ' a:visited, a:visited h1, a:visited h2, a:visited h3, a:visited h4, a:visited h5, a:visited div, a:visited p, a:visited span, a:visited em {color:' + theme_link_visited_foreground_color + '}'
    */
    const settings                       = site_data.std_link_colors
    const extra_sub_element_selectors    = settings.extra_sub_element_selectors
    const link_selector                  = 'a:link'
    const visited_selector               = 'a:visited'
    let sub_element_tags_str             = 'h1 h2 h3 h4 h5 div p span em'
    let link_and_sub_element_selector    =    link_selector
    let visited_and_sub_element_selector = visited_selector
    if (extra_sub_element_selectors) sub_element_tags_str += ' ' + extra_sub_element_selectors
    const sub_element_tags = sub_element_tags_str.split(/\s+/)
    console.log(387, 30, sub_element_tags_str, sub_element_tags)
    for (const sub_element_tag of sub_element_tags) {
      link_and_sub_element_selector    += ',' +    link_selector + ' ' + sub_element_tag
      visited_and_sub_element_selector += ',' + visited_selector + ' ' + sub_element_tag
      console.log(387, 40, link_and_sub_element_selector)
    }
    link_and_sub_element_selector    += '{color:' +         theme_link_foreground_color + '}'
    visited_and_sub_element_selector += '{color:' + theme_link_visited_foreground_color + '}'
    const new_css = ' a {text-decoration: none}' + link_and_sub_element_selector + '{color:' + theme_link_foreground_color + '}' + visited_and_sub_element_selector + '{color:' + theme_link_visited_foreground_color + '}'
    console.log(387, 60, new_css)
    raw_site_css += new_css
    console.log(387, 70, raw_site_css)
  }

  function regularize_links () {
    const logging = false
    let url
    if (logging) console.log(394, 10)
    for (const anchor of jQuery('a')) {
      if (logging) console.log(394, 20, anchor)
      const old_href = anchor.href
      if (logging) console.log(394, 30, old_href)
      if (!old_href) continue
      try {
        if (logging) console.log(394, 40)
        url = new URL(old_href)
      } catch (ex) {
        if (logging) console.log(394, 50)
        if (ex instanceof TypeError) {
          if (logging) console.log(394, 60)
          continue
        } else {
          if (logging) console.log(394, 70)
          throw ex
        }
      }
      if (logging) console.log(394, 80)
      //if (typeof href === 'undefined') return
      const origin = anchor.origin
      const site_data = sites_data_by_prefix [origin]
      if (logging) console.log(394, 85, origin, site_data)
      if (!site_data) continue
      const unwanted_query_fields_array = site_data.unwanted_query_fields_array
      if (logging) console.log(394, 87, unwanted_query_fields_array)
      if (!unwanted_query_fields_array) continue
      //const unwanted_query_fields_array_length = unwanted_query_fields_array.length
      const query_string_index = old_href.indexOf('?')
      if (logging) console.log(394, 89, query_string_index)
      if (query_string_index !== -1) {
        if (logging) console.log('394, 90')
        //let query_string = old_href.substring(query_string_index); // the query string without the '?' that delimits it
        let query_string = url.search
        //let new_href = old_href.substring(0, query_string_index); // the url without the query string or the '?' that delimits it
        const query_params = url.searchParams
        if (logging) console.log(394, 100, query_params.toString())
        for (const field of unwanted_query_fields_array) {
          query_params.delete(field)
          if (logging) console.log(394, 110, field, query_params.toString())
          // BUG: would be nice to break if query_params is empty
        }
        if (logging) console.log(394, 120, query_params.toString())
        query_string = query_params.toString()
        if (logging) console.log(394, 130, query_string)
        //if (query_string.length) new_href += '?' + query_string
        //anchor.href = new_href
        url.search = query_string
        anchor.href = url.href
      }
      if (logging) console.log(394, 140, anchor.href)
    }
  }

  function count_words (site_data) {

    const words_count_name            = program_name +  '_words_count'
    const graf_words_count_name       = words_count_name + '_graf'
    let total_words_count             = 0
    const total_words_count_name      = words_count_name + '_total'
    const html_prefix1                = '<span class ="'
    const html_prefix                 = html_prefix1 + words_count_name + ' '
    const html_nbsp                   = html_prefix1 + 'nbsp">&nbsp;</span>'
    const html_infix                  = html_nbsp + 'words'
    const uncounted_html_infix        = html_nbsp + 'uncounted' + html_infix
    const html_suffix                 = '</span>'
    let html_graf_prefix
    const settings                    = site_data.count_words
    const nbsp_size                   = settings.nbsp_size
    const append_selector             = settings.append
    let prepend_selector              = settings.prepend
    const raw_subject                 = settings.subject
    let subject_selectors
    const show_graf_counts            = settings.grafs
    let graf_index                    = 1
    let grafs_by_selector             = {}
    let total_words_count_by_selector = []
    let all_grafs                     = jQuery('')
    let $append_elements
    let $prepend_elements


    if (append_selector) $append_elements = jQuery(append_selector)
    if (prepend_selector) $prepend_elements = jQuery(prepend_selector)
    if (       typeof raw_subject     === 'string') {
      subject_selectors = [raw_subject]
    } else if (typeof raw_subject [0] === 'string') {
      subject_selectors =  raw_subject
    } else {
      throw new Error('unrecognized subject type: ' + raw_subject)
    }
    jQuery('.' + words_count_name).remove()

    for (const subject_selector of subject_selectors) {
      const $subject_elements      = jQuery(subject_selector)
      console.log(192, 10, subject_selector, $subject_elements)
      let grafs = jQuery('')
      total_words_count_by_selector.push(0)
      let graf_containers = []
      for (const element of $subject_elements) {
        if (element.tagName === 'P' || element.tagName === 'LI') {
          grafs = grafs.add(element)
          all_grafs = all_grafs.add(element)
        } else {
          graf_containers.push(element)
        }
      }
      console.log(192, 20, JSON.stringify(Array.from(grafs)), grafs.size)
      const contained_grafs = jQuery(graf_containers).find('p, li')
      console.log(192, 30, contained_grafs, contained_grafs.length)
      for (const contained_graf of contained_grafs) {
        console.log(192, 40, contained_graf, grafs)
        grafs = grafs.add(contained_graf)
        console.log(192, 50, grafs)
        all_grafs = all_grafs.add(contained_graf)
      }
      //grafs = grafs.concat(contained_grafs)
      console.log(192, 60, grafs)
      //BUG: set arithmetic: here we would add all the elements of grafs to all_grafs -- if the language had a built-in way to do so. Since it doesn't, we have maintained all_grafs as we went along.
      grafs_by_selector [subject_selector] = grafs
    }
    console.log(192, 70, grafs_by_selector)
    for (const graf of all_grafs) {
      let $graf = jQuery(graf)
      let graf_text = $graf.text()
      if (graf_text.length) {
        const graf_text_split = graf_text.split(/\s+/)
        console.log(192, 73, graf_text, graf_text_split)
        let graf_words_count = 0
        for (const word of graf_text_split) {
          console.log(192, 75, word)
          if (word) {
            console.log(192, 76)
            graf_words_count++
          }
        }
        console.log(192, 78, graf_words_count)
        $graf.data(graf_words_count_name, graf_words_count)
        total_words_count += graf_words_count
        for (const [subject_selector_index, subject_selector] of subject_selectors.entries()) {
          console.log(192, 80, graf, subject_selector, grafs_by_selector [subject_selector])
          if (jQuery.inArray(graf, grafs_by_selector [subject_selector]) !== -1) {
            console.log(192, 90)
            total_words_count_by_selector [subject_selector_index] += graf_words_count
          }
        }
        graf_index++
      }
    }
    console.log(192, 110, total_words_count, total_words_count_by_selector)
    let chosen_subject_selector_index, chosen_subject_selector, chosen_words_count
    for ([chosen_subject_selector_index, chosen_subject_selector] of subject_selectors.entries()) {
      chosen_words_count = total_words_count_by_selector [chosen_subject_selector_index]
      if (chosen_words_count) break
    }
    let chosen_grafs = grafs_by_selector [chosen_subject_selector]
    let chosen_words_count2 = 0
    console.log(192, 120, grafs_by_selector, chosen_grafs)
    if (show_graf_counts) {
      const verbose = show_graf_counts > 1
      html_graf_prefix = html_prefix + graf_words_count_name + '">' + settings.graf_prefix
      let graf_index = 1
      for (const graf of all_grafs) {
        let $graf = jQuery(graf)
        let new_html = html_graf_prefix
        console.log(192, 130, new_html)
        const is_chosen = jQuery.inArray(graf, chosen_grafs) !== -1
        const graf_words_count = $graf.data(graf_words_count_name)
        if (is_chosen) {
          if (verbose) {
            if (typeof graf_words_count === 'undefined') {
              new_html += '&para;empty'
            } else {
              new_html += '&para' + (graf_index) + ':&nbsp;'
              graf_index++
            }
          }
        }
        console.log(192, 140, new_html)
        if (typeof graf_words_count !== 'undefined') {
          if (is_chosen) {
            new_html += graf_words_count + html_infix
            console.log(192, 150, graf_words_count, new_html)
            chosen_words_count2 += graf_words_count
            if (verbose) new_html += ' (' + chosen_words_count2 + ' total)'
          } else {
            if (verbose) new_html += graf_words_count + uncounted_html_infix
          }
          console.log(192, 160, chosen_words_count2, new_html)
        }
        new_html += html_suffix
        console.log(192, 170, new_html)
        $graf.append(new_html)
      }
      console.log(192, 175, chosen_words_count, chosen_words_count2)
      if (chosen_words_count2 !== chosen_words_count) throw new Error('chosen_words_count=' + chosen_words_count + ', chosen_words_count2=' + chosen_words_count2)
    }
    const output = html_prefix + total_words_count_name + '">' + settings.total_prefix + chosen_words_count + html_infix + html_suffix
    console.log(192, 176, output, append_selector)
    if (append_selector) {
      console.log(192, 177, $append_elements)
      for (const append_element of $append_elements) {
        console.log(192, 180, append_element, append_element.className, output)
        jQuery(append_element).append(output)
      }
      console.log(192, 190, append_selector, $append_elements)
    } else if (!prepend_selector) {
      prepend_selector = 'body'
      $prepend_elements = jQuery(prepend_selector)
    }
    if (prepend_selector) {
      $prepend_elements.prepend(output)
      console.log(192, 200, prepend_selector, $prepend_elements)
    }
    console.log(192, 220, nbsp_size)
    if (show_graf_counts) raw_site_css += '.' +  graf_words_count_name + ' {color: #333}'
    raw_site_css                       += '.' + total_words_count_name + ' {color: #880} .' + total_words_count_name + '>.nbsp {font-size: ' + nbsp_size + '}'
  }

  function append_loaded_date (e) {
    let html = ''
    //html += location_href + '<br>'
    html += 'Loaded ' + dateFormat(new Date(), 'dddd, mmmm dS, yyyy @ h:MM:ss TT') + '<br><br>'
    e.append(html)
  }

  function remove_fixed_positioning (site_data) {
    const settings = site_data.remove_fixed_positioning
    console.log('remove_fixed_positioning: called with settings: ' + settings)
    if (!settings.enable) return
    for (const element of jQuery('*').not($main_dialog)) {
      const $element = jQuery(element)
      const old_position = $element.css('position')
      if (old_position === 'fixed' || old_position === 'sticky') {
        //console.log('remove_fixed_positioning:', element)
        $element.css({'position': 'absolute'})
      }
    }
  }

  //main code starts here

  //console.log(91)
  function process_page () {

    for (const test_site_data of sites_data) {
      const test_site_origin = test_site_data.origin
      console.log(225, 3, test_site_data.name, location_origin, test_site_origin)
      if (!test_site_origin) continue
      if (test_site_origin.endsWith('/')) console.log('wmaster: warning: origin "' + test_site_origin + '" ends in a slash')
      if (test_site_origin && location_origin === test_site_origin) {
        if (location_href === location_origin + '/') {
          site_data = test_site_data
          page_level = 0
          break
        }
      }
      //console.log(225, 5, site_data)
      if (test_site_data.alternate_homepages) {
  /*
        alternates = test_site_data.alternate_homepages
        alternates_length = alternates.length
        for (prefix_index = 0; prefix_index < alternates_length; prefix_index++) {
          alternate = alternates [prefix_index]
  */
        for (const alternate of test_site_data.alternate_homepages) {

          //console.log(92.5, location_href, alternate)
          if (location_href === alternate) {
            site_data = test_site_data
            page_level = 0
            //console.log(92.6)
            break
          }
        }
        if (site_data) break
      }
      //console.log(93)
      if (test_site_data.origin && location_origin === test_site_data.origin) {
        site_data = test_site_data
        page_level = 2
        break
      }
      if (test_site_data.alternate_prefixes) {
  /*
        alternates = test_site_data.alternate_prefixes
        alternates_length = alternates.length
        for (prefix_index = 0; prefix_index < alternates_length; prefix_index++) {
          alternate = alternates [prefix_index]
  */
        for (const alternate of test_site_data.alternate_prefixes) {

          if (location_href.startsWith(alternate) && location_href !== alternate) {
            site_data = test_site_data
            page_level = 0
            break
          }
        }
        if (site_data) break
      }
      //console.log(94)
      if (test_site_data.alternate_origins) {
  /*
        alternates = test_site_data.alternate_origins
        alternates_length = alternates.length
        for (prefix_index = 0; prefix_index < alternates_length; prefix_index++) {
          alternate = alternates [prefix_index]
  */
        for (const alternate of test_site_data.alternate_origins) {

          //console.log(81, alternate, location_origin, location_href)
          if (location_href.startsWith(alternate)) {
            site_data = test_site_data
            if (location_href === alternate) {
              page_level = 1
            } else {
              page_level = 2
            }
            break
          }
        }
        if (site_data) break
      }
      //console.log(95)
    }
    if (site_data) {
      console.log('wmaster: ' + site_data.name + ' detected')
      if (site_data.customize) site_data.customize()
      console.log(231, hide_selector, location, site_data.name)
      //console.log(48.1, theme_foreground_selector)
      if (site_data.css) raw_site_css += site_data.css
      std_link_colors(site_data)
      console.log(44, site_data)
      regularize_links()
      const unwanted_classes = site_data.unwanted_classes
      //console.log(14, site_data)
      if (unwanted_classes) {
        const unwanted_classes_split = unwanted_classes.split(/\s+/)
        //jQuery.each(unwanted_classes_split, function(unwanted_class_index, unwanted_class) {
        for (const unwanted_class of unwanted_classes_split) {
          if (!unwanted_class.length) continue
          //console.log(15, jQuery('.' + unwanted_class))
          jQuery('.' + unwanted_class).removeClass(unwanted_class)
        }
      }
      remove_fixed_positioning(site_data)
      if (site_data.append_loaded_date) append_loaded_date(jQuery(site_data.append_loaded_date))
      console.log(253, theme_foreground_selector)
      if   (site_data.         theme_selector           ) theme_selector           .push(site_data.         theme_selector           )
      if   (site_data.         theme_background_selector) theme_background_selector.push(site_data.         theme_background_selector)
      if   (site_data.         theme_foreground_selector) theme_foreground_selector.push(site_data.         theme_foreground_selector)
      if   (site_data.         hide_selector            )             hide_selector.push(site_data.         hide_selector            )
      if   (site_data.         css                      ) raw_site_css += ' ' +          site_data.         css
      if (page_level === 0) {
        if (site_data.homepage_theme_selector           ) theme_selector           .push(site_data.homepage_theme_selector           )
        if (site_data.homepage_theme_background_selector) theme_background_selector.push(site_data.homepage_theme_background_selector)
        if (site_data.homepage_theme_foreground_selector) theme_foreground_selector.push(site_data.homepage_theme_foreground_selector)
        if (site_data.homepage_hide_selector            )             hide_selector.push(site_data.homepage_hide_selector            )
        if (site_data.homepage_css                      ) raw_site_css += ' ' +          site_data.homepage_css
      } else if (page_level === 2) {
        if (site_data. article_theme_selector           ) theme_selector           .push(site_data. article_theme_selector           )
        if (site_data. article_theme_background_selector) theme_background_selector.push(site_data. article_theme_background_selector)
        if (site_data. article_theme_foreground_selector) theme_foreground_selector.push(site_data. article_theme_foreground_selector)
        if (site_data. article_hide_selector            )             hide_selector.push(site_data. article_hide_selector            )
        if (site_data. article_css                      ) raw_site_css += ' ' +          site_data. article_css
        count_words(site_data)
      }
      //console.log(233, hide_selector, page_level)
      //console.log(243, raw_site_css)
      //console.log(46, site_data.article_hide_selector)
      console.log(846, 5, page_level, site_data.article_theme_background_selector, theme_background_selector)
      console.log(846, 10, site_data.dark_theme)
      dark_theme(site_data.dark_theme)
      console.log(846, 20, theme_foreground_selector)
      if (hide_selector            .length) raw_site_css += hide_selector                       + '{display: none}'
      if ($body.hasClass('dark_theme_1') || $body.hasClass('dark_theme_2')) {
        if (theme_selector           .length) raw_site_css += theme_selector           .join(',') + '{' + theme_background_rule + theme_foreground_rule + '}'
        if (theme_background_selector.length) raw_site_css += theme_background_selector.join(',') + '{' + theme_background_rule + '}'
        if (theme_foreground_selector.length) raw_site_css += theme_foreground_selector.join(',') + '{' + theme_foreground_rule + '}'
      }
      console.log(846, 30, raw_site_css, cooked_site_css)
      const raw_site_css_split = raw_site_css.split('}')
      console.log(846, 60, raw_site_css_split)
      for (const rule of raw_site_css_split) {
        console.log(846, 70, rule)
        if (!rule) break
        const rule_split = rule.split('{')
        const declarations = rule_split [1]
        const declarations_split = declarations.split(';')
        console.log(846, 80, declarations, declarations_split)
        let rule_text = rule_split [0] + ' {'
        let declaration_index = 0
        for (const declaration of declarations_split) {
          console.log(846, 90, declaration_index, declaration)
          if (declaration) {
            if (declaration_index) rule_text += '; '
            rule_text += jQuery.trim(declaration) + ' !important'
          }
          declaration_index++
        }
        rule_text += '}'
        console.log(846, 100, rule_text)
        cooked_site_css += ' ' + rule_text
      }
      const stylesheet = document.createElement('style')
      stylesheet.innerHTML = cooked_site_css
      console.log(846, 110, cooked_site_css)
      document.body.appendChild(stylesheet)
      window.sss = stylesheet
      window.f = jQuery('textarea')
    }
  }


  function open_main_dialog () {

    console.log(475, 10, document.hasFocus())
    if (!main_dialog_is_open) {
      console.log(475, 15)
      $main_dialog.show()
      console.log(475, 20, document.hasFocus())
      main_dialog_is_open = true
    }
    console.log(475, 30, document.hasFocus())
    $main_dialog_cli_textarea.focus()
    console.log(475, 40, document.hasFocus())
  }


  function close_main_dialog () {

    console.log(475, 43, document.hasFocus())
    $main_dialog.hide()
    console.log(475, 45, document.hasFocus())
    //$main_dialog.blur()
    console.log(475, 47, document.hasFocus())
    $body.click() // BUG: is there a better way to get focus back to where is was when the page was first loaded, so that the arrow keys scroll the page?
    console.log(475, 48, document.hasFocus())

    // Remove focus from any focused element
    if (document.activeElement) {
      document.activeElement.blur()
      console.log(475, 49, document.hasFocus())
    }
    main_dialog_is_open = false
  }


  if (!in_iframe()) {
    process_page()

    document.onkeydown = event1 => {
      var event = event1 || window.event // for IE to cover IEs window object
      if (event.which === 192) { // grave accent -- open main dialog
        open_main_dialog()
        console.log(475, 50)
        console.log(475, 55)
        //console.log('wmaster: reprocessing page')
        //process_page()
        return false
      } else if (event.which === 87) { // 'w'
        if (wasd_scrolling) {
          document.body.scrollTop -= window.innerHeight / 3
        }
      } else if (event.which === 83) { // 's'
        if (wasd_scrolling) {
          document.body.scrollTop += window.innerHeight / 3
        }
      }
      //alert(event.which)
    }
    $main_dialog_cli.on('keydown', event => {
      console.log(475, 60)
      if (event.which === 13) {
        console.log(475, 65)
      } else if (event.which === 27) {
        console.log(475, 70)
        close_main_dialog()
      }
    })
  }
  //jQuery('#anti-white-flash-curtain').remove()

  jQuery.noConflict()
})
