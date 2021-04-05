const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// Các trườn sử dụng lặp lại
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn  = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist  = $('.playlist');  

const PlAYER_STORAGE_KEY = "APP_MUSIC";

const app = {
  // Lấy chỉ mụng đầu tiên của mảng
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
  setConfig: function(key, value) {
      this.config[key] = value;
      localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: [    
    {
      name: "GONE",
      singer: "Rose",
      path: "/assets/music/Gone-ROSE-6964052.mp3",
      image: "https://photo-baomoi.zadn.vn/w700_r1/2021_02_10_329_37912539/9446b1857ac69398cad7.jpg"
    },
    {
        name: "Death Bed",
        singer: "PowFu",
        path: "/assets/music/Death+Bed.mp3",
        image:
          "https://avatar-ex-swe.nixcdn.com/playlist/2020/03/06/7/b/e/8/1583486323986_500.jpg"
      },
      {
        name: "LeyLa",
        singer: "Raftaar",
        path: "https://data18.chiasenhac.com/downloads/1995/3/1994783-7866723f/128/Leyla%20-%20Mesto.mp3",
        image:
          "https://data.chiasenhac.com/data/cover/101/100884.jpg",
      },

      {
        name: "Nothing on you",
        singer: "Raftaar",
        path: "/assets/music/Nothing.mp3",
        image:
          "https://images.livemixtapes.com/artists/bbillgates/blackdiamond8/cover.jpg",
      },

      {
        name: "Lemon Tree",
        singer: "Raftaar",
        path: "/assets/music/Lemon.mp3",
        image:
          "https://i.ytimg.com/vi/l2UiY2wivTs/maxresdefault.jpg",
      },


  ],
  
  render: function() {
        const htmls = this.songs.map((song, index)=> {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        })
        $('.playlist').innerHTML = htmls.join(' ');
  },
  // Định nghĩa thuộc tính
  defineProperties: function() {
    Object.defineProperty(this, 'currentSong', {
          get: function() {
            return this.songs[this.currentIndex];
          }
    })
  }, 
  handleEvents: function() {
      const _this = this;
      const cdWidth = cd .offsetWidth;

      // Xử lý CD quay/ dừng

     const cdThumbAnimate =  cdThumb.animate([
         {transform: 'rotate(360deg)'}
      ], {
          duration: 1000,
          iterations: Infinity,
      })
      cdThumbAnimate.pause();

      // Xử lý phóng to và thu nhỏ 
      document.onscroll = function() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth +  'px': 0;
      cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý khi chạy
        playBtn.onclick = function() {
            if (_this.isPlaying) {
               audio.pause();
            } else {     
                audio.play();     
            }       
          }

        // Khi song được play
        audio.onplay = function() {
          _this.isPlaying = true;
          player.classList.add('playing');
          cdThumbAnimate.play();
        }

        //Khi song được pause
        audio.onpause = function() {
          _this.isPlaying = false;
          player.classList.remove('playing');
          cdThumbAnimate.pause();
        }

        //Tiến độ bài hát 
        audio.ontimeupdate = function() {
              if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
              }
        }

        //Xử lý khi tua bài hát 
          progress.onchange = function(e) {
              const seekTime = audio.duration / 100 * e.target.value;
              audio.currentTime = seekTime;
          }

          //Khi next song  và  chạy
          nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
              _this.nextSong();         
            }
                 audio.play();
                 _this.render();
                 _this.scrollToActiveSong();
          }

          // Khi tua lại bài hát
          prevBtn.onclick = function() {
            if (_this.isRandom) {
              _this.playRandomSong();
            } else {
              _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
          }   

          // Xử lý bật tắt random song
          randomBtn.onclick = function(e) {
              _this.isRandom  = !_this.isRandom;
              _this.setConfig('isRandom', _this.isRandom);
              randomBtn.classList.toggle('active', _this.isRandom);
              _this.playRandomSong();
          }

          // Xử lý khi repeat lặp lai một bài hát
          repeatBtn.onclick = function(e) {
                _this.isRepeat = !_this.isRepeat;
                _this.setConfig('isRepeat', _this.isRepeat);
                repeatBtn.classList.toggle('active', _this.isRepeat);
          }
          
          //Xử lý xong khi audio ended
          audio.onended = function() {
            if (_this.isRepeat) {
                  audio.play();
            } else {
                nextBtn.click();  
            }
          }

          // Lắng nghe hành vi click vào playlist
          playlist.onclick = function(e) {
              //Xử lý khi click vào song
              const songNode=  e.target.closest('.song:not(.active)');
              if (songNode || e.target.closest('.option') ) {
                  // Xử lý khi click vào song
                      if (songNode) {
                        _this.currentIndex =  Number(songNode.dataset.index);
                        _this.loadCurrentSong();
                        _this.render();
                        audio.play();
                        
                      }

                      //Xử lý khi click vào song option
                      if (e.target.closest('.option')) {

                      }
              }
          }
  },
      scrollToActiveSong: function() {
          setTimeout(( )=> {
            $('.song.active').scrollIntoView( {
                behavior: 'smooth',
                block: 'nearest',
            })
          }, 300)
      },
      loadCurrentSong: function() {
          heading.textContent = this.currentSong.name;
          cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
          audio.src = this.currentSong.path;
      },
      loadConfig: function() {
        this.isRandom = config.isRandom;
        this.isRepeat = config.isRepeat;
      },
      nextSong: function() {
          this.currentIndex++;

          if (this.currentIndex >= this.songs.length) {
              this.currentSong = 0;
          }
              this.loadCurrentSong();
      },
      prevSong: function() {
        this.currentIndex--;

        if (this.currentIndex < this.songs.length) {
              this.currentSong = this.songs.length - 1;
        }
          this.loadCurrentSong();
      },
      playRandomSong: function() {
          let newIndex;
            do {
               newIndex = Math.floor(Math.random() * this.songs.length);
            } while (newIndex === this.currentIndex)

            this.currentIndex = newIndex;
            this.loadCurrentSong();
      },
        start: function() {
          // Định nghĩa các thuộc tính cho Object
            this.defineProperties();

          // Lắng nghe các sự kiện trong DomEvent
            this.handleEvents();

            //Tải thông tin bài hát đầu tiên vào UI khi chạy
            this.loadCurrentSong();

          // Render danh sách bài hát
            this.render();
  }
}

app.start();




