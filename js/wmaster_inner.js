494//debug// ==UserScript==
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

/* eslint-disable camelcase, no-multiple-empty-lines, padded-blocks, no-multi-spaces, no-whitespace-before-property, spaced-comment, key-spacing, comma-spacing, comma-dangle, space-in-parens, standard/computed-property-even-spacing */

'use strict'
//alert(36)
console.log('wmaster_inner: running')
//window.jQuery = jQuery
//console.log('wmaster_inner: ', window.jQuery)
const wasd_scrolling                          = true
const program_name                            = 'wmaster'
//const is_node                                 = -(typeof process !== 'undefined' && (process.title === 'node' || process.title.endsWith('/node')))
let is_node_let
if (typeof process === 'undefined') {
  is_node_let = false
} else {
  if (process.hasOwnProperty('title')) {
    //console.log(54, process.title, process.argv)
    if (process.title === 'node' || process.title.endsWith('/node')) {
      is_node_let = true
    } else {
      //throw new Error('title: "' + process.title + '"')
      is_node_let = true // process.title is sometimes corrupt with long command lines
    }
  } else {
    is_node_let = false
  }
}
const is_node                                 = is_node_let
console.log(51, is_node)
let debug_let
if (is_node) {
  debug_let                                   = require('debug')(program_name)
} else {
  debug_let                                   = console.log.bind(console)
}
const debug                                   = debug_let
let $body_let
if (is_node) {
  debug(56, process.title)
} else {
  debug(57)
  $body_let                                   = jQuery('body')
  window.$anchors                             = jQuery('a')
}
const $body                                   = $body_let
//const theme_offlink_background_color          = '#a00'
const theme_autolink_foreground_color         = '#00c080'
const theme_autolink_visited_foreground_color = '#b9c740'
const theme_background_color                  = '#000'
const theme_foreground_color                  = '#0f0'
const theme_link_foreground_color             = '#00f'
const theme_link_visited_foreground_color     = 'purple' // #a0a
const theme_background_rule                   = 'background: ' + theme_background_color + '; background-color: ' + theme_background_color + ';'
const theme_foreground_rule                   = 'color: '      + theme_foreground_color + '; text-shadow: none;'
let location
let location_href
//let location_origin
if (!is_node) {
  location = window.location
  location_href = location.href
  //location_origin = location.origin
}
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
//debug(101, 200, location_href)
const ui_css_prefix                           = program_name   + '_ui'
const main_dialog_id                          = ui_css_prefix  + '_main'
const main_dialog_word_count_id               = main_dialog_id + '_word_count'
const main_dialog_close_id                    = main_dialog_id + '_close'
const main_dialog_cli_id                      = main_dialog_id + '_cli'
let new_html                                  = '' +
  //'<div id="' + main_dialog_id + '" style="position: fixed; top: 0; left: 0; z-index: 2147483647; background-color: yellow; display: none">' +
  `<div id="${main_dialog_id}" style="position: fixed; top: 0; left: 0; z-index: 2147483647; display: none">` +
    `<button id="${main_dialog_word_count_id}">Word count</button>` +
    `<button id="${main_dialog_close_id}">Close</button>` +
    `<div id="${main_dialog_cli_id}" class="terminal"></div>` +
  '</div>'
const main_dialog_cli_selector        = '#' + main_dialog_cli_id
const main_dialog_selector            = '#' + main_dialog_id
const main_dialog_word_count_selector = '#' + main_dialog_word_count_id
const main_dialog_close_selector      = '#' + main_dialog_close_id
let $main_dialog_word_count
let $main_dialog_close
let $main_dialog_cli
let $main_dialog
cooked_site_css += main_dialog_selector + '{position: fixed; top: 0; left: 0; z-index: 2147483647; background-color: yellow}' // + main_dialog_selector + ' * {all: unset}';// #wmaster_ui_main_cli .cmd .clipboard {color: transparent}'

//debug(101, 300, $main_dialog_close, new_html)

function direct_text_content (element) {
  // Return the text from this element only, not including any text from child elements. Takes a plain DOM element, not a Jquery collection.
  let text = ''
  let child_node
  for (child_node of element.childNodes) {
    if (child_node.nodeType === 3) text += child_node.textContent
  }
  return text
}

function selector_for_elements_with_a_class_that_starts_with (targets) {
  const targets_split = targets.split(/\s+/)
  let target, pseudo_element
  let result = ''
  let target_with_possible_pseudo_element
  for (target_with_possible_pseudo_element of targets_split) {
    if (target_with_possible_pseudo_element [0] === '.') throw new Error(`selector_for_elements_with_a_class_that_starts_with: target "${target_with_possible_pseudo_element}" begins with a dot`)
    const colon_index = target_with_possible_pseudo_element.indexOf(':')
    if (colon_index === 0) {
      throw new Error(`selector_for_elements_with_a_class_that_starts_with: target "${target_with_possible_pseudo_element}" begins with a colon`)
    } else if (colon_index === -1) {
      target         = target_with_possible_pseudo_element
      pseudo_element = ''
    } else {
      target         = target_with_possible_pseudo_element.substr(0, colon_index)
      pseudo_element = target_with_possible_pseudo_element.substr(colon_index)
    }
    if (result) result += ', '
    result +=  `[class^="${target}"]${pseudo_element}, [class*="${target}"]${pseudo_element}` // result +=  '[class^="' + target + '"]' + pseudo_element + ', [class*=" ' + target + '"]' + pseudo_element
    //debug(31, target, result)
  }
  return result
}

function selector_for_elements_with_id_that_starts_with (targets) {
  const targets_split = targets.split(/\s+/)
  let target, pseudo_element
  let result = ''
  let target_with_possible_pseudo_element
  for (target_with_possible_pseudo_element of targets_split) {
    if (target_with_possible_pseudo_element [0] === '.') throw new Error(`selector_for_elements_with_id_that_starts_with: target "${target_with_possible_pseudo_element}" begins with a dot`)
    const colon_index = target_with_possible_pseudo_element.indexOf(':')
    if (colon_index === 0) {
      throw new Error(`selector_for_elements_with_id_that_starts_with: target "${target_with_possible_pseudo_element}" begins with a colon`)
    } else if (colon_index === -1) {
      target         = target_with_possible_pseudo_element
      pseudo_element = ''
    } else {
      target         = target_with_possible_pseudo_element.substr(0, colon_index)
      pseudo_element = target_with_possible_pseudo_element.substr(colon_index)
    }
    if (result) result += ', '
    result +=  `[id^="${target}"]${pseudo_element}, [id*="${target}"]${pseudo_element}` // result +=  '[class^="' + target + '"]' + pseudo_element + ', [class*=" ' + target + '"]' + pseudo_element
    debug(31, target, result)
  }
  return result
}

/*
targets = (('nytimes', 'http://www.nytimes.com/'),
           ('nytimes_todayspaper', 'http://www.nytimes.com/pages/todayspaper/index.html'),
           ('nytimes_nyregion', 'https://www.nytimes.com/pages/nyregion/index.html'),
           ('guardian_uk', 'http://www.theguardian.com/uk'),
           ('washingtonpost', 'http://www.washingtonpost.com/'))
*/


const sites_data = [
  {
    name: 'New York Times',
    origin: 'https://www.nytimes.com',
    alternate_origins: 'https://static.nytimes.com https://cooking.nytimes.com https://douthat.blogs.nytimes.com https://krugman.blogs.nytimes.com https://kristof.blogs.nytimes.com https://well.blogs.nytimes.com https://lens.blogs.nytimes.com https://www.nytimes.com/section/magazine https://mobile.nytimes.com https://dinersjournal.blogs.nytimes.com',
    alternate_prefixes: 'file:///d/wayback/nytimes/ file:///d/wayback/nytimes_todayspaper/ file:///d/wayback/nytimes_world/ file:///d/wayback/nytimes_us/ file:///d/wayback/nytimes_arts ' +
    'file:///d/wayback/nytimes_arts_dance file:///d/wayback/nytimes_arts_design file:///d/wayback/nytimes_arts_music file:///d/wayback/nytimes_arts_television file:///d/wayback/nytimes_automobiles file:///d/wayback/nytimes_books ' +
    'file:///d/wayback/nytimes_business file:///d/wayback/nytimes_corrections file:///d/wayback/nytimes_education file:///d/wayback/nytimes_fashion file:///d/wayback/nytimes_fashion_weddings file:///d/wayback/nytimes_health ' +
    'file:///d/wayback/nytimes_jobs file:///d/wayback/nytimes_magazine file:///d/wayback/nytimes_movies file:///d/wayback/nytimes_multimedia file:///d/wayback/nytimes_nyregion file:///d/wayback/nytimes_nyregion2 ' +
    'file:///d/wayback/nytimes_obituaries file:///d/wayback/nytimes_opinion file:///d/wayback/nytimes_opinion_columnists file:///d/wayback/nytimes_opinion_contributors file:///d/wayback/nytimes_opinion_editorials ' +
    'file:///d/wayback/nytimes_opinion_letters file:///d/wayback/nytimes_opinion_sunday file:///d/wayback/nytimes_politics file:///d/wayback/nytimes_reader-center file:///d/wayback/nytimes_realestate file:///d/wayback/nytimes_science ' +
    'file:///d/wayback/nytimes_sports file:///d/wayback/nytimes_technology file:///d/wayback/nytimes_theater file:///d/wayback/nytimes_t-magazine file:///d/wayback/nytimes_todayspaper file:///d/wayback/nytimes_travel ' +
    'file:///d/wayback/nytimes_us file:///d/wayback/nytimes_world',
    count_words: {append: '.byline:last-of-type, .byline-column, .styles-bylineTimestamp--2J2fe, header time, ' + selector_for_elements_with_a_class_that_starts_with('Byline-bylineAuthor--'), prefix: ' ', subject: ['.story-body-text, .g-body', '.story-body', '#story'], grafs: 0},
    article_theme_selector: 'input, textarea, .columnGroup', // NYT dark theme
    article_theme_background_selector: '.css-f2fzwx, body, #articleBody, #articleBody:after, .bcColumn, .cColumn, .App__app, .main, .g-section, .g-graphic, .wf-unreal-interactive-graphic, .guide-content, .rad-article, .rad-story-body, .g-story, .css-f2fzwx' + selector_for_elements_with_a_class_that_starts_with('elementStyles-sectionHeader-- elementStyles-recirculation-- Card-story--'), // NYT dark theme
    article_theme_foreground_selector: 'p, .masthead .masthead-menu li, .headline, .kicker, .dateline, .story-quote, .caption, figcaption, h1, h2, h3, h4, h5, h6, .g-item.g-subhed h2, .byline, .dropcap, .g-body, .swiper-text p, .story-body-text, .story-body-text strong:first-child, .CreditedMedia__caption, .Post__byline, .Post__body, .full-art, .rad-story-body p.paragraph strong:first-child ,' + selector_for_elements_with_a_class_that_starts_with('ResponsiveMedia-captionText-- HeaderBasic-bylineTimestamp-- HeaderBasic-summary-- HeaderBasic-label-- Summary-summary-- styles-bylineTimestamp--'),
    article_css: 'main, .css-mcm29f {position: static} #gateway-content {display: none} .App__app {margin-top: 0} .story-body-text {font-family: "Times New Roman"} .caption-text {font-family: sans-serif} .story-header, .image {position: relative} ' +
      'input, textarea {background-image: none} .shell {padding-top: 0} .main {border-top: none} .nytg-chart {color: #000; background-color: #fff}' + // NYT dark theme
      selector_for_elements_with_a_class_that_starts_with('SectionBar-sectionBar--') + '{border-width: 0} ' +
      'figure.layout-vertical-full-bleed .image img {width: 47%; margin-left: 30px}' +
      'figure.layout-small-horizontal .image img {width: 98%; margin-left: 5px}' +
      'figure.layout-large-horizontal .image img {width: 47%; margin-left: 30px}' +
      'figure.layout-jumbo-horizontal, figure.layout-full-bleed-horizontal .image img {width: 87%; margin-left: 30px}' +
      'figure.layout-large-vertical .image img {width: 47%; margin-left: 30px}' +
      'figure.layout-jumbo-vertical .image img {width: 47%; margin-left: 30px}' +
      'a.autolink:link    {color:' +         theme_autolink_foreground_color + '}' +
      'a.autolink:visited {color:' + theme_autolink_visited_foreground_color + '}' +
      '.g-article-wrapper {max-width: none} img {filter: blur(0px); -webkit-filter: blur(0px)}' +
      '.g-freebird-lazy.ll-init {opacity: 1} a {text-shadow: none}',
    article_hide_selector: ('.css-1wspfld, .css-i29ckm, .css-uw59u, .css-10cldcv, .css-1r214gk, figure.sizeLarge, .expanded-dock, #c-col-editors-picks, .live-blog-above-main-content, .css-1bd8bfl, #gateway-content, #top-wrapper,  #bottom-wrapper, .css-1q1hscp, .css-13pd83m, .NYTAppHideMasthead, div[data-testid="inline-message"], div[data-testid="recirculation"],' + selector_for_elements_with_id_that_starts_with('ad-') + selector_for_elements_with_id_that_starts_with('story-ad-')),
    extra_sub_element_selectors: 'h3.story-heading',
    homepage_theme_foreground_selector: '.summary, .masthead .masthead-menu li,' + selector_for_elements_with_a_class_that_starts_with('TemplateUtils-packageName-- AssetContent-summary-- AssetMedia-meta__caption--'), // NYT dark theme
    homepage_theme_background_selector: '.css-180b3ld, .css-1q9wuj9' + selector_for_elements_with_a_class_that_starts_with('Asset-story-- TemplateUtils-topLabel--'),
    //homepage_css: 'header {background-color: #aaa}', // NYT dark theme
    homepage_css: 'figure img {width: 100%} div[data-testid="masthead-desktop-logo"] {filter: invert(70%) sepia(100%) hue-rotate(65deg) saturate(7)} div:has("#top-wrapper")',
    homepage_hide_selector: '.css-1g8bx4t, .css-1xaqcky, .css-djiuqn, .css-1q9wuj9, #masthead-placeholder, .masthead-cap-container, .masthead.theme-in-content, div.editions.tab, #nytint-hp-watching, #site-index .section-header, #markets, .all-sections-button, #mini-navigation, #WelcomeAd_optly, .css-rpp6l6, .css-wu78io, video,' + selector_for_elements_with_a_class_that_starts_with('BlockAdvert-topAd--'),
    hide_selector: '.bubble--3wfZ3, .css-1ichrj1, .css-uvu2in, .ad, div[data-testid="masthead-mini-nav"]',
    theme_selector: 'body, #masthead, .searchsubmit', // NYT dark theme
    css: '.story.theme-main .story-meta-footer {border-top: none; border-bottom: none} .wf_video_article_link:link, .wf_video_article_link:visited, .wf_video_article_link:link h3, .wf_video_article_link:visited h3 {color: #550} .icon.video:before {filter: invert(70%) sepia(100%) saturate(7)}',
    dark_theme: 1, // to turn this off, change the 1 to a 0 and comment out all other lines that are commented "NYT dark theme"
    unwanted_query_fields: 'pool pagetype fellback req_id imp_id algo mtrref action clickSource comments contentCollection contentPlacement index hp label module pgtype _r ref referringSource region rref smid smtyp src type version WT.nav WT.z_jog hF vS section surface utm_campaign utm_content utm_medium utm_source t target mcubz gwh gwt imp_id variant',
    unwanted_classes: 'theme-pinned-masthead',
    //url_to_data_filename: {year_index: 3, segments_used: 6},
    wayback: {targets: {nytimes: '/', nytimes_todayspaper: '/pages/todayspaper/index.html', nytimes_nyregion: '/pages/nyregion/index.html'}},
    customize () {
      debug(443)
      if (location_href.startsWith('https://www.nytimes.com/newsletters/')) return
      if (1) {
        li_divs = jQuery('div[data-testid="lazyimage-container"]')
        for (const li_div of li_divs) {
          const $li_div = jQuery(li_div)
          $li_div.css('height', 'auto')
          const figure = li_div.parentElement.parentElement.parentElement
          /*
          if (figure.tagName != 'FIGURE') {
            debug(444, figure)
            continue
          }
          */
          //const $figure = jQuery(figure)
          //$figure.css('width', 'auto')
          const figure_parent = figure.parentElement
          const img = jQuery('<img>')
          const image_url = figure.getAttribute('itemid')
          img.attr('src', image_url)
          img.css('margin-left', 'calc((100% - 600px) / 2)')
          //figure.remove()
          img.appendTo(figure_parent)
        }
      }
      const js_header_selector = selector_for_elements_with_a_class_that_starts_with('HeaderBasic-bylineTimestamp--')
      this.article_theme_foreground_selector += ',' + selector_for_elements_with_a_class_that_starts_with('HeaderBasic-headerBasic--')
      this.count_words.append                += ',' + js_header_selector
      //debug(11, this.article_theme_foreground_selector)
      if (location_href.indexOf('?') !== -1) alert('location_href: ' + location_href)
      if (page_level === 2) {
        jQuery('figure.video').css({'width': '30%', 'margin-left': '30px'})
        jQuery('.g-artboard' ).css({'width': '90%', 'margin-left': '30px'})
        //document.styleSheets[0].addRule('.g-artboard *, .g-graphic *, .nytg-chart *', 'background-color: transparent !important')
        //cooked_site_css += ' .interactive-graphic * {background-color: #fff !important; color: #000 !important}'
        $body.removeClass('lens-hide-titles')
        for (const anchor of jQuery('a')) {
          const href = anchor.href
          if (href.startsWith('http://www.nytimes.com/topic/') || href.startsWith('https://www.nytimes.com/topic/') || href.startsWith('http://www.nytimes.com/topics/') || href.startsWith('https://www.nytimes.com/topics/') || href.startsWith('http://topics.nytimes.com') || href.startsWith('https://topics.nytimes.com')) {
            jQuery(anchor).addClass('autolink')
          }
        }
      } else {
        const logo_element = jQuery('h2.branding') [0]
        if (logo_element) logo_element.innerHTML = '<img width="573" height="138" src="file:/home/will/public_html/green_york_times.png">'
        else console.log('warning: logo not found')
      }
      let img
      for (img of jQuery('img.g-lazy')) {
        //jQuery(img).css({'padding-top': '0'})
        img.src = img.dataset.mediaviewerSrc
      }
      for (img of jQuery('img.g-freebird-lazy')) {
        //jQuery(img).css({'padding-top': '0'})
        img.src = img.dataset.src
      }
      for (img of jQuery('img[data-superjumbosrc]')) {
        jQuery(img).css({'padding-top': '0'})
        img.src = img.dataset.superjumbosrc
      }
      for (img of jQuery('img[data-superjumbosrc]')) {
        jQuery(img).css({'padding-top': '0'})
        img.src = img.dataset.superjumbosrc
      }
      //https://static01.nyt.com/images/2018/04/14/business/00robojobs-3/merlin_136336629_e5a2821f-8264-4f87-bae7-d9b31b316b18-superJumbo.jpg?quality=75&amp;auto=webp&amp;disable=upscale
      //https://static01.nyt.com/images/2018/04/14/business/00robojobs-3/merlin_136336629_e5a2821f-8264-4f87-bae7-d9b31b316b18-articleLarge.jpg?quality=75&amp;auto=webp
      debug('debug_nyt', 10)
      for (img of jQuery('img.media-viewer-candidate')) {
        const mediaviewer_src = img.dataset.mediaviewerSrc
        debug('debug_nyt', 20, mediaviewer_src)
        if (mediaviewer_src) {
          debug('debug_nyt', 30)
          img.src = mediaviewer_src
        } else {
          const raw_widths = img.dataset.widths
          debug('debug_nyt', 40, raw_widths)
          const parsed_widths = JSON.parse(raw_widths)
          let max_width_found = 0
          let slug = ''
          debug('debug_nyt', 50, parsed_widths)
          let width
          for (width of parsed_widths) {
            const size = width.size
            debug('debug_nyt', 60, width)
            if (size > max_width_found) {
              max_width_found = size
              slug = width.slug
              debug('debug_nyt', 70)
            }
          }
          if (max_width_found) {
            img.src = slug
            debug('debug_nyt', 80, slug)
          }
        }
        debug('debug_nyt', 90)
      }

      debug('debug_nytb', 1010)
      for (img of jQuery('img.g-freebird-lazy')) {
        const raw_widths = img.dataset.widths
        debug('debug_nytb', 1040, raw_widths)
        const parsed_widths = JSON.parse(raw_widths)
        const pattern = img.dataset.patternRetina
        const target = '{{size}}'
        const target_length = target.length
        const size_index = pattern.indexOf(target)
        const pattern_prefix = pattern.substr(0, size_index)
        const pattern_suffix = pattern.substr(size_index + target_length)
        debug('debug_nytb', 1041, pattern)
        debug('debug_nytb', 1042, pattern_prefix)
        debug('debug_nytb', 1043, pattern_suffix)
        let max_width_found = 0
        //let slug = ''
        debug('debug_nytb', 1050, parsed_widths)
        let width
        for (width of parsed_widths) {
          //const size = int(width)
          //debug('debug_nytb', 1060, width)
          if (width > max_width_found) {
            max_width_found = width
            debug('debug_nytb', 1070, width)
          }
        }
        if (max_width_found) {
          img.src = pattern_prefix + max_width_found + pattern_suffix
          debug('debug_nytb', 1080, img.src)
        }
        debug('debug_nytb', 1090)
      }

      for (const element of jQuery('a')) {
        debug('debug_nyt', 94, element.pathname)
        if (element.pathname.startsWith('/video/')) {
          debug('debug_nyt', 96)
          jQuery(element).addClass('wf_video_article_link')
        }
      }
      for (const element of jQuery('article p')) { // hide interstitial links
        const $element = jQuery(element)
        const element_contents = $element.contents()
        document.tgg = $element
        debug('debug_nyt', 110, $element)
        debug('debug_nyt', 120, element_contents)
        debug('debug_nyt', 130, element_contents.text())
        if (element_contents.text().startsWith('[ALSO READ: ')) {
          debug('debug_nyt', 140)
          $element.addClass('wf_interstitial_link')
          //$element.parent().parent().append($element) // this is now (4/18) overridden by NYT script, so we have to just hide it
        }
      }
      debug('debug_nyt', 200)
      for (const element of jQuery('.g-article-wrapper, .rad-article')) {
        debug('debug_nyt', 210, element)
        const parent = jQuery(element).parent()
        debug('debug_nyt', 220, parent)
        if (parent.hasClass('interactive-graphic')) {
          debug('debug_nyt', 230)
          parent.addClass('wf-unreal-interactive-graphic')
        }
      }
      /*
      const $button = jQuery('button')
      debug(5713, 250, $button)
      for (const element of $button) {
        debug(5713, 260, element)
        const $parent = jQuery(element).parent()
        debug(5713, 270, $parent)
        //$parent [0].addClass('wf_nag')
      }
      */
      const $site_content = jQuery('#site-content')
      debug(5714, 260, $site_content)
      const $site_content_parent = $site_content.parent()
      debug(5714, 270, $site_content_parent)
      const $site_content_parent_next = $site_content_parent.next()
      debug(5714, 280, $site_content_parent_next)
      $site_content_parent_next.remove()
      //debug(5714, 290, $site_content_parent_next.hasClass('wf_nag'))
      //remove_fixed_positioning(site_data)
    },
  },
  {
    name: 'Manchester Guardian',
    origin: 'https://www.theguardian.com',
    alternate_origins: 'https://interactive.guim.co.uk/',
    alternate_prefixes: 'file:///d/wayback/guardian_uk/ file:///d/wayback/guardian_us/ file:///d/wayback/guardian_uk_opinion/ file:///d/wayback/guardian_us_opinion/',
    alternate_homepages: 'https://www.theguardian.com/us https://www.theguardian.com/uk',
    append_loaded_date: 'footer.l-footer',
    count_words: {append: '.content__dateline, .content__standfirst', subject: '.content__article-body, .content__main-column--interactive'},
    /*
    article_css: '.js-headline-text {font-weight: normal} p {line-height: 170%} a {border-bottom: none} figure.element-tweet {margin-right: 4rem} .tweet {font-family: sans-serif} img.byline-img__img {background: transparent} .content {padding-bottom: 0} div.explainer {background-color: #00252f; border: 1px solid ' + theme_foreground_color + '} .signposting {border-right-width:0} .tabs__tab {border-top: 0.0625rem solid #aaa} .content__article-body {font-family: Adobe Caslon Pro; font-size: 109%}' +
      'a:link[data-link-name="auto-linked-tag"] {color:'    +         theme_autolink_foreground_color +    '} a:link:hover[data-link-name="auto-linked-tag"] {color:' +         theme_link_foreground_color + '}' +
      'a:visited[data-link-name="auto-linked-tag"] {color:' + theme_autolink_visited_foreground_color + '} a:visited:hover[data-link-name="auto-linked-tag"] {color:' + theme_link_visited_foreground_color + '}',
    */
    article_theme_selector: '.content__standfirst, .content__headline, .byline, .caption, .d-top-comment__bubble',
    theme_background_selector: '.new-header, .new-header:after, .subnav',
    article_css: ( //'.article-body-commercial-selector > * {display: block} .article-body-commercial-selector p:nth-of-type(-n + 3) {display: none} ' +
      '#sign-in-gate ~ * {display: block} .content__article-body p {line-height: 160%}'),
    article_theme_background_selector: 'section, .css-wz7t6r, .facia-page, .fc-item--pillar-news, .fc-item--pillar-arts, .fc-item--pillar-lifestyle, .headline-list__item, .tabs__tab a, .content__main, .content__article-body:before, details, .d-comment:target', //'.tonal--tone-live, .tonal--tone-editorial, .tonal--tone-feature, .tonal--tone-comment, .tonal--tone-analysis, .tonal--tone-review, .block--content, .navigation, .local-navigation, .navigation-container, .top-navigation, .navigation:before, .navigation-toggle, .navigation__container--first, .signposting, .tabs__tab--selected a, .tabs__tab--selected .tab__link, .tabs__tab a, .tabs__tab .tab__link',
    article_theme_foreground_selector: '.css-zjgnrw > div, .css-xmt4aq, .css-1h6ikvu, .css-ig5cd, h1, .fc-item__content, .content, .fc-item__standfirst, ul > li, .d-comment__body blockquote', //'.content__dateline, div.explainer, .quoted',
    article_hide_selector: 'style, #sign-in-gate ~ style, .site-message--banner, .ad-slot, .ad-slot__label, .ad-slot iframe, #slot-body-end, #bottom-banner, #sign-in-gate, iframe.css-ta2q8u-fullWidthStyles, iframe.interactive-atom-fence, .reveal-caption-icon, .element-video, .contributions__epic, .js-outbrain, .related, .submeta, #onward, #more-in-section, .element-pullquote, .element-rich-link, .meta__twitter, .meta__extras, .meta__email, .selection-sharing, .block-share, .ad-slot, #dfp-ad--inline1, #this_land_epic_bottom_environment_iframe, #this_land_epic_bottom_series_iframe, .vav-callout' + selector_for_elements_with_id_that_starts_with('google_ads_iframe_'),
    css: '.inline-the-guardian-logo__svg>path {fill: #0f0}',
    dark_theme: 1,
    homepage_hide_selector: '#most-viewed, .footer__email-container, div.image>div.video, #securedrop, #membership-thrasher, #support-the-guardian, .treats__container, .dumathoin--paidfor, #break-the-chain',
    //`` '.fc-container--story-package, .facia-page, .index-page, .voices-and-votes-container__wrapper, .l-side-margins, .fc-container--thrasher, .tone-news--item.fc-item, .du-faux-block-link--hover, .tone-feature--item, .fc-container--story-package .fc-item, .tone-analysis--item.fc-item, .tone-comment--item.fc-item, .tone-editorial--item, .tone-media--item, .tone-review--item',
    homepage_theme_background_selector: '.fc-container__header__title, .facia-page, .fc-item__container', //'.fc-container--story-package, .u-faux-block-link--hover',
    homepage_theme_selector: '',
    homepage_theme_foreground_selector: '.fc-item__standfirst, .fc-container__header__title',
    homepage_css: '.tone-live--item {background-color: #5a0b00} .fc-item.tone-letters--item {background-color: #333} .fc-container--story-package {border-top-width: 0} .js-on .fc-show-more--hidden .fc-show-more--hide {display: block}',
    hide_selector: '.adverts, .site-message, .site-message--banner' + selector_for_elements_with_id_that_starts_with('sp_message_container_465380'),
    //url_to_data_filename: {year_index: 4, segments_used: 7, wildcards: [3]},
    wayback: {targets: {guardian: '/'}},
    customize () {
      if (page_level === 0) {
        //jQuery('#opinion .button--show-more, #from-the-uk .button--show-more, #around-the-world .button--show-more').click()
        //jQuery('.button--show-more').click()
        //const facia_page = jQuery('.facia-page')
        jQuery('#opinion').insertAfter(jQuery('#headlines'))
        jQuery('#spotlight, #weekend').insertAfter(jQuery('#headlines'))
        jQuery('#around-the-world').insertAfter(jQuery('#headlines'))
        jQuery('#from-the-uk').insertAfter(jQuery('#headlines'))
        jQuery('#in-pictures').insertBefore(jQuery('#headlines'))
      }
    },
  },
  {
    name: 'Washington Post',
    origin: 'https://www.washingtonpost.com',
    alternate_origins: 'http://washingtonpost.com http://www.washingtonpost.com https://live.washingtonpost.com',
    alternate_prefixes: 'file:///d/wayback/washingtonpost/',
    article_css: 'dwp-ad {visibility: hidden} .powa-wrapper {filter: none} section>div>div {min-height: 0} body {overflow: scroll} .w-100 {filter: none} .article-body>div {padding: 0} #main-content {background-image: none} #et-nav {position: absolute}.headline {font-family: sans-serif} a, .powerpost-header, .layout_article #top-content {border-bottom: none} p {line-height: 155%} body {overflow-y: visible} .fixed-image {position: static} .g-artboard img {border-bottom: 30px solid white} .g-artboard p {color: black; background-color: transparent} .bg-none {background-color: transparent} .note-button {padding: 0; box-shadow: none} .chain-wrapper {background-color: #500} .pg-visual, .photo-section-img {opacity: 1}' +
      'a.note-button:link    {color:' +         theme_autolink_foreground_color + '} a.note-button:link:hover    {color:' +         theme_link_foreground_color + '}' +
      'a.note-button:visited {color:' + theme_autolink_visited_foreground_color + '} a.note-button:visited:hover {color:' + theme_link_visited_foreground_color + '}' +
      //'a.wf_offlink {border-top: 1px dotted ' +         theme_offlink_background_color + '}',
      'a.wf_offlink {background-image: linear-gradient(to right, #f00 15%, rgba(255,255,255,0) 0%); background-position: bottom; background-size: 10px 1px; background-repeat: repeat-x;}',
    article_hide_selector: '.css-y8aj3r, .z-1, .right-rail, #wall-bottom-drawer, .fade-in-left, .paywall-overlay, #wallIframe, .ent-ad-container, #link-box, .health-disclaimer-container, .pb-f-capital_weather_gang-weather-right-rail-features, .pb-f-page-twitter-timeline, #wp-header, #top-furniture, .pb-f-ad-flex-2, .pb-f-ad-flex-3, .pb-f-games-gamesWidget, .pb-f-page-footer-v2, .pb-f-page-recommended-strip, .pb-f-page-editors-picks, disabled.chain-wrapper, .extra, .pb-f-generic-promo-image, .pb-f-posttv-sticky-player, .pb-f-posttv-sticky-player-powa, .xpb-f-article-article-author-bio, .pb-tool.email, .pb-f-page-newsletter-inLine, .pb-f-page-comments, .inline-video, [channel="wp.com"], .pb-f-page-jobs-search, .pb-f-homepage-story, .pb-f-sharebars-top-share-bar, .pb-f-page-share-bar, .wp_signin, #wp_Signin, .inline-graphic-linked, .share-individual, .pb-f-page-trump-can-he-do-that-podcast, .bottom-ad--bigbox, [data-block-type="subscription"], .utility-bar, .side-nav__scroll-container, #leaderboard-wrapper, .interstitial, div[data-qa="article-body-ad"], div[data-qa="leaderboard"]',
    // + selector_for_elements_with_id_that_starts_with('google_ads_iframe_'),
    article_theme_selector: '.btn-white, #article-body, p, blockquote, .pg-bodyCopy',
    article_theme_background_selector: '.wp-volt-gal-embed-promo-container, .wp-volt-gal-embed-promo-bottom, #weather-glance, #weather_now, .cwgdropdown, #heat-tracker, #weather-almanac, .pb-f-capital_weather_gang-weather-almanac select, .border-bottom-hairline::after, .span12, .note-button, #pb-root',
    article_theme_foreground_selector: '.black, .gray-dark, .pb-caption, .pg-caption, .pb-bottom-author, .pb-timestamp, .pg-pubDate, .weather-gray, #weather_now .time, .firstgraf::first-letter',
    count_words: {append: '.display-date', subject: '.teaser-content, .remainder-content'},
    homepage_css: 'header {position: relative} .pb-f-homepage-story .headline a, .related-links a, #bottom-content a {font-family: sans-serif; font-weight: normal} img.wplogo {-webkit-filter: invert(70%) sepia(100%) hue-rotate(65deg) saturate(7)} .inline-list>li {display: inline}',
    homepage_theme_background_selector: '#pb-root, .homepage-footer-button, .pb-f-page-todays-paper-rr .large, .pb-f-homepage-chat-schedule .chat-schedule-button a',
    homepage_theme_selector: '.pb-f-homepage-card .panel',
    //hide_selector:'.pb-f-page-post-most img',
    homepage_theme_foreground_selector: '.label, .blurb, .byline, .author, .caption',
    homepage_hide_selector: '.flex, .pb-f-homepage-brandconnect-sidebar, .section-story-photo-1, #main-navigation-right', //, .standard-chain img, .opinions-chain img',
    css: '.overlineLabel {font-family: "Helvetica Black", sans-serif; font-weight: bold} .wf_video_article_link:link, .wf_video_article_link:visited {color: #990}',
    theme_foreground_selector: 'h1, h2, h3, h4, h5, h6, .gray-darkest',
    theme_selector: 'body, .skin.skin-card, .skin.skin-button, input',
    unwanted_query_fields: 'hpid tid utm_term wpisrc wpmk',
    // https://www.washingtonpost.com/powerpost/gop-opponents-to-senate-health-care-bill-see-vote-delay-as-an-advantage/2017/07/16/3e5516fa-6a21-11e7-96ab-5f38140b38cc_story.html
    // https://www.washingtonpost.com/news     /to-your-health                                                         /wp/2017/07/19/a-gunshot-destroyed-her-face-a-rare-surgery-just-gave-her-a-new-one/
    //url_to_data_filename: {year_index: 5, segments_used: 8, wildcards: [3, 4]},
    wayback: {targets: {washingtonpost: '/'}},
    customize () {
      debug(848, 0)
      let stylesheet_link
      for (stylesheet_link of jQuery("link[rel='stylesheet']")) {
        const stylesheet_link_href = stylesheet_link.href
        //debug(stylesheet_link_href)
        /*
        let alt_prefix = 'file://www.washingtonpost.com/'
        if (stylesheet_link_href.startsWith(alt_prefix)) {stylesheet_link.href = site_data.origin + stylesheet_link_href.substring(alt_prefix.length - 1);}
        alt_prefix = 'file:///'
        if (stylesheet_link_href.startsWith(alt_prefix)) {stylesheet_link.href = site_data.origin + stylesheet_link_href.substring(alt_prefix.length - 1);}
        */
        let prefix
        for (prefix of ['file://www.washingtonpost.com/', 'file:///']) {
          if (stylesheet_link_href.startsWith(prefix)) {
            stylesheet_link.href = site_data.origin + stylesheet_link_href.substring(prefix.length - 1)
            break
          }
        }

        //debug(stylesheet_link.href)
      }
      let $imgs = jQuery('img.unprocessed')
      debug(848, 100, $imgs)
      let img
      for (img of $imgs) {
        debug(848, 110, img)
        img.src = img.dataset.hiResSrc
        //jQuery(img).css({'filter': 'none', 'webkit-filter': 'none'})
        //jQuery(img).removeClass('unprocessed')
      }
      $imgs.removeClass('unprocessed')
      $imgs = jQuery('img.placeholder')
      debug(848, 120, $imgs)
      for (img of $imgs) {
        debug(848, 121, img)
        jQuery(img).css({'padding-top': '0'})
        img.src = img.dataset.hiResSrc
      }
      for (img of jQuery('figure img')) {
        img.src = img.src.substr(0, img.src.length - '&w=32'.length) + '&w=1800'
        jQuery(img).css({'filter': 'none', 'webkit-filter': 'none'})
      }
      for (img of jQuery('img.lazyld')) {
        img.src = img.dataset.hiResSrc
      }
      let descent_imgs = jQuery('img.descent-photo')
      descent_imgs.css('opacity', '1')
      for (img of descent_imgs) {
        img.src = img.attributes.getNamedItem('descent-src').value
      }
      for (const element of jQuery('a')) {
        if (element.hasOwnProperty('pathname')) {
        debug(284, 10, element.pathname)
        if (element.pathname.startsWith('/video/')) {
          debug(284, 20)
          jQuery(element).addClass('wf_video_article_link')
        }
      }
      }
      for (const element of jQuery('video')) {
        debug(284, 50)
        element.removeAttribute('loop')
      }
      if (page_level === 2) {
        for (const anchor of window.$anchors) {
          const href = anchor.href
          if (!href.startsWith('https://www.washingtonpost.com')) {
            jQuery(anchor).addClass('wf_offlink')
          }
        }
        const $elements = jQuery('p span') // For some strange reason this site occasionally has <span style="color: #000000;"> in the middle of a graf, which is invisible on the unmodified site but hides the text under dark_theme.
        //let element
        for (const element of $elements) {
          const $element = jQuery(element)
          if ($element.attr('style')) {
            //window.e = element
            //document.e = element
            const element_style = element.style
            //debug(511, 40, element, element_style, element_style.color)
            if (element_style.color !== '') {
              //debug(511, 60)
              element_style.color = '' //'rgb(255, 0, 0)'
            }
          }
        }
        for (const element of jQuery('article p, article p>i, article p>em')) { // hide interstitial links
          const $element = jQuery(element)
          const element_contents = $element.contents()
          if (element_contents.length === 3 && element_contents [0].textContent === '[') {
            $element.addClass('wf_interstitial_link')
            $element.parent().parent().parent().append($element)
          }
          debug(285, 10, element_contents [0])
        }
        for (const element of jQuery('article a')) { // hide interstitial links
          const $element = jQuery(element)
          const element_contents = $element.contents()
          debug(285, 20, element_contents)
          const element_contents_0 = element_contents [0]
          debug(285, 21, element_contents_0)
          if (element_contents_0) {
            const element_text = element_contents_0.textContent
            debug(285, 30, element_text)
            if (element_text [0] === '[' && element_text [element_text.length - 1] === ']') {
              debug(285, 31)
              $element.addClass('wf_interstitial_link')
              $element.parent().parent().parent().append($element)
            }
          }
        }
        //jQuery('div.inline-content:has([data-slug="a-look-at-president-trumps-first-year-in-office-so-far"])').hide()
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
      //debug(41, content_body_element, content_body_element_children)
      //window.c = []
      let content_body_element_child
      for (content_body_element_child of content_body_element_children) {
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
        //debug(45, content_body_element_child, direct_text_content(content_body_element_child), content_body_element_grandchildren)
        //if (direct_text_content(content_body_element_child) === '' &&
      }
      //debug(47, direct_text_content(content_body_element_children [61]))
      //debug(49, direct_text_content(content_body_element_children [62]))
    }
  },
  {
    name: 'The Intercept',
    origin: 'https://theintercept.com',
    article_theme_foreground_selector: '.PostContent, .PostContent u, h1, h2, h3, h4, h5, h6, .caption',
  },
  {
    name: 'The San Francisco Chronicle',
    origin: 'https://www.sfgate.com',
    article_theme_foreground_selector: '.headline, .byline, p, .caption-full, .credit',
    article_theme_background_selector: '.article-content, #content, .page-content, .content, .core-headline-list', // yes, we need all 4 "content" selectors!
    article_hide_selector: '.article-share, header, .socialWrapper',
  },
  {
    name: 'OnTheGoMap',
    origin: 'https://www.onthegomap.com',
    article_hide_selector: 'ins iframe',
  },
  {
    name: 'USA Today',
    origin: 'https://www.usatoday.com',
    article_hide_selector: '.utility-bar-wrap, .overlay-arrows, .site-header-inner-wrap-fixed, .close-wrap, .feed-stories-module, .interactive-poll-module, .inline-share-tools-asset',
    count_words: {append: '.asset-metabar', subject: '[itemprop=articleBody'},
  },
  {
    name: 'Slate',
    origin: 'https://slate.com',
    article_hide_selector: '.slate-paywall, .ad, .pull-quote, .bottom-banner, .rubricautofeature, .top-comment, .follow-links, .social',
    article_theme_foreground_selector: '.slate-paragraph--drop-cap::first-letter',
    css: '.user-link, .search-link, .global-nav-handle {background-color:' + theme_background_color + '; -webkit-filter: brightness(70%) sepia(100%) hue-rotate(55deg) saturate(7)} .logo, .prop-image img {-webkit-filter: hue-rotate(180deg) brightness(60%) sepia(100%) hue-rotate(55deg) saturate(7)}',
    article_css: 'body {overflow: scroll} .lazy-container img {opacity: 1} .roll-up {position: absolute} .meta {background: none}', //'.about-the-author.fancy {background: none} .about-the-author.fancy .author-bio {border-bottom: none}',
    count_words: {append: '.pub-date', subject: '.body .text'},
    theme_background_selector: '.page, .nav-header',
    customize () {
      jQuery('body').focus()
      debug(700, 0)
      for (img of jQuery('.lazy-container img')) {
        img.src = img.dataset.normal
        debug(700, 10, img.src, img.dataset.normal)
      }
    },
  },
  {
    name: 'Google Voice',
    origin: 'https://voice.google.com',
    dark_theme: 0,
    customize () {
      (function monitor () {
        const titles = jQuery('p[gv-test-id="conversation-title"]')
        debug(718, 20, titles, titles.length)
        if (titles.length) {
          const title_text = titles [0].textContent
          debug(718, 30, title_text, title_text.indexOf('Rebecca Rivers'))
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
    name: 'developers.google.com',
    origin: 'https://developers.google.com',
    dark_theme: false,
    article_css: 'header, nav {position: static}',
  },
  {
    name: 'gamedevacademy.org',
    origin: 'https://gamedevacademy.org',
    dark_theme: false,
    article_hide_selector: '#zva-modal-area',
  },
  {
    name: 'Daily Beast',
    origin: 'https://www.thedailybeast.com',
    alternate_origins: 'http://www.thedailybeast.com',
    count_words: {append: '.ArticleBody__byline', subject: 'article.Body'},
    article_hide_selector: '.share-icons, .InlineNewsletter',
    article_theme_background_selector: '.ArticleBody, .ArticlePage',
  },
  {
    name: 'Chicago Tribune',
    origin: 'http://www.chicagotribune.com',
    article_theme_background_selector: '.trb_allContentWrapper, .tr_ar_by, .tr_ar_dateline',
    article_theme_foreground_selector: 'p, p:first-child:first-letter',
    count_words: {append: '.tr_ar_dateline', subject: '.trb_ar_bd'},
    article_hide_selector: '.met-rule-660',
  },
  {
    name: 'Talking Points Memo',
    origin: 'http://talkingpointsmemo.com',
    count_words: {append: '.FeatureByline', subject: '.Feature'},
    article_hide_selector: '.FeatureSocial, .FeatureShare, .Daybreaker, .Hive, .Facebook, .FeatureByline__FacebookLike, .FeatureByline__Count, .BottomAdSlot, .Footer__ExtendBackground, .Feature__Revcontent, .EmbedComments',
  },
  {
    name: 'Stackify',
    origin: 'https://stackify.com',
    dark_theme: 0,
    article_css: '.x-navbar, .theiaStickySidebar {position: static}',
  },
  {
    name: 'CNBC',
    origin: 'https://www.cnbc.com',
    hide_selector: '.fEy1Z2XT',
    article_css: 'body.dark_theme {overflow: scroll}',
    dark_theme: 0,
  },
  {
    name: 'Business Insider',
    origin: 'https://www.businessinsider.com',
    dark_theme: 0,
    hide_selector: '.tp-modal, .tp-backdrop',
    css: 'body.tp-modal-open {overflow: auto}',
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
    origin: 'https://www.politico.com',
    article_css: '.super {background: none} h1>span, h1 {background-color: transparent}',
    article_hide_selector: '.ad, .cookie-modal, .story-interrupt, .story-tools, .story-related, .story-share',
    count_words: {append: '.timestamp', subject: '.story-text'},
  },
  {
    name: 'Bloomberg',
    origin: 'https://www.bloomberg.com',
    article_css: 'body[data-paywall-overlay-status="show"], body.tp-modal-open {overflow: scroll} .lazy-img__image {filter: unset}.lede-text-only__highlight {box-shadow: none} .bb-nav[data-theme=view] {background-color: #600} .wmaster_words_count_total {margin-left: 0.4em} .persist-nav, .sticky-container {position: absolute} .transporter-container {z-index: 600} #graphics-paywall-overlay {z-index: 600} .hub-zone--hidden {display: block; visibility: visible',
    article_hide_selector: '#graphics-paywall-overlay, .storythread-tout, .tp-modal, .tp-backdrop, .tp-active, #paywall-banner, #adBlockerContainer, #graphics-paywall-overlay, .persist-nav, .sticky-social-buttons, .inline-newsletter, .video-player, .video-js',
    article_theme_foreground_selector: '.abstract-v2__item, h2, h3, .body-copy, .body-copy-v2, .blockquote, .lede-media-image__caption, .lede-text-only__byline',
    //article_theme_selector: '.lede-text-only__highlight',
    count_words: {append: '.lede-wrap', subject: '.body-copy'},
    article_theme_background_selector: '.transporter-container, .lede-text-only__highlight',
    customize () {
      for (img of jQuery('.lazy-img>img')) {
        //jQuery(img).css({'padding-top': '0'})
        img.src = img.dataset.nativeSrc
        //img.removeClass('lazy-img__image')
      }
    },
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
      debug(455, w)
      w.remove()
      */
      //debug(55, elements)
      if (elements_length === 3) {
        jQuery(elements [0]).addClass('hide')
        //debug(56, elements [0])
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
    article_hide_selector: 'nav, #paywall, gpt-ad, .ad-boxinjector-wrapper, .fancy-box-wrap, c-non-metered-nudge, .module-related.video, .js-inject-promo, .social-kit-top, .article-tools, .callout, .pullquote, .c-nudge__container,' + selector_for_elements_with_a_class_that_starts_with('NonMeteredNudge_root__ adform-adbox- GptAd_'),
    theme_background_selector: '#site',
    article_theme_background_selector: '.article-body blockquote',
    article_theme_foreground_selector: '.ArticleBody_root__17rER, .ArticleTitle_root__1SxDD, .ArticleDek_root__1_tnX, .article-body',
    homepage_theme_background_selector: '.c-hp, .c-hp-lead__content, .c-hp-news, .c-hp-filmstrip, .c-hp-offlead, .c-hp-featured, .c-writers__container, .c-latest, .c-popular__container, .c-sections, input',
    homepage_hide_selector: '.c-writers__item--magazine',
    article_css: 'html {scroll-padding-top: 0} .fancybox-lock, .fancybox-lock body, body {overflow: scroll; position: static} figure.lead-img .img {outline: none} .article-cover-extra {padding-bottom: 0; border-bottom: none}',

    //dark_theme: 0,
  },
  {
    name: 'National Review',
    origin: 'https://www.nationalreview.com',
    count_words: {append: 'time', subject: '[itemprop="articleBody"]'},
    article_hide_selector: '.jwplayer-inline',
    article_css: '.site-header {position: static}',
    dark_theme: 2,
  },
  {
    name: 'The Economist',
    origin: 'https://www.economist.com',
    theme_foreground_selector: 'h1, h2, h3, p, span, .teaser__description, .ds-section-headline, .related-story__title',
    article_hide_selector: '.tead-container, .newsletter-form, cite',
    hide_selector: '#bottom-page',
  },
  {
    name: 'Zacks',
    origin: 'https://www.zacks.com',
    article_hide_selector: '.disclosure-fixed-slab, .darchive_collapse, .dcommentary_reports_content, .dcommentary_zacks_news',
    article_theme_foreground_selector: 'h1, p',
    article_css: 'body {font-family: sans-serif} .dcommentary_body {overflow: visible}',
  },
  {
    name: 'CNN',
    origin: 'https://www.cnn.com',
    article_css: '.nav--plain-header {position: absolute}',
    article_hide_selector: 'theoplayer-container, .sibling, .optanon-alert-box-wrapper',
    article_theme_background_selector: '.pg-rail-tall',
    article_theme_foreground_selector: 'h1, .zn-body__paragraph',
  },
  {
    name: 'forbes',
    origin: 'https://www.forbes.com',
    dark_theme: 0,
    article_hide_selector: '.fbs-auth__container',
    article_css: 'body {overflow: scroll}'
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
    name: 'Pittsburgh Post-Gazette', // blacklist scripts from perceivequarter.com to block the adblocker-blocker
    origin: 'http://www.post-gazette.com',
    //article_hide_selector: 'mfp-bg mfp-ready',
  },
  {
    name: 'The Street',
    origin: 'https://www.thestreet.com',
    css: '.m-fixedbottom-ad--slot {display: none}',
    article_hide_selector: '#indexCarousel, .market-indices__date-time, .video-container, .MuiPaper-root',
    dark_theme: 0,
  },
  {
    name: 'Rising Stack',
    origin: 'https://blog.risingstack.com',
    dark_theme: 0,
    article_css: '.site-header, .cc-window {position: static}',
  },
  {
    name: 'Medium',
    origin: 'https://medium.com',
    dark_theme: 0,
    article_css: 'html, .u-overflowHidden {overflow: auto} .u-fixed, .metabar--affixed {position: static}',
    article_theme_background_selector: '#container, .screenContent, .canvas-renderer, .metabar, .u-backgroundGrayLightest, .u-backgroundWhite',
    article_theme_foreground_selector: '.postMetaInline, .u-textColorDark, .graf--h2, .graf--h3, .graf--h4',
    article_hide_selector: 'body>iframe, .overlay, .surface-scrollOverlay, .postActions, div.ar, div[aria-modal="true"]',
  },
  {
    name: 'Codeburst',
    origin: 'https://codeburst.io',
    alternate_origins: 'https://itnext.io https://blog.usejournal.com/ https://blog.uncommon.is https://ferdychristant.com/ https://uxplanet.org https://medium.learningbyshipping.com',
    dark_theme: 0,
    article_css: 'html, .u-overflowHidden {overflow: auto} .u-fixed, .metabar--affixed {position: static}',
    article_hide_selector: '.overlay',
  },
  {
    name: 'Hackernoon',
    origin: 'https://hackernoon.com',
    dark_theme: 0,
    article_css: 'html, .u-overflowHidden {overflow: auto} .u-fixed, .metabar--affixed {position: static}',
    article_hide_selector: '.overlay',
  },
  {
    name: 'Stack Overflow',
    origin: 'https://stackoverflow.com',
    dark_theme: 0,
    article_css: '.top-bar._fixed, .ps-fixed {position: static}',
  },
  {
    name: 'Changelog',
    origin: 'https://changelog.com',
    dark_theme: 0,
    article_css: 'header {position: static}',
  },
  {
    name: 'Sitepoint',
    origin: 'https://www.sitepoint.com',
    dark_theme: 0,
    article_css: '.sp🚧 .l-p-fix {position: static}',
  },
  {
    name: 'Videoblocks',
    origin: 'https://engineering.videoblocks.com',
    dark_theme: 0,
    article_css: 'div.u-fixed, .metabar--affixed {position: static}',
  },
  {
    name: 'MDN',
    origin: 'https://developer.mozilla.org',
    dark_theme: 0,
    article_css: '.contribution-banner {position: static}',
  },
  {
    name: 'Open Digerati',
    origin: 'https://blog.opendigerati.com',
    dark_theme: 0,
    article_css: 'div.u-fixed, .metabar--affixed {position: static}',
  },
  {
    name: 'Cloudboost',
    origin: 'https://blog.cloudboost.io',
    dark_theme: 0,
    article_css: 'div.u-fixed, .metabar--affixed {position: static}',
  },
  {
    name: 'Session Stack',
    origin: 'https://blog.sessionstack.com',
    dark_theme: 0,
    article_css: 'div.u-fixed, .metabar--affixed {position: static}',
  },
  {
    name: 'Free Code Camp',
    origin: 'https://medium.freecodecamp.org',
    alternate_origins: 'https://medium.freecodecamp.com',
    dark_theme: 0,
    article_theme_background_selector: '#container, .screenContent, .canvas-renderer, .metabar, .u-backgroundGrayLightest, .u-backgroundWhite',
    article_theme_foreground_selector: '.postMetaInline, .u-textColorDark, .graf, .ggraf--h2, .ggraf--h3, .ggraf--h4',
    article_hide_selector: '.js-stickyFooter, .overlay',
    article_css: 'html, .u-overflowHidden {overflow: auto} .u-fixed, .metabar--affixed {position: static}',
  },
  {
    name: 'Phaser',
    origin: 'https://phaser.io',
    dark_theme: 0,
    article_hide_selector: '#codefund',
  },
  {
    name: 'Phaser 3 Docs',
    origin: 'https://phaser.io',
    alternate_homepages: 'https://photonstorm.github.io/phaser3-docs/',
    article_css: '.navbar-fixed-top, .navbar-fixed-bottom {position: absolute}',
    dark_theme: 0,
    article_hide_selector: '#codefund',
  },
  {
    name: 'Phaser Forum',
    origin: 'https://phaser.discourse.group',
    dark_theme: 0,
    article_css: 'html {font-family: Arial}',
  },
  {
    name: 'John Resig',
    origin: 'https://johnresig.com',
    dark_theme: 0,
    article_css: 'html, body {font-family: Arial}',
  },
  {
    name: 'Associated Press',
    origin: 'https://apnews.com',
    alternate_origins: 'https://www.apnews.com',
    count_words: {append: '.mobile h6', subject: '.articleBody'},
    article_css: '.articleView {padding-top: 80px} .header {position: absolute}',
    article_hide_selector: '#drawerMenu, .mobileTitle ul, footer, .Header',
  },
  {
    name: 'Christian Science Monitor',
    origin: 'https://www.csmonitor.com',
    article_theme_foreground_selector: 'p',
    article_theme_background_selector: '#most-viewed-ump, #story-bottom, foo',
    //count_words: {append: '.mobile h6', subject: '.articleBody'},
    //article_css: '.articleView {padding-top: 80px} .header {position: absolute}',
    article_hide_selector: '.ezn-ddp_responsiveArticle_subscribe_ad_B, .injection, #csm-above-footer-1',
  },
  {
    name: 'US News & World Report',
    origin: 'https://www.usnews.com',
    //article_theme_background_selector: '#most-viewed-ump, #story-bottom, foo',
    //count_words: {append: '.mobile h6', subject: '.articleBody'},
    //article_css: '.articleView {padding-top: 80px} .header {position: absolute}',
    article_hide_selector: '.hero-sticky-bar-container.fixed',
  },
  {
    name: 'Reuters',
    origin: 'https://www.reuters.com',
    //article_css: '.wmaster_total_words_count {font-size: 150%; margin-left: 0.3em} #headerNav {top: 0} #content {margin-top: 0px} #breakingNewsContainer.breaking {background-color: #840}',
    //article_hide_selector: '#headerNav, .edition-header, .nav-white-space, .core-share, .related-content',
    article_theme_foreground_selector: 'p',
    //article_theme_background_selector: '.info-box, .footer, .footer-body, .footer-body .product',
    //count_words: {append: '#article-byline', subject: '#article-text', nbsp_size: '100%'},
    //unwanted_classes: 'mod-sticky-article article-sticky',
  },
  {
    name: 'MSN',
    origin: 'https://www.msn.com',
    dark_theme: 0,
    hide_selector: '#header-search form',
  },
  {
    name: 'LEDs Magazine',
    origin: 'https://www.ledsmagazine.com',
    alternate_homepages: 'http://www.ledsmagazine.com/index.html',
    //count_words: {append: '#editorial-article-wrapper-container>:first-child>:first-child>:first-child>:first-child>:first-child', subject: 'article'},
    //article_hide_selector: '.clay-share',
    theme_background_selector: '.page, .page-wrapper, .node, .node-list, .breadcrumb',
    article_theme_background_selector: '#breadcrumbs div',
    article_theme_foreground_selector: 'p, .page-wrapper__title, .page-dates__content-published',
    article_hide_selector: '#pw-article-share-bar',
    article_css: '#container {border: none}'
  },
  {
    name: 'Time Magazine',
    origin: 'https://time.com',
    count_words: {append: '#editorial-article-wrapper-container>:first-child>:first-child>:first-child>:first-child>:first-child', subject: 'article'},
    article_hide_selector: '.ssv3__nav',
    article_theme_background_selector: 'h1, h2, h3, blockquote, .article-viewport, .container-full-width',
    article_theme_foreground_selector: '.xxx_oneoff_special_story_v3_headline',
    article_theme_selector: 'p',
    article_css: 'nav {position: static}',
    //article_hide_selector: '.clay-share',
    //article_theme_foreground_selector: 'p:first-letter',
  },
  {
    name: 'Wall Street Journal',
    origin: 'https://www.wsj.com',
    alternate_origins: 'https://blogs.wsj.com',
    article_theme_background_selector: '.bigTop__rel',
    article_theme_selector: 'html, .article-content>p, .paywall>p, .media-object, figcaption',
    article_theme_foreground_selector: '.WSJTheme-module--text--Cws65LRA, .WSJTheme-module--headline--J5926iIY, h1, h2, tspan, .bigTop__caption',
    theme_background_selector: 'header, .zonedModule',
    css: 'header {position: static} .WSJTheme--padding-bottom--2SLicJJy, .style--hat-1vqyrZZ3j7vMCXYKbvaqKa, .style--hat--1vqyrZZ3 {display: none}',
    article_css: 'html {scroll-padding-top: 0} .nav-is-sticky {padding-top: 0}',
    article_hide_selector: '.style--header-wrapper-3KS0vHEBLQWIH5Ne-XG256, #webui-ribbon, .mega-nav, .articleTypeLogo, #full-header, #slimline-header, #share_tools, #share-target, .style--header-34vuYLYT-W0F3y22D9Vjuk, #article_tools, .carousel-container, .type-InsetNewsletterSignup, .wsj-modern-ad-container,' + selector_for_elements_with_a_class_that_starts_with('WSJTheme-module--newcards__wrapper--'),
    homepage_hide_selector: '.WSJTheme--ribbon--2rnxjr5y,' + selector_for_elements_with_a_class_that_starts_with('WSJTheme--adWrapper--'),
    homepage_css: 'h1 {filter: invert(70%) sepia(100%) hue-rotate(65deg) saturate(7)}',
    homepage_theme_foreground_selector: '.WSJTheme--summary--lmOXEsbN, .WSJTheme--summary--12br5Svc',
    unwanted_query_fields: 'mod',
  },
  {
    name: 'Investopedia',
    origin: 'https://www.investopedia.com',
    css: 'a:link {color: #00f} a:visited {color: #808}',
    dark_theme: 0,
  },
  {
    name: 'Benzinga',
    origin: 'https://www.benzinga.com',
    dark_theme: 0,
    hide_selector: '#closure',
    article_hide_selector: '.pane-panels-mini, .ui-tooltip'
  },
  {
    name: 'The Hill',
    origin: 'https://thehill.com',
    dark_theme: 0,
    article_hide_selector: 'iframe, .player-container',
    article_css: '.floating-block-active {position: static}',
  },
  {
    name: 'Investing',
    origin: 'https://www.investing.com',
    hide_selector: '#abd-banner, #abPopup, .breakingNews, .js-discussion-side-panel',
    css: 'body {overflow: auto}',
    dark_theme: 0,
  },
  {
    name: 'Naked Capitalism',
    origin: 'https://www.nakedcapitalism.com',
    hide_selector: '#abPopup, .breakingNews, #abd-banner',
    css: 'body {overflow: auto}',
    dark_theme: 0,
  },
  {
    name: 'Robinhood',
    origin: 'https://robinhood.com',
    css: 'body {overflow: auto}',
    dark_theme: 0,
  },
  {
    name: 'South China Morning Post',
    origin: 'https://www.scmp.com',
    homepage_hide_selector: '.accordion',
    css: '.header-menu-container {position: static} a:link    {color:' +         theme_link_foreground_color + '} a:link:hover    {color:' +         theme_link_foreground_color + '}' +
      'a:visited {color:' + theme_link_visited_foreground_color + '} a:visited:hover {color:' + theme_link_visited_foreground_color + '}',
    article_hide_selector: '.full-page-takeover, iframe, .blockquote, .content--newsletter',
    dark_theme: 0,
    d_customize () {
      debug(34, 10)
      anchors = jQuery('a')
      for (anchor of anchors) {
        anchor.classList = []
        //anchor.dataset = []
        let dataset = anchor.dataset;
        debug(34, 20, dataset)
        for (var key in dataset) {
          let munged_name = "data-" + key.split(/(?=[A-Z])/).join("-").toLowerCase()
          debug(34, 30, munged_name)
          anchor.removeAttribute(munged_name)
        }
      }
    },
  },
  {
    name: 'Tradingview',
    origin: 'dhttps://www.tradingview.com',
    hide_selector: '#overlap-manager-root',
    dark_theme: 0,
  },
  {
    name: 'Seeking Alpha',
    origin: 'https://seekingalpha.com',
    article_hide_selector: '.popover',
    hide_selector: '.tp-backdrop, .tp-modal, .upload-link, .side-portfolio-wrapper, .popover, [id^="ads_"], [id^="google_ads_"], #right-rail, .tp-modal',
    unwanted_query_fields: 'source',
    css: 'body, body.tp-modal-open {overflow: auto} a:link    {color: #00f} a:visited {color: purple} #sa-hd {position: absolute} #content_section.overview section .info, .content_section.overview section .info {font-family: sans-serif}',
    article_css: 'header {position: static}',
    dark_theme: 0,
  },
  {
    name: 'Marketwatch',
    origin: 'https://www.marketwatch.com',
    hide_selector: '#ad-inline-video, #cx-membership-tile, #cx-candybar, .element--ad, .container--trending, .quote-tip',
    unwanted_query_fields: 'mod',
    css: 'a:link {color: #00f} a:visited {color: #808}',
    dark_theme: 0,
  },
  {
    name: 'New York Magazine',
    origin: 'https://nymag.com',
    alternate_origins: 'https://www.grubstreet.com',
    count_words: {append: '.article-timestamp', subject: '.article-content'},
    article_hide_selector: '#paywall-reader-interface, nav, .clay-share, .page-header, .modal',
    article_theme_foreground_selector: '.clay-subheader, .manual-article .manual-article-link, h1, p, figcaption, time, .by-authors, .credit',
    article_theme_background_selector: '.video-promo-for-articles, .lede-wrapper, .lede-image-data',
    homepage_css: '.logo {background-color: white}',
    article_css: 'blockquote, blockquote p {' + theme_foreground_rule + 'padding: 0 0 0 14px; border-left: 1px solid #3a3} blockquote:before {border-top: none} .mediaplay-image-figcaption {text-align: left} nav.rubric-wrap svg>path:last-child {fill: white} .article .primary-area:before {background: #000}', // "Intelligencer" in Daily Intelligencer logo
    homepage_theme_background_selector: '.newsHeadlinesByPublication section, .dek, .hed',
  },
  {
    name: 'Times Union',
    origin: 'https://www.timesunion.com/',
    css: 'a:link {color: #00f} a:visited {color: #808}',
  },
  {
    name: 'Wordpress',
    origin: 'https://curiousbynature.wordpress.com/',
    article_hide_selector: 'iframe',
  },
  {
    name: 'The Cut',
    origin: 'https://www.thecut.com',
    count_words: {append: '.article-timestamp', subject: '.article-content'},
    article_hide_selector: '.related-stories',
    article_theme_foreground_selector: 'h1, .clay-paragraph, .clay-paragraph_drop-cap, .mediaplay-image-figcaption',
  },
  {
    name: 'Vulture',
    origin: 'http://www.vulture.com',
    article_theme_background_selector: '.global-nav',
    article_hide_selector: '.clay-share',
    article_theme_foreground_selector: 'h1, .clay-paragraph, .mediaplay-image-figcaption, .by-authors, time, .lede-horizontal-teaser',
    article_css: '.logo-wrap {background-color: #333}',
    count_words: {append: '.article-timestamp', subject: '.article-content'},
  },
  {
    name: 'Vox',
    origin: 'https://www.vox.com',
    article_hide_selector: '.main-social, .c-article-feedback, .c-tab-bar, .c-rock-newsletter',
    hide_selector: '.adblock-whitelist-messaging__article-wrapper',
    article_theme_background_selector: 'header .l-wrapper {max-width: none} .l-main-content, .c-global-header:before, .c-global-header__logo, .c-rock-list__title-wrapper:before, .c-compact-river__entry, .c-footer',
    theme_background_selector: '.l-root',
    article_theme_foreground_selector: '.c-page-title, .c-byline, .p-dek, .p-rock-head',
    count_words: {append: '.c-byline', subject: '.c-entry-content'},
    css: '.l-root {background-color: #000} .c-global-header__logo path {fill: ' + theme_foreground_color + '} .c-compact-river__entry, .c-footer {border-top-width: 0}',
  },
  {
    name: 'The Verge',
    origin: 'https://www.theverge.com',
    homepage_hide_selector: '.adblock-whitelist-messaging__wrapper',
    article_css: 'body {font-family: sans-serif} .c-comments__recommended {background-color: #003}',
    article_hide_selector: '.adblock-whitelist-messaging__article-wrapper, .c-entry-content>[class^=c-float-]>aside>q, #newsletter-signup-short-form, .tab-bar-fixed',
    article_theme_background_selector: '.l-root, .l-main-content',
    article_theme_foreground_selector: '.c-page-title, .c-byline, .e-image__meta, .p-dek' //, .p-rock-head',
  },
  {
    name: 'Technology Review',
    origin: 'https://www.technologyreview.com',
    dark_theme: 0,
    hide_selector: '.overlayFooter__wrapper--3DhFn, .optanon-alert-box-wrapper, .stickystrap',
    article_hide_selector: '.navbar, .meter, .signup-wrapper, .subRail, .sliderAd, .paywallWrapper, .l-pullquote--3col',
    article_css: 'body {overflow: scroll}'
  },
  {
    name: 'The New Yorker',
    origin: 'https://www.newyorker.com',
    css: selector_for_elements_with_a_class_that_starts_with('Logo__logo___') + '{-webkit-filter: invert(70%) sepia(100%) hue-rotate(65deg) saturate(7)}',
    count_words: {append: selector_for_elements_with_a_class_that_starts_with('ArticleHeader__metaInfo___'), subject: '#articleBody'},
    //article_css: '.single-post #articleBody p a, .single-post #articleBody .gallery-caption a, .single-post #articleBody u, .articleBody p a, .articleBody .gallery-caption a, .articleBody u, .author-masthead p a, .author-masthead .gallery-caption a, .author-masthead u {text-shadow: none; background: none}',
    homepage_css: 'h3 {visibility: visible}' + selector_for_elements_with_a_class_that_starts_with('SiteHeader__siteHeader___') + '{position: absolute}',
    article_css: 'a {text-shadow: none; background: none} body>header {position: static}' + selector_for_elements_with_a_class_that_starts_with('ArticleHeader__articleHeader___') + '{border-bottom-width: 0}' + selector_for_elements_with_a_class_that_starts_with('PageContainer__pageContent___') + '{padding-top: 0}',
    //article_hide_selector: '.social-module, .strongbox-promo-wrapper, .social-hover, .footer-content, #recirc-pos-2',
    article_hide_selector: '.ad, .full-bleed-ad, .interstitial,' + selector_for_elements_with_a_class_that_starts_with('persistent- MainHeader__topBarItems___ MainHeader__topBar MainHeader__collapsed___ Layout__social___ RecirculationMostPopular__default___ GrowlerFailsafe__'),
    article_theme_background_selector: '.page--article, article>header, .hamburger-dropdowns-navigation__top-level, footer',
    //article_theme_foreground_selector: 'article>header .title, article>header time.blog-post-date, .articleBody p, .caption, .author-masthead, .hero-image-caption',
    article_theme_foreground_selector: 'p, h1, .caption, blockquote, p:first-child:first-letter,' + selector_for_elements_with_a_class_that_starts_with('ArticleBody__articleBody___ ImageCaption__caption___ ArticleContributors__bio___ ArticleHeader__dek___'),
    homepage_hide_selector: '.fixed-topnav, iframe, #strongbox-promo',
    homepage_theme_background_selector: '#main, .logo-container,' + selector_for_elements_with_a_class_that_starts_with('MainHeader__mainHeader___ MainHeader__mainHeader___:after MainHeader__topBar___:after'),
    homepage_theme_foreground_selector: selector_for_elements_with_a_class_that_starts_with('Hero__dek___ River__dek___ Card__dek___ Byline__by___ RecirculationMostPopular__counter___ RecirculationMostPopular__byLine___ RecirculationMostPopular__title___ Card__timestamp___ ImageCaption__cartoon Video__description___'),
    hide_selector: 'iframe, ' + selector_for_elements_with_a_class_that_starts_with('MainHeader__partial___ Ad__header___'),
    customize () {
      //if (location_href.indexOf('?') !== -1) alert(location_href)
      if (page_level === 2) {
        /*
        //debug(390, 1, location_href)
        let element
        for (element of jQuery('body>header')) {
          //debug(390, 2, element)
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
    name: 'IMDB',
    origin: 'https://www.imdb.com',
    dark_theme: 0,
    article_hide_selector: '.nas-slot, .dipc-page-background>.ipc-page-content-container',
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
    article_css: '.wmaster_words_count span.nbsp {display: inline; font-size: 100%}', // the site has "span {display: block}"! //'#sub-header {margin-top: 50px}',
    //article_hide_selector: '.managed-ad, .appendedAds',
    article_theme_background_selector: '#content',
    article_theme_foreground_selector: '.article-body',
    count_words: {append: '.article-date', subject: '.article-body'},
  },
  {
    name: 'Detroit Free Press',
    origin: 'https://www.freep.com',
    article_hide_selector: '.close-wrap, .utility-bar-wrap',
    article_css: '.site-header-inner-wrap-fixed {position: static}',
  },
  {
    name: 'The Boston Globe',
    origin: 'https://www.bostonglobe.com',
    article_theme_foreground_selector: '.article-header__headline',
    article_hide_selector: '#right, .meter-paywall--visible, .meter-progress-bar',
    article_css: 'body {overflow: visible; position: static}',
  },
{
  name: 'Entrepreneur',
  origin: 'https://www.entrepreneur.com',
  article_theme_background_selector: '.container, .leftside, .leftside .tags, .art-topics .pl, .art-topics-cont',
  article_theme_foreground_selector: '.articletext',
  article_css: '#nvh.stick, .sticky {position: static}',
},
{
  name: 'Salon',
  origin: 'https://www.salon.com',
  article_theme_background_selector: '.mainContent .mainInner, blockquote',
  article_theme_foreground_selector: '.page-article p',
  hide_selector: '#adblockModal, #nav-right, #search-form',
  css: 'body {overflow: scroll}',
  article_hide_selector: '#social_total, #up-next, .right-rail, #topic_section, .explore_section, #newsletter-form, footer',
  article_css: '#nav-wrapper {position: static} .page-article p, a {font-family: sans-serif}',
  count_words: {append: '.writer-container', subject: 'article'},
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
    article_hide_selector: '#kampyleInviteContainer, .pane-wu-fullscreenweather-ad-box-atf, .region-ad-top',
    dark_theme: 0,
  },
  {
    name: 'NZBIndex',
    origin: 'https://www.nzbindex.com',
    article_hide_selector: '#ir',
    dark_theme: 0,
  },
  {
    name: 'Ars Technica',
    origin: 'https://arstechnica.com',
    alternate_origins: 'https://arstechnica.co.uk',
    hide_selector: '.site-header.is_stuck.scrolled-up',
    article_hide_selector: '.ad_wrapper, .ars-sub-app, .share-links, .pullbox, #article-footer-wrap, #action_button_container, .superscroll-pager',
    article_css: 'figure {background: white} .site-wrapper {background-color: transparent}', // if set to black, this hides images in Chrome as of 6/19/2017
    count_words: {append: '.byline', subject: '.article-content'},
  },
  {
    name: 'The Baltimore Sun',
    origin: 'https://www.baltimoresun.com',
    css: '.trb_nh {position: absolute} .trb_nh_lw {border-bottom-width: 0} header {position: static}',
    hide_selector: '.trb_bnn, .met-promo',
    article_hide_selector: '.col-desktop-6, #reg-overlay, .trb_nls_c, .trb_mh_adB, .trb_gptAd, .slider, .trb_ar_sponsoredmod, [data-content-type="tweetembed"]', //, aside:has([data-content-kicker="Related"])',
    article_theme_background_selector: '.crd',
    theme_background_selector: '.trb_nh_uw, .trb_nh_lw, .trb_allContentWrapper',
    article_theme_foreground_selector: 'h1, p, .caption-text, .trb_ar_page>ol, .trb_ar_page>p, .trb_ar_page>ul, .trb_ar_page[data-content-page="1"]>p:first-child:first-letter',
    article_css: 'html, body {overflow: visible}',
    homepage_theme_foreground_selector: '.trb_outfit_group_list_item_brief',
    count_words: {append: '.trb_ar_dateline', subject: '[itemprop=articleBody'},
    //count_words: {append: '.byline', subject: '.article-body'},
    customize () {
      //body.css('overflow', 'visible')
      jQuery('aside:has([data-content-kicker="Related"])').hide() // This would be in article_hide_selector, but that fails enigmatically as of 2017-05-30
      let img
      for (img of jQuery('img[data-baseurl]')) img.src = img.dataset.baseurl
    },
  },
  {
    name: 'Los Angeles Times',
    origin: 'https://www.latimes.com',
    css: 'body {overflow: visible} .Page-header-wrapper {position: static} .trb_nh {position: absolute} .trb_nh_l, .trb_nh_sm_o_svg {fill:' + theme_foreground_color + '} .trb_nh_unh_hr {border-color:' + theme_foreground_color + '}',
    article_hide_selector: '.ActionBar, .trb_nh_lw, .trb_mh_adB, .trb_sc, .trb_ar_bc, .trb_gptAd.trb_ar_rail_ad, .trb_embed[data-content-type=story], .wf_interstitial_link, [name="support-our-journalism"], [data-content-type="pullquote"], .journo-promo, .promo, .trb_rhsAdSidebar, .pb-f-list-nav-ticker',
    theme_background_selector: '.trb_allContentWrapper, .card',
    theme_foreground_selector: '.trb_nh_un_hw:before',
    article_theme_background_selector: '.trb_article, .Page-header, .ArticlePage .Page-ad-margins',
    article_theme_foreground_selector: '.h7, .h7 a, h1, h1 a, h2, h2 a, h3, h3 a, h4, h4 a, h5, h5 a, h6, h6 a, article p, article ul, .caption-text', //, .dropcap, .trb_ar_page[data-content-page="1"]>p:first-child:first-letter, #story>p:first-child:first-letter',
    article_css: '.PageLogo-image {filter: invert(70%) sepia(100%) hue-rotate(65deg) saturate(7)} .trb_mh {margin-top: 70px} a:link[   href^="/topic/"] {color: ' + theme_autolink_foreground_color + '} a:link:hover[href^="/topic/"] {color: ' + theme_link_foreground_color + '} a:visited[href^="/topic/"] {color: ' + theme_autolink_visited_foreground_color + '} a:visited:hover[href^="/topic/"] {color: purple}',
    hide_selector: '.met-promo',
    count_words: {append: '.trb_ar_dateline', subject: 'div[itemprop="articleBody"]', nbsp_size: '100%'},
    unwanted_query_fields: 'bn',
    customize () {
      const chunks = jQuery('div[itemprop="articleBody"] p')
      //debug(41, chunks)
      //window.c = []
      let chunk
      for (chunk of chunks) {
        const children = chunk.children
        const debug = false
        if (children.length === 1) {
          if (debug) debug(42)
          const child = children [0]
          if (debug) debug(43, child)
          if (child.tagName === 'STRONG') {
            if (debug) debug(44)
            const child_text = direct_text_content(child)
            if (debug) debug(45, child_text)
            if (child_text === '') {
              if (debug) debug(46)
              const grandchildren = child.children
              if (debug) debug(47, grandchildren)
              if (grandchildren.length === 1) {
                if (debug) debug(48)
                const grandchild = grandchildren [0]
                if (debug) debug(49, grandchild)
                if (grandchild.tagName === 'A') {
                  if (debug) debug(50)
                  const grandchild_text = direct_text_content(grandchild)
                  if (debug) debug(51)
                  if (grandchild_text [grandchild_text.length - 1] === '»') {
                    if (debug) debug(52)
                    jQuery(chunk).addClass('wf_interstitial_link')
                  }
                }
              }
            }
          }
        }
        //debug(45, this, direct_text_content(this), this_children)
        //if (direct_text_content(this) === '' &&
      }
      //debug(47, direct_text_content(content_body_element_children [61]))
      //debug(49, direct_text_content(content_body_element_children [62]))
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
    article_theme_foreground_selector: 'p',
    article_hide_selector: '[data-adloader-networktype]',
    //article_css: '.fixed-top {position: absolute}',
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
    name: 'Motley Fool',
    origin: 'https://www.fool.com',
    article_css: '.content-container {margin-top: 0; padding-top: 0}',
    article_hide_selector: '.fool-tophat-container, header.navigation, .article-page-end',
  },
  {
    name: 'Wired',
    origin: 'https://www.wired.com',
    article_css: '.header {position: absolute} .nav--design.nav--is-active {background-color: #344} .article-body-component a {border-bottom-width: 0; box-shadow: none}',
    article_hide_selector: '.persistent-bottom, .sticky-box, .ad-stickyhero, .paywall-container-COMPONENT',
    article_theme_background_selector: '.article-main-component, .header, .logo-bar--design',
    article_theme_foreground_selector: '.article-body-component, .title, .brow-component, .content-header-component .meta-list li, .lede, .caption-component__credit, .article-body-component h3',
  },
  {
    name: 'Arxiv',
    origin: 'https://arxiv.org',
    dark_theme: 0,
    hide_selector: '#pendo-base',
  },
  {
    name: 'Webull',
    origin: 'https://www.webull.com',
    article_css: '#common_head {position: absolute}',
  },
  {
    name: 'Union of Concerned Scientists',
    origin: 'http://www.ucsusa.org',
    alternate_origins: 'http://blog.ucsusa.org http://allthingsnuclear.org',
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
    article_theme_foreground_selector: '.article__content p',
  },
  {
    name: 'Seattle Times',
    origin: 'https://www.seattletimes.com',
    article_hide_selector: '.ad-container, .global-header, .modals, .article-share, #userMessagingInset',
    article_css: '#container {filter: blur(0px)} body {position: static}',
    article_theme_foreground_selector: 'h1, h2, h3, h4, h5, h6, .article-deck, .article-dateline, .article-figure-caption',
  },
  {
    name: 'Wikipedia',
    origin: 'https://en.wikipedia.org',
    article_hide_selector: '#frb-inline, #frb-nag, .cn-fundraising',
    dark_theme: 0,
  },
  {
    name: 'Rolling Stone',
    origin: 'https://www.rollingstone.com',
    article_theme_background_selector: '.article-main, .card-container',
    article_theme_foreground_selector: 'p, .article-body-content-main-photo-caption, .content-byline, .content-title',
    article_hide_selector: '#header, .module-trending-bar, .module-social-sharing',
    article_css: 'body {padding-top: 0} .card-container {border: none}',
    //dark_theme: 0
  },
  {name: 'Stack Overflow'         , origin: 'http://stackoverflow.com'             , dark_theme: 0},
  {name: 'Review of Ophthalmology', origin: 'https://www.reviewofophthalmology.com'},
  {name: 'The Ringer'             , origin: 'https://theringer.com'                , article_hide_selector: '.js-postShareWidget, .metabar--spacer', unwanted_classes: 'u-fixed metabar'},
  {name: 'Reason'                 , origin: 'http://reason.com'                    , article_css: 'html, body {font-family: Georgia}'},
  {name: 'Spectator'              , origin: 'https://www.spectator.co.uk'          , dark_theme: 0, article_css: '.floatyFloaty {position: static}', article_hide_selector: '.article-promo'},
  {name: 'Local wayback'          , alternate_prefixes: 'file:////wayback/', append_loaded_date: false, count_words_subject: false},
]
const sites_data_by_prefix = {}
//let site_data
for (site_data of sites_data) {
  const unwanted_query_fields = site_data.unwanted_query_fields
  let prefixes
  if (site_data.origin) prefixes = [site_data.origin]
  else        prefixes = []
  if (site_data.alternate_origins ) {
    //debug(746, 50, site_data.alternate_origins)
    const alternate_origins_split  = site_data.alternate_origins .split(/\s+/)
    site_data.alternate_origins_split  = alternate_origins_split
    prefixes = prefixes.concat(alternate_origins_split )
  }
  if (site_data.alternate_prefixes) {
    const alternate_prefixes_split = site_data.alternate_prefixes.split(/\s+/)
    site_data.alternate_prefixes_split = alternate_prefixes_split
    prefixes = prefixes.concat(alternate_prefixes_split)
  }
  if (site_data.alternate_homepages) {
    const alternate_homepages_split = site_data.alternate_homepages.split(/\s+/)
    site_data.alternate_homepages_split = alternate_homepages_split
    prefixes = prefixes.concat(alternate_homepages_split)
  }
  if (unwanted_query_fields) {
    site_data.unwanted_query_fields_split = unwanted_query_fields.split(/\s+/)
  }
  //debug(34, site_data.unwanted_query_fields_split)
  //debug(35, prefixes)
  let prefix
  for (prefix of prefixes) {
    if (sites_data_by_prefix.hasOwnProperty(prefix)) console.log('warning: URL prefix "' + prefix + '" is a duplicate!')
    else sites_data_by_prefix [prefix] = site_data
  }
  //debug(74, site_data.append_loaded_date)
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
    //debug(76, site_data.append_loaded_date)
}
  //debug(36, sites_data_by_prefix)
  //window.sites_data = sites_data
//console.table(sites_data)

function in_iframe () {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}
/* eslint-disable */

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

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
		date = date ? new Date(date) : new Date;
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
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};

/* eslint-enable */

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
      (((0xE1 <= bytes[i    ] && bytes[i    ] <= 0xEC) || bytes[i] === 0xEE || bytes[i] === 0xEF) &&
        (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) && (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)) || // straight 3-byte
      (bytes[i] === 0xED && (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x9F) && (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)) // excluding surrogates
    ) {
      i += 3
      continue
    }
    if (
      (bytes[i] === 0xF0 && (0x90 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) && (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) && (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)) || // planes 1-3
      ((0xF1 <= bytes[i    ] && bytes[i    ] <= 0xF3) && (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
       (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) && (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)) || // planes 4-15
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


/* eslint-disable no-unused-vars */
function makeRequest (url) {
/* eslint-enable no-unused-vars */
  var result = {}
  result.url = url
  debug(221, 10, url)
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
        debug(221, 50, url)
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
      //debug(294, stylesheet)
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
    //debug(380, 10, element, selector, result)
  }

    //TODO: not supporting 2nd argument for selecting pseudo elements
    //TODO: not supporting 3rd argument for checking author style sheets only

  function ajax_data_handler (jqXHR, textStatus) {
    //debug(380, 44, jqXHR, textStatus)
  }

  wf_getMatchedCSSRules = element => {
    var style_sheets
    var sheet //sheet_media
    var rules
    var rule
    var result = []
      // get stylesheets and convert to a regular Array
    style_sheets = Array.from(window.document.styleSheets)
    //debug(380, 20, element, style_sheets)

      // assuming the browser hands us stylesheets in order of appearance
      // we iterate them from the beginning to follow proper cascade order
    while (true) {
      sheet = style_sheets.shift()
      //debug(380, 30, sheet)
      if (!sheet) break
        // get the style rules of this sheet
      rules = getSheetRules(sheet)
      if (rules.length) {
        //debug(380, 40, rules)
      } else {
        //debug(380, 45, rules)
        jQuery.ajax(sheet.href, {complete: ajax_data_handler, type: 'GET'})
      }
      while (true) {                   // loop the rules in order of appearance
        rule = rules.shift()
        //debug(380, 50, rule)
        if (!rule) break
          // if this is an @import rule
        const rule_sheet = rule.styleSheet
        //debug(380, 55)
        if (rule_sheet) {
          //debug(380, 60, rule_sheet)
          rules = getSheetRules(rule_sheet).concat(rules)            // insert the imported stylesheet's rules at the beginning of this stylesheet's rules
          continue                                                   // and skip this rule
        } else if (rule.media) {                           // if there's no stylesheet attribute BUT there IS a media attribute it's a media rule
          //debug(380, 70, rule.media)
          rules = getSheetRules(rule).concat(rules)            // insert the contained rules of this media rule to the beginning of this stylesheet's rules
          continue                                          // and skip it
        }
        //debug(380, 75)
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
  //debug(380, 160)
  getMatchedCSSRules = window.getMatchedCSSRules
  if (typeof getMatchedCSSRules === 'function') {
    //debug(380, 170)
    window.native_getMatchedCSSRules = getMatchedCSSRules
    document.native_getMatchedCSSRules = getMatchedCSSRules
  } else {
    //debug(380, 180)
    getMatchedCSSRules = window.wf_getMatchedCSSRules
    window.getMatchedCSSRules = getMatchedCSSRules
  }
  document.getMatchedCSSRules = getMatchedCSSRules
  //debug(380, 190)
}


function regularize_links (my_window = window, my_origin) {

  let url
  debug(394, 10, my_window, my_origin)
  const $anchors = my_window.jQuery('a')
  let anchor_index
  let anchor
  let anchors_array = Array.from($anchors)
  //debug(394, 16, anchors_array)
  let anchors_array_entries = anchors_array.entries()
  //debug(394, 18, anchors_array_entries)
  for ([anchor_index, anchor] of anchors_array_entries) {
    debug(394, 20, anchor_index, anchor, anchor.href)
    let old_href = anchor.href
    debug(394, 23, old_href)
    if (1 || old_href.hasOwnProperty('startsWith')) {
      debug(394, 24)
      if (old_href.startsWith('file://')) {
        old_href = old_href.substr(7)
        debug(394, 25, old_href)
      }
      debug(394, 26)
      if (old_href.startsWith('/')) {
        debug(394, 30, old_href)
        if (my_origin) {
          old_href = my_origin + old_href
          debug(394, 32, old_href)
        } else {
          old_href = my_window.location.origin + old_href
          debug(394, 34, old_href)
        }
      }
      debug(394, 37)
      anchor.href = old_href
    }
    if (!old_href) continue
    try {
      debug(394, 40)
      url = new my_window.URL(old_href)
    } catch (error) {
      debug(394, 50)
      if (error instanceof TypeError) {
        debug(394, 60)
        continue
      } else {
        debug(394, 70)
        throw error
      }
    }
    //my_window.jQuery.data(anchor, 'url_object', url)
    //anchor.url_object = url
    debug(394, 80, anchor_index, url, url.href)
    //if (typeof href === 'undefined') return
    const origin = anchor.origin
    const site_data = sites_data_by_prefix [origin]
    debug(394, 85) //, origin, site_data)
    if (!site_data) continue
    const unwanted_query_fields_split = site_data.unwanted_query_fields_split
    debug(394, 87, unwanted_query_fields_split)
    if (!unwanted_query_fields_split) continue
    //const unwanted_query_fields_split_length = unwanted_query_fields_split.length
    const query_string_index = old_href.indexOf('?')
    debug(394, 89, query_string_index)
    if (query_string_index !== -1) {
      debug('394, 90')
      //let query_string = old_href.substring(query_string_index); // the query string without the '?' that delimits it
      let query_string = url.search
      //let new_href = old_href.substring(0, query_string_index); // the url without the query string or the '?' that delimits it
      const query_params = url.searchParams
      debug(394, 100, query_params.toString())
      let field
      debug(394, 101, unwanted_query_fields_split)
      for (field of unwanted_query_fields_split) {
        query_params.delete(field)
        debug(394, 110, field, query_params.toString())
      // BUG: would be nice to break if query_params is empty
      }
      debug(394, 120, query_params.toString())
      query_string = query_params.toString()
      debug(394, 130, query_string)
      //if (query_string.length) new_href += '?' + query_string
      //anchor.href = new_href
      url.search = query_string
      debug(394, 131, url.href)
      debug(394, 132, url)
      anchor.href = url.href
      debug(394, 133, anchor.href)
      debug(394, 134, anchor)
    }
    debug(394, 140, anchor.href)
  }
  debug(394, 200, my_window.$anchors.length)
}


function nyt_o (my_window = window, my_origin) {

  let url
  my_origin = 'https://www.nytimes.com'
  debug(494, 10, my_window, my_origin)
  const $anchors = my_window.jQuery('a')
  let anchor_index
  let anchor
  let anchors_array = Array.from($anchors)
  //debug(494, 16, anchors_array)
  let anchors_array_entries = anchors_array.entries()
  //debug(494, 18, anchors_array_entries)
  for ([anchor_index, anchor] of anchors_array_entries) {
    debug(494, 20, anchor_index, anchor, anchor.href)
    let old_href = anchor.href
    debug(494, 23, old_href)
    if (1 || old_href.hasOwnProperty('startsWith')) {
      debug(494, 24)
      if (old_href.startsWith('file://')) {
        old_href = old_href.substr(7)
        debug(494, 25, old_href)
      }
      debug(494, 26)
      let target = '/d/wayback/nytimes_opinion/null'
      if (old_href.startsWith(target)) {
        old_href = old_href.substr(target.length)
        debug(494, 30, old_href)
        if (my_origin) {
          old_href = my_origin + old_href
          debug(494, 32, old_href)
        } else {
          old_href = my_window.location.origin + old_href
          debug(494, 34, old_href)
        }
      }
      debug(494, 37)
      anchor.href = old_href
    }
    if (!old_href) continue
    try {
      debug(494, 40)
      url = new my_window.URL(old_href)
    } catch (error) {
      debug(494, 50)
      if (error instanceof TypeError) {
        debug(494, 60)
        continue
      } else {
        debug(494, 70)
        throw error
      }
    }
    debug(494, 140, anchor.href)
  }
  debug(394, 200, my_window.$anchors.length)
}


function href_to_site_data (href) {

  const href_origin = new URL(href).origin
  let result
  //debug(225, 10, href)
  let test_site_data
  for (test_site_data of sites_data) {
    const test_site_origin = test_site_data.origin
    //debug(225, 30, test_site_data.name, href_origin, test_site_origin)
    if (!test_site_origin) continue
    //debug(225, 35)
    if (test_site_origin.endsWith('/')) console.log('wmaster: warning: origin "' + test_site_origin + '" ends in a slash')
    //debug(225, 36)
    if (test_site_origin && href_origin === test_site_origin) {
      //debug(225, 40)
      result = test_site_data
      if (href === href_origin + '/') {
        //debug(225, 50)
        page_level = 0
      } else {
        //debug(225, 60)
        page_level = 2
      }
      break
    }
    //debug(225, 100, result)
    let alternate
    if (test_site_data.alternate_homepages) {
      //debug(225, 110)
      for (alternate of test_site_data.alternate_homepages_split) {
        //debug(225, 120, href, alternate)
        if (href === alternate) {
          //debug(225, 130)
          result = test_site_data
          page_level = 0
          break
        }
      }
      if (result) break
    }
    //debug(225, 200, href_origin, test_site_data.origin)
    if (test_site_data.origin && href_origin === test_site_data.origin) {
      //debug(225, 210)
      result = test_site_data
      page_level = 2
      break
    }
    //debug(225, 300)
    if (test_site_data.alternate_prefixes) {
      //debug(225, 310)
      for (alternate of test_site_data.alternate_prefixes_split) {
        //debug(225, 320, alternate)
        if (href.startsWith(alternate) && href !== alternate) {
          //debug(225, 330)
          result = test_site_data
          page_level = 0
          break
        }
      }
      //debug(225, 340, result)
      if (result) break
    }
    //debug(225, 400)
    if (test_site_data.alternate_origins) {
      //debug(225, 410)
      for (alternate of test_site_data.alternate_origins_split) {
        //debug(225, 420, alternate)

      ////debug(81, alternate, href_origin, href)
        if (href.startsWith(alternate)) {
          //debug(225, 430)
          result = test_site_data
          if (href === alternate) {
            page_level = 1
          } else {
            page_level = 2
          }
          break
        }
      }
      if (result) break
    }
    //debug(225, 500)
  }
  return result
}

if (is_node) {
  module.exports.direct_text_content                                 = direct_text_content
  module.exports.dateFormat                                          = dateFormat
  module.exports.sites_data                                          = sites_data
  module.exports.sites_data_by_prefix                                = sites_data_by_prefix
  module.exports.regularize_links                                    = regularize_links
  //module.exports.selector_for_elements_with_a_class_that_starts_with = selector_for_elements_with_a_class_that_starts_with
} else {
  jQuery(() => {
    //alert(8)
    //console.log ('wmaster running')
    //return
    $body.append(new_html)
    //$main_dialog                            = jQuery('#' + main_dialog_id)
    //const $main_dialog_word_count                 = jQuery('#' + main_dialog_word_count_id)
    //const $main_dialog_close                      = jQuery('#' + main_dialog_close_id)
    //$main_dialog_cli                        = jQuery('#' + main_dialog_cli_id)
    const body                                    = $body [0]
    const wayback_timestamp_str                   = body.dataset.wf_web_filter_wayback_timestamp
    $main_dialog_word_count = jQuery(main_dialog_word_count_selector)
    $main_dialog_cli = jQuery(main_dialog_cli_selector)
    $main_dialog = jQuery(main_dialog_selector)
    $main_dialog_close = jQuery(main_dialog_close_selector)
    //debug(382, 20, $main_dialog_cli)
    //$main_dialog.hide()
    $main_dialog_cli.terminal((command) => {
      const parsed_command = jQuery.terminal.parse_command(command)
      //debug(382, 30, command, parsed_command)
      const parsed_command_name = parsed_command.name
      const parsed_command_args = parsed_command.args
      const parsed_command_args_0 = parsed_command_args [0]
      let element
      if (parsed_command_name === 'fp') {
        const $fixed_or_sticky_elements = jQuery('*').filter((index, element) => {
          const position = jQuery(element).css('position')
          return position === 'fixed' || position === 'sticky'
        })
        //debug(382, 40, $fixed_or_sticky_elements)
        for (element of $fixed_or_sticky_elements) {
          const matched_rules = wf_getMatchedCSSRules(element)
          //debug(382, 50, element, matched_rules)
          let rule
          if (matched_rules) {
            for (rule of matched_rules) {
              //debug(382, 60, rule)
              if (rule.style.position === 'fixed' || rule.style.position === 'sticky') {
                //debug(382, 70, rule)
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
        //debug(382, 80, parsed_command_args_0)
        process_page()
      } else  if (parsed_command_name === 'rl') {
        //debug(382, 82, parsed_command_args_0)
        regularize_links()
      } else  if (parsed_command_name === 'nyto') {
        //debug(382, 82, parsed_command_args_0)
        nyt_o()
      } else  if (parsed_command_name === 'wa') {
        //debug(382, 85, parsed_command_args_0)
        if (parsed_command_args_0 !== '') {
          throw new Error('args not implemented')
        }

      } else  if (parsed_command_name === 'wc') {
        //debug(382, 90, parsed_command_args_0)
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



    add_getMatchedCSSRules_to_window()

    function dark_theme (aggressiveness_level) { //, target) {
      //body.css({'background-color': '' + theme_background_color + ' !important; color: ' + theme_foreground_color + ' !important'})
      //debug(847, 10, 'dark_theme_' + aggressiveness_level)
      $body.addClass('dark_theme dark_theme_' + aggressiveness_level)
      if (!aggressiveness_level) return
      if (aggressiveness_level > 1) document.styleSheets[0].addRule('*', 'background-color: ' + theme_background_color + ' !important; color: ' + theme_foreground_color + ' !important')
      //raw_site_css += target + '{' + theme_background_rule + theme_foreground_rule + '}'
      //debug(847, 100, theme_background_rule, theme_foreground_rule, raw_site_css)
      raw_site_css += '.dark_theme {' + theme_background_rule + theme_foreground_rule + '} ::-webkit-scrollbar {height: 2px; width: 2px} ::-webkit-scrollbar-track {background:' + theme_background_color + '} ::-webkit-scrollbar-thumb {background: #f00} '
      //debug(847, 101, theme_background_rule, theme_foreground_rule, raw_site_css)
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
      debug(387, 30, sub_element_tags_str, sub_element_tags)
      let sub_element_tag
      for (sub_element_tag of sub_element_tags) {
        link_and_sub_element_selector    += ',' +    link_selector + ' ' + sub_element_tag
        visited_and_sub_element_selector += ',' + visited_selector + ' ' + sub_element_tag
        debug(387, 40, link_and_sub_element_selector)
      }
      //link_and_sub_element_selector    += '{color:' +         theme_link_foreground_color + '}'
      //visited_and_sub_element_selector += '{color:' + theme_link_visited_foreground_color + '}'
      const new_css = ' a {text-decoration: none}' + link_and_sub_element_selector + '{color:' + theme_link_foreground_color + '}' + visited_and_sub_element_selector + '{color:' + theme_link_visited_foreground_color + '}'
      debug(387, 60, new_css)
      raw_site_css += new_css
      debug(387, 70, raw_site_css)
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
      let subject_selector
      for (subject_selector of subject_selectors) {
        const $subject_elements      = jQuery(subject_selector)
        debug('debug_word_count', 10, subject_selector, $subject_elements)
        let grafs = jQuery('')
        total_words_count_by_selector.push(0)
        let graf_containers = []
        let element
        for (element of $subject_elements) {
          if (element.tagName === 'P' || element.tagName === 'LI') {
            grafs = grafs.add(element)
            all_grafs = all_grafs.add(element)
          } else {
            graf_containers.push(element)
          }
        }
        debug('debug_word_count', 20, JSON.stringify(Array.from(grafs)), grafs.size)
        const contained_grafs = jQuery(graf_containers).find('p, li')
        debug('debug_word_count', 30, contained_grafs, contained_grafs.length)
        let contained_graf
        for (contained_graf of contained_grafs) {
          debug('debug_word_count', 40, contained_graf, grafs)
          grafs = grafs.add(contained_graf)
          debug('debug_word_count', 50, grafs)
          all_grafs = all_grafs.add(contained_graf)
        }
        //grafs = grafs.concat(contained_grafs)
        debug('debug_word_count', 60, grafs)
        //BUG: set arithmetic: here we would add all the elements of grafs to all_grafs -- if the language had a built-in way to do so. Since it doesn't, we have maintained all_grafs as we went along.
        grafs_by_selector [subject_selector] = grafs
      }
      debug('debug_word_count', 70, grafs_by_selector)
      let graf
      for (graf of all_grafs) {
        let $graf = jQuery(graf)
        let graf_text = $graf.text()
        let word
        if (graf_text.length) {
          const graf_text_split = graf_text.split(/\s+/)
          debug('debug_word_count', 73, graf_text, graf_text_split)
          let graf_words_count = 0
          for (word of graf_text_split) {
            debug('debug_word_count', 75, word)
            if (word) {
              debug('debug_word_count', 76)
              graf_words_count++
            }
          }
          debug('debug_word_count', 78, graf_words_count)
          $graf.data(graf_words_count_name, graf_words_count)
          total_words_count += graf_words_count
          let subject_selector_index
          let subject_selector
          for ([subject_selector_index, subject_selector] of subject_selectors.entries()) {
            debug('debug_word_count', 80, graf, subject_selector, grafs_by_selector [subject_selector])
            if (jQuery.inArray(graf, grafs_by_selector [subject_selector]) !== -1) {
              debug('debug_word_count', 90)
              total_words_count_by_selector [subject_selector_index] += graf_words_count
            }
          }
        }
      }
      debug('debug_word_count', 110, total_words_count, total_words_count_by_selector)
      let chosen_subject_selector_index, chosen_subject_selector, chosen_words_count
      for ([chosen_subject_selector_index, chosen_subject_selector] of subject_selectors.entries()) {
        chosen_words_count = total_words_count_by_selector [chosen_subject_selector_index]
        if (chosen_words_count) break
      }
      let chosen_grafs = grafs_by_selector [chosen_subject_selector]
      let chosen_words_count2 = 0
      debug('debug_word_count', 120, grafs_by_selector, chosen_grafs)
      if (show_graf_counts) {
        const verbose = show_graf_counts > 1
        html_graf_prefix = html_prefix + graf_words_count_name + '">' + settings.graf_prefix
        let graf_index = 1
        let graf
        for (graf of all_grafs) {
          let $graf = jQuery(graf)
          let new_html = html_graf_prefix
          debug('debug_word_count', 130, new_html)
          const is_chosen = jQuery.inArray(graf, chosen_grafs) !== -1
          const graf_words_count = $graf.data(graf_words_count_name)
          if (is_chosen) {
            if (verbose) {
              if (typeof graf_words_count === 'undefined') {
                new_html += '&para;empty'
              } else {
                new_html += `&para;${graf_index}:&nbsp;` // new_html += '&para' + (graf_index) + ':&nbsp;'
                graf_index++
              }
            }
          }
          debug('debug_word_count', 140, new_html)
          if (typeof graf_words_count !== 'undefined') {
            if (is_chosen) {
              new_html += graf_words_count + html_infix
              debug('debug_word_count', 150, graf_words_count, new_html)
              chosen_words_count2 += graf_words_count
              if (verbose) new_html += ' (' + chosen_words_count2 + ' total)'
            } else {
              if (verbose) new_html += graf_words_count + uncounted_html_infix
            }
            debug('debug_word_count', 160, chosen_words_count2, new_html)
          }
          new_html += html_suffix
          debug('debug_word_count', 170, new_html)
          $graf.append(new_html)
        }
        debug('debug_word_count', 175, chosen_words_count, chosen_words_count2)
        if (chosen_words_count2 !== chosen_words_count) throw new Error(`chosen_words_count=${chosen_words_count}, chosen_words_count2=${chosen_words_count2}`) // if (chosen_words_count2 !== chosen_words_count) throw new Error('chosen_words_count=' + chosen_words_count + ', chosen_words_count2=' + chosen_words_count2)
      }
      const output = html_prefix + total_words_count_name + '">' + settings.total_prefix + chosen_words_count + html_infix + html_suffix
      debug('debug_word_count', 176, output, append_selector)
      let append_element
      if (append_selector) {
        debug('debug_word_count', 177, $append_elements)
        for (append_element of $append_elements) {
          debug('debug_word_count', 180, append_element, append_element.className, output)
          jQuery(append_element).append(output)
        }
        debug('debug_word_count', 190, append_selector, $append_elements)
      } else if (!prepend_selector) {
        prepend_selector = 'body'
        $prepend_elements = jQuery(prepend_selector)
      }
      if (prepend_selector) {
        $prepend_elements.prepend(output)
        debug('debug_word_count', 200, prepend_selector, $prepend_elements)
      }
      debug('debug_word_count', 220, nbsp_size)
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
      debug('remove_fixed_positioning: called with settings: ' + settings)
      if (!settings.enable) return
      let element
      for (element of jQuery('*').not($main_dialog)) {
        const $element = jQuery(element)
        const old_position = $element.css('position')
        if (old_position === 'fixed' || old_position === 'sticky') {
          //debug('remove_fixed_positioning:', element)
          $element.css({'position': 'absolute'})
        }
      }
    }

    //main code starts here

    //debug(91)
    function process_page () {

      site_data = href_to_site_data(location_href)
      debug(846, 10, location_href, site_data)
      if (site_data) {
        console.log('wmaster: ' + site_data.name + ' detected')
        /* This could work but it's async; the callbacks don't get called until later. This could be fixed by forcing them to be synchronous, but that would cause a big delay.
        const fs = window.webkitRequestFileSystem
        let is_incognito
        fs(window.TEMPORARY, 100, function (fs) {
          debug(846, 14)
          is_incognito = false
        }, function (err) { // eslint-disable-line handle-callback-err
          debug(846, 16)
          is_incognito = true
        })
        */
        const is_incognito = !(document.documentElement.dataset.wBackground == "wBackground") // no delay, but requires the wbackground extension to be active and _not_ allowed in incognito
        debug(846, 20, is_incognito)
        if (!is_incognito) {
          debug(846, 21)
          if (site_data.customize) {
            debug(846, 22, site_data.customize)
            site_data.customize()
          }
          debug(846, 30, hide_selector, location, site_data.name)
        //debug(48.1, theme_foreground_selector)
          if (site_data.css) raw_site_css += site_data.css
          std_link_colors(site_data)
          debug(846, 50, site_data)
          regularize_links()
          for (const anchor of window.$anchors) {
            const first_sighting_numeric_str = anchor.dataset.wf_web_filter_first_sighting
            let first_sighting_str
            if (first_sighting_numeric_str) {
              const first_sighting = new Date(0)
              first_sighting.setSeconds(parseInt(first_sighting_numeric_str) + 3600)
              first_sighting_str = first_sighting.toString()
            } else {
              first_sighting_str = wayback_timestamp_str
            }
            if (first_sighting_str) {
              let title = 'First seen: ' + first_sighting_str
              const site_numeric_timestamp = anchor.dataset.wf_web_filter_site_timestamp
              if (site_numeric_timestamp) {
                const site_timestamp = new Date(0)
                site_timestamp.setSeconds(parseInt(site_numeric_timestamp) + 3600) // not sure why it's an hour off
                const site_timestamp_str = site_timestamp.toString()
                title = `\nSite stamp: ${site_timestamp_str}\n${title}`
              }
              anchor.setAttribute('title', title)
            }
          }
          const unwanted_classes = site_data.unwanted_classes
          let unwanted_class
          if (unwanted_classes) {
            const unwanted_classes_split = unwanted_classes.split(/\s+/)
            for (unwanted_class of unwanted_classes_split) {
              if (!unwanted_class.length) continue
            //debug(846, 80, jQuery('.' + unwanted_class))
              jQuery('.' + unwanted_class).removeClass(unwanted_class)
            }
          }
          remove_fixed_positioning(site_data)
          if (site_data.append_loaded_date) append_loaded_date(jQuery(site_data.append_loaded_date))
          debug(846, 100, theme_foreground_selector)
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
          debug(846, 110, page_level, hide_selector, raw_site_css)
        //debug(46, site_data.article_hide_selector)
          debug(846, 120, page_level, site_data.article_theme_background_selector, theme_background_selector)
          debug(846, 130, site_data.dark_theme)
          dark_theme(site_data.dark_theme)
          debug(846, 140, theme_foreground_selector)
          debug(846, 141, theme_foreground_rule)
          if (hide_selector            .length) raw_site_css += hide_selector                       + '{display: none}'
          if ($body.hasClass('dark_theme_1') || $body.hasClass('dark_theme_2')) {
            if (theme_selector           .length) raw_site_css += theme_selector           .join(',') + '{' + theme_background_rule + theme_foreground_rule + '}'
            if (theme_background_selector.length) raw_site_css += theme_background_selector.join(',') + '{' + theme_background_rule + '}'
            if (theme_foreground_selector.length) raw_site_css += theme_foreground_selector.join(',') + '{' + theme_foreground_rule + '}'
          }
          debug(846, 150, raw_site_css)
          debug(846, 151, cooked_site_css)
          const raw_site_css_split = raw_site_css.split('}')
          debug(846, 160, raw_site_css_split)
          let rule
          for (rule of raw_site_css_split) {
            debug(846, 170, rule)
            if (!rule) break
            const rule_split = rule.split('{')
            const declarations = rule_split [1]
            const declarations_split = declarations.split(';')
            debug(846, 180, declarations, declarations_split)
            let rule_text = rule_split [0] + ' {'
            let declaration_index = 0
            for (var declaration of declarations_split) {
              debug(846, 190, declaration_index, declaration)
              if (declaration) {
                if (declaration_index) rule_text += '; '
                rule_text += jQuery.trim(declaration) + ' !important'
              }
              declaration_index++
            }
            rule_text += '}'
            debug(846, 200, rule_text)
            cooked_site_css += ' ' + rule_text
          }
          const stylesheet = document.createElement('style')
          stylesheet.innerHTML = cooked_site_css
          debug(846, 210, cooked_site_css)
          document.body.appendChild(stylesheet)
          window.sss = stylesheet
          debug(846, 211, window.sss)
          window.f = jQuery('textarea')
        }
      }
    }


    function open_main_dialog () {

      debug(475, 10, document.hasFocus())
      if (!main_dialog_is_open) {
        debug(475, 15)
        $main_dialog.show()
        debug(475, 20, document.hasFocus())
        main_dialog_is_open = true
      }
      debug(475, 30, document.hasFocus())
      $main_dialog_cli_textarea.focus()
      debug(475, 40, document.hasFocus())
    }


    function close_main_dialog () {

      debug(475, 43, document.hasFocus())
      $main_dialog.hide()
      debug(475, 45, document.hasFocus())
      //$main_dialog.blur()
      debug(475, 47, document.hasFocus())
      $body.click() // BUG: is there a better way to get focus back to where is was when the page was first loaded, so that the arrow keys scroll the page?
      debug(475, 48, document.hasFocus())

      // Remove focus from any focused element
      if (document.activeElement) {
        document.activeElement.blur()
        debug(475, 49, document.hasFocus())
      }
      main_dialog_is_open = false
    }


    if (!in_iframe()) {
      process_page()

      document.onkeydown = event1 => {
        var event = event1 || window.event // for IE to cover IEs window object
        if (event.which === 192) { // grave accent -- open main dialog
          open_main_dialog()
          debug(475, 50)
          debug(475, 55)
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
        debug(475, 60)
        if (event.which === 13) {
          debug(475, 70)
        } else if (event.which === 27) {
          debug(475, 80)
          close_main_dialog()
        }
      })

      $main_dialog_close.on('click', event => {
        debug(475, 90)
        close_main_dialog()
      })

      $main_dialog_word_count.on('click', event => {
        debug(475, 110)
        count_words(site_data)
      })
    }
    //jQuery('#anti-white-flash-curtain').remove()

    jQuery.noConflict()
  })
}
