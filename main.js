window.onload = function() {
  let weatherIntervalId = null;

  let mode = localStorage.getItem('mode') || 'dark-font';
  const menuButton = document.querySelector('#menu-button');
  const popupMenu = document.querySelector('#popup-menu');
  const cityButtons = document.querySelectorAll('.city-button');
  const container = document.querySelector('#container');
  const menuBackground = document.querySelector('#background-menu');
  const darkModeButton = document.querySelector('#dark-mode');
  const lightModeButton = document.querySelector('#light-mode');

  // 如果 localStorage 中有 city 鍵值，則將 cityName 設為該值
  // 否則 cityName 保持為 null
  let cityName = '';

  // 檢查 localStorage 是否有儲存 city
  function init() {
    if (mode == 'dark-font') {
      setDarkMode();
    } else {
      setLightMode();
    }
    const storedCity = localStorage.getItem('city') || null;
    if (storedCity) {
      cityName = storedCity;
      fetchWeatherInfo();
      if (weatherIntervalId) {
        clearInterval(weatherIntervalId);
      }

      // 設置新的定時器
      weatherIntervalId = setInterval(async () => {
        if (cityName) {
          await fetchWeatherInfo(cityName);
        }
      }, 300000);
    } else {
      // 如果沒有存儲的城市，請求使用者地理位置
      requestUserLocation();
      
      if(cityName) {
        fetchWeatherInfo();
      }
    }
  }
  init();

  lucide.createIcons();

  // 獲取元素


  function setDarkMode() {
    mode = 'dark-font';
    menuBackground.classList.remove('background-menu-dark');
    menuBackground.classList.add('background-menu-light');
    localStorage.setItem('mode', mode);
    darkModeButton.classList.add(`hidden`);
    darkModeButton.classList.add(`light-font`);
    darkModeButton.classList.remove(`dark-font`);
    lightModeButton.classList.add(`light-font`);
    lightModeButton.classList.remove(`dark-font`);
    lightModeButton.classList.remove(`hidden`);
    container.classList.remove('light-background');
    container.classList.add('dark-background');
    menuButton.classList.add('light-font');
    menuButton.classList.remove('dark-font');
    cityButtons.forEach(button => {
      button.classList.add('light-font');
      button.classList.remove('dark-font');
    });
    popupMenu.classList.remove('light-background');
    popupMenu.classList.add('dark-background');
  }
  
  function setLightMode() {
    menuBackground.classList.add('background-menu-dark');
    menuBackground.classList.remove('background-menu-light');
    mode = 'light-font';
    localStorage.setItem('mode', mode);
    lightModeButton.classList.add(`hidden`);
    lightModeButton.classList.remove(`light-font`);
    lightModeButton.classList.add(`dark-font`);
    darkModeButton.classList.add(`dark-font`);
    darkModeButton.classList.remove(`hidden`);
    darkModeButton.classList.remove(`light-font`);

    container.classList.add('light-background');
    container.classList.remove('dark-background');
    menuButton.classList.remove('light-font');
    menuButton.classList.add('dark-font');
    cityButtons.forEach(button => {
      button.classList.remove('light-font');
      button.classList.add('dark-font');
    });
    popupMenu.classList.add('light-background');
    popupMenu.classList.remove('dark-background');
  }


  darkModeButton.addEventListener('click', (e) => {
    e.preventDefault();
    setDarkMode();
  });

  lightModeButton.addEventListener('click', (e) => {
    e.preventDefault();
    setLightMode();
  });


  menuButton.addEventListener('click', (e) => {
    e.preventDefault();
    popupMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (event) => {
    if (!menuButton.contains(event.target) &&
        !popupMenu.contains(event.target) && !darkModeButton === event.target &&
        !lightModeButton === event.target) {
      popupMenu.classList.add('hidden');
    }
  });

  // 為每個城市按鈕添加點擊事件監聽器
  cityButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      cityName = button.value;
      localStorage.setItem('city', cityName);

      await fetchWeatherInfo();
      popupMenu.classList.add('hidden');

      // 清除舊的定時器（如果存在）
      if (weatherIntervalId) {
        clearInterval(weatherIntervalId);
      }

      // 設置新的定時器
      weatherIntervalId = setInterval(async () => {
        if (cityName) {
          await fetchWeatherInfo(cityName);
        }
      }, 300000);

      return false;
    });
  });
  

  
  async function fetchWeatherInfoFromBackend() {
    try {
      const apiUrl =
          `https://backend-bb-1af6d7085259.herokuapp.com/weather?city=${encodeURIComponent(cityName)}`;
      // const apiUrl =
      //     `http://localhost:3000/weather?city=${encodeURIComponent(cityName)}`;
      const data =
          await $.post(apiUrl, JSON.stringify({city: cityName}), null, 'json');
      displayWeatherInfo(data);

    } catch (error) {
      cityName = '';
      clearInterval(weatherIntervalId);
      $('#board').html('<p class="info">無法取得天氣資訊。</p>');
    }
  }


  // 定義取得並顯示天氣資訊的函式
  async function fetchWeatherInfo() {
    try {
      const main_apiUrl =
          'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-EBC821F3-9782-4630-8E87-87FF25933C15';
      console.log(cityName);
          const data = await $.get(main_apiUrl);
      const dd = {
        timestamp: new Date().toLocaleString(),
        data: data.records.location.find(loc => loc.locationName === cityName)
    };
      displayWeatherInfo(dd);
      localStorage.setItem('city', cityName);

    } catch (error) {
      fetchWeatherInfoFromBackend();
    }
  }

  // 顯示天氣資訊的函式
  function displayWeatherInfo(location) {
    const weatherDesc = location.data.weatherElement
                            .find(element => element.elementName === 'Wx')
                            .time[0]
                            .parameter.parameterName;
    const maxT = location.data.weatherElement
                     .find(element => element.elementName === 'MaxT')
                     .time[0]
                     .parameter.parameterName;
    const minT = location.data.weatherElement
                     .find(element => element.elementName === 'MinT')
                     .time[0]
                     .parameter.parameterName;
    const PoP = location.data.weatherElement
                    .find(element => element.elementName === 'PoP')
                    .time[0]
                    .parameter.parameterName;
    const CI = location.data.weatherElement
                   .find(element => element.elementName === 'CI')
                   .time[0]
                   .parameter.parameterName;
    const timestamp = location.timestamp;

    $('#board').html(`
      <div id="weather-info" class="gray-background">
      <img src="assets\\1779940.png" style="width: 200px; height: 200px;">
        <div id="weather-container">
          <h3 class="light-font"> ${cityName} </h3>
          <p class="light-font">天氣描述: ${weatherDesc}</p>
          <p class="light-font">最高溫度: ${maxT}°C</p>
          <p class="light-font">最低溫度: ${minT}°C</p>
          <p class="light-font">降雨機率: ${PoP}%</p>
          <p class="light-font">舒適度指數: ${CI}</p>
          <p class="light-font">時間戳記: ${timestamp}</p>
      </div>
        </div>  
        `);
  }

  // 新增反向地理編碼函式
  async function getCityNameFromCoords(latitude, longitude) {
    try {
        // const backendUrl = 'http://localhost:3000/weather';
        const backendUrl = 'https://backend-bb-1af6d7085259.herokuapp.com/weather';
        const response = await $.get(`${backendUrl}?latitude=${latitude}&longitude=${longitude}`);
        
        if (response && response.data && response.data.locationName) {
            return response.data.locationName;
        } else {
            console.error('無法從後端取得縣市名稱');
            return null;
        }
    } catch (error) {
        console.error('從後端取得縣市名稱時發生錯誤：', error);
        return null;
    }
  }

  // 新增取得使用者地理位置的函式
  async function requestUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const detectedCity = await getCityNameFromCoords(latitude, longitude);
            if (detectedCity) {
                cityName = detectedCity;
                localStorage.setItem('city', cityName);
                fetchWeatherInfo();
                if (weatherIntervalId) {
                    clearInterval(weatherIntervalId);
                }
                weatherIntervalId = setInterval(async () => {
                    if (cityName) {
                        await fetchWeatherInfo(cityName);
                    }
                }, 300000);
            } else {
                $('#board').html('<p class="info">無法偵測到您的城市位置。</p>');
            }
        }, () => {
            $('#board').html('<p class="info">無法取得您的地理位置權限。</p>');
        });
    } else {
        $('#board').html('<p class="info">您的瀏覽器不支援地理位置功能。</p>');
    }
  }
}