/*! Garmoshka | https://github.com/artpolikarpov/garmoshka */
(function(){
  var $window = $(window);
  var userAgent = navigator.userAgent.toLowerCase();
  var mobileFLAG = userAgent.match(/(phone|ipod|ipad|windows ce|netfront|playstation|midp|up\.browser|android|mobile|mini|tablet|symbian|nintendo|wii)/);

  var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var Garmoshka = function(){
    var _this = this;
    
    var options = {
      // Через сколько милисекунд после отпускания меха выключать гармошку
      playTimeoutLength: 500,
      // Время фейда
      fadeTime: 100,
      // Скорость авто-нажимания кнопок
      buttonMagicSpeed: 250,
      // Ширина половинки одно полосоки меха :-)
      bellowsSliceHalfWidth: 30
    }
    
    _this.initialize = function(garmoshka) {

      if (mobileFLAG) {
        alert('Try it on your desktop [:|||||:]');
      }

      _this.$garmoshka = garmoshka;
      _this.$bellows = $('.bellows', _this.$garmoshka);
      _this.$bellowsSlice = $('.slice', _this.$bellows);
      _this.$bellowsSliceHalfLeft = $('.slice .l', _this.$garmoshka);
      _this.$bellowsSliceHalfRight = $('.slice .r', _this.$garmoshka);
      _this.bellowsSliceSize = _this.$bellowsSlice.size();
      _this.audio = $('audio', _this.$garmoshka).get(0);
      _this.audio.volume = 0;

      if (!_this.audio.canPlayType('audio/ogg')) {
        // Если .ogg никак, меняем на .mp3
        _this.audio.src = _this.audio.src.replace('.ogg', '.mp3');
      }

      _this.$melodyButtons = $('.melody button', _this.$garmoshka);
      _this.melodyButtonsSize = _this.$melodyButtons.size();
      _this.$chordsButtons = $('.chords button', _this.$garmoshka);
      _this.chordsButtonsSize = _this.$chordsButtons.size();
      _this.$allButtons = _this.$melodyButtons.add(_this.$chordsButtons);

      _this.bellowsSliceHalfWidth = options.bellowsSliceHalfWidth;

      $window.on('load resize', _this.onResize);

      _this.$allButtons.on('mousedown', _this.onButtonDown);
    }

    _this.volumeFader = {
      // Объект для «анимации» громкости, от 0 до 100
      v: 0,
      value: function(){
        if (!arguments.length) {
          return this.v;
        } else {
          this.v = arguments[0];
          _this.audio.volume = this.v / 100;
        }
      }
    }

    _this.play = function(volume, magic) {
      if (!volume) volume = 100;
      if (!_this.playFLAG) {
        _this.playFLAG = true;
        _this.audio.play();
        if (magic) {
          _this.buttonMagicStart();
        }
        jTweener.removeTween(_this.volumeFader);
        jTweener.addTween(_this.volumeFader, {
          value: volume,
          time: options.fadeTime / 1000
        });
      }
    }

    _this.stop = function(volume) {
      if (!volume) volume = 0;
      if (_this.playFLAG) {
        _this.playFLAG = false;
        jTweener.removeTween(_this.volumeFader);
        jTweener.addTween(_this.volumeFader, {
          value: volume,
          time: options.fadeTime / 1000,
          onComplete: function() {
            _this.audio.pause();
            _this.buttonMagicStop();
          }
        });
      }
    }

    _this.onButtonDown = function() {
      _this.play(25);
      setTimeout(_this.stop, options.fadeTime * 2);
    }

    _this.buttonMagic = function() {
      _this.$allButtons.removeClass('active');
      // Сколько кнопок нажать в правом ряду, 1-2
      var melodyButtonsSize = getRandomInt(1, 2);
      for (var _i = 0; _i < melodyButtonsSize; _i++) {
        // Нажимаем случайную кнопку
        _this.$melodyButtons.eq(getRandomInt(0, _this.melodyButtonsSize - 1)).addClass('active');
      }

      _this.$chordsButtons.eq(getRandomInt(0, _this.chordsButtonsSize - 1)).addClass('active');
    }

    _this.buttonMagicStart = function () {
      _this.buttonMagicInterval = setInterval(_this.buttonMagic, options.buttonMagicSpeed);
    }

    _this.buttonMagicStop = function () {
      clearInterval(_this.buttonMagicInterval);
      _this.$allButtons.removeClass('active');
    }

    _this.onResize = function(e) {
      var garmoshkaWidth = _this.$garmoshka.width();
      if (e.type == 'resize' && garmoshkaWidth != _this.garmoshkaWidth) {
        // Играем на гармошке, реагируем только на изменение ширины гармошки
        _this.play(100, true);

        clearTimeout(_this.playTimeout);
        _this.playTimeout = setTimeout(function(){
          // Если мех не тянуть гармошка замолчит
          _this.stop();
        }, options.playTimeoutLength);
      }


      
      // Считаем ширину, чтобы понять насколько сдвигать меха
      _this.accordionWidth = _this.$garmoshka.width();
      _this.bellowsSliceHalfWidthReal = Math.min(_this.bellowsSliceHalfWidth, _this.$bellowsSlice.eq(0).width() / 2);
      _this.bellowsSliceHalfWidthDiff = _this.bellowsSliceHalfWidth - _this.bellowsSliceHalfWidthReal;

      // Угол для поворота половинки части меха в радианах
      _this.bellowsSliceHalfAngle = Math.asin(_this.bellowsSliceHalfWidthReal / _this.bellowsSliceHalfWidth);
      // Переводим угол в градусы
      _this.bellowsSliceHalfAngle = 90 - (_this.bellowsSliceHalfAngle / Math.PI * 180);

      // Тянем мех
      _this.renderBellows();

      // Сохраняем ширину гармошки на потом
      _this.garmoshkaWidth = garmoshkaWidth;
    }

    _this.renderBellows = function() {
      _this.$bellowsSliceHalfLeft.css({transform: 'rotateY(' + _this.bellowsSliceHalfAngle  + 'deg)'});
      _this.$bellowsSliceHalfRight.css({transform: 'rotateY(-' + _this.bellowsSliceHalfAngle  + 'deg)', marginLeft: -_this.bellowsSliceHalfWidthDiff});
    }
  }

  $(function(){
    // Достаём гармошку, хромку
    var Hromka = new Garmoshka();
    Hromka.initialize($('#garmoshka'));
  });
})();
