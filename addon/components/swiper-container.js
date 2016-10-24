import Ember from 'ember';
import layout from '../templates/components/swiper-container';

const params = Object.keys({
  // The follwing parameters are copied verbatim from idangerous.swiper.js
  eventTarget: 'wrapper', // or 'container'
  mode: 'horizontal', // or 'vertical'
  touchRatio: 1,
  speed: 300,
  freeMode: false,
  freeModeFluid: false,
  momentumRatio: 1,
  momentumBounce: true,
  momentumBounceRatio: 1,
  slidesPerView: 1,
  slidesPerGroup: 1,
  slidesPerViewFit: true, // fit to slide when spv "auto" and slides larger than container
  simulateTouch: true,
  followFinger: true,
  shortSwipes: true,
  longSwipesRatio: 0.5,
  moveStartThreshold: false,
  onlyExternal: false,
  createPagination: true,
  pagination: false,
  paginationElement: 'span',
  paginationClickable: false,
  paginationAsRange: true,
  resistance: true, // or false or 100%
  scrollContainer: false,
  preventLinks: true,
  preventLinksPropagation: false,
  noSwiping: false, // or class
  noSwipingClass: 'swiper-no-swiping', // :)
  initialSlide: 0,
  keyboardControl: false,
  mousewheelControl: false,
  mousewheelControlForceToAxis: false,
  useCSS3Transforms: true,
  // Autoplay
  autoplay: false,
  autoplayDisableOnInteraction: true,
  autoplayStopOnLast: false,
  // Loop mode
  loop: false,
  loopAdditionalSlides: 0,
  // Round length values
  roundLengths: false,
  // Auto Height
  calculateHeight: false,
  // Apply CSS for width and/or height
  cssWidthAndHeight: false, // or true or 'width' or 'height'
  // Images Preloader
  updateOnImagesReady: true,
  // Form elements
  releaseFormElements: true,
  // Watch for active slide, useful when use effects on different slide states
  watchActiveIndex: false,
  // Slides Visibility Fit
  visibilityFullFit: false,
  // Slides Offset
  offsetPxBefore: 0,
  offsetPxAfter: 0,
  offsetSlidesBefore: 0,
  offsetSlidesAfter: 0,
  centeredSlides: false,
  // Queue callbacks
  queueStartCallbacks: false,
  queueEndCallbacks: false,
  // Auto Resize
  autoResize: true,
  resizeReInit: false,
  // DOMAnimation
  DOMAnimation: true,
  // Slides Loader
  loader: {
    slides: [], // array with slides
    slidesHTMLType: 'inner', // or 'outer'
    surroundGroups: 1, // keep preloaded slides groups around view
    logic: 'reload', // or 'change'
    loadAllSlides: false
  },
  // One way swipes
  swipeToPrev: true,
  swipeToNext: true,
  // Namespace
  slideElement: 'div',
  slideClass: 'swiper-slide',
  slideActiveClass: 'swiper-slide-active',
  slideVisibleClass: 'swiper-slide-visible',
  slideDuplicateClass: 'swiper-slide-duplicate',
  wrapperClass: 'swiper-wrapper',
  paginationElementClass: 'swiper-pagination-switch',
  paginationActiveClass: 'swiper-active-switch',
  paginationVisibleClass: 'swiper-visible-switch'
});

export default Ember.Component.extend({
  layout,
  classNames: ['swiper-container'],
  swiper: false,

  swiperOptions: Ember.computed.apply(Ember, params.concat('pagination', 'navigation', 'vertical', 'centered', function() {
    let options = {};

    params.forEach((param) => {
      if (this.get(param) !== undefined) {
        options[param] = this.get(param);
      }
    });

    if (this.get('pagination') === true) {
      options.pagination = `#${this.get('elementId')} .swiper-pagination`;
      if (this.get('paginationClickable') !== false) {
        options.paginationClickable = true;
      }
    }

    if (this.get('navigation')) {
      options.nextButton = '.swiper-button-next';
      options.prevButton = '.swiper-button-prev';
    }

    if (this.get('vertical')) {
      options.direction = 'vertical';
    }

    if (this.get('centered')) {
      options.centeredSlides = true;
    }

    options.onSlideChangeEnd = this.slideChanged.bind(this);

    return options;
  })),

  updateTriggered: Ember.observer('updateFor', function() {
    Ember.run.once(this, this.get('swiper').update);
  }),

  forceUpdate(updateTranslate) {
    this.get('swiper').update(updateTranslate === undefined ? false : updateTranslate);
    this.get('swiper').slideTo(this.get('currentSlide'));
  },

  slideChanged(swiper) {
    let index = this.get('loop') ? Ember.$(swiper.slides).filter('.swiper-slide-active').attr('data-swiper-slide-index') : swiper.activeIndex;
    this.set('currentSlideInternal', index);
    this.set('currentSlide', index);

    if (this.get('onChange')) {
      this.sendAction('onChange', swiper.slides[swiper.activeIndex]);
    }
  },

  currentSlideModified: Ember.observer('currentSlide', function() {
    Ember.run.later(this, () => {
      if (this.get('currentSlide') !== this.get('currentSlideInternal')) {
        let index = this.get('currentSlide');

        if (this.get('loop')) {
          let swiper = this.get('swiper');
          index = Ember.$(swiper.slides).filter(`[data-swiper-slide-index=${this.get('currentSlide')}]`).prevAll().length;
        }

        this.get('swiper').slideTo(index);
        this.set('currentSlideInternal', this.get('currentSlide'));
      }
    });
  }),

  initSwiper: Ember.on('init', function() {
    Ember.run.schedule('afterRender', this, function() {
      this.set('swiper', new Swiper(`#${this.get('elementId')}`, this.get('swiperOptions')));
      this.set('registerAs', this);
    });
  })

});
