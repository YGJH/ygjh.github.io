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
  const locationButton = document.querySelector('#location-button');

  // 如果 localStorage 中有 city 鍵值，則將 cityName 設為該值
  // 否則 cityName 保持為 null
  let cityName = '';

  // 新增API來源切換狀態
  let useFrontendApi = true;

  // 在初始化時新增切換按鈕
  const headerElement = document.querySelector('#background-menu');
  const apiToggleHtml = `
  <div id="api-toggle-container">
  <label class="switch">
  <input type="checkbox" id="api-toggle" checked>
        <span class="slider round"></span>
        </label>
      <span class="toggle-label">快速回應</span>
      </div>
      `;
  headerElement.insertAdjacentHTML('beforeend', apiToggleHtml);

  // 綁定切換事件
  const apiToggle = document.querySelector('#api-toggle');
  apiToggle.addEventListener('change', function() {
    useFrontendApi = this.checked;
    // fetchWeatherInfo();  // 立即重新獲取天氣資訊
  });

  const toggleButton = document.querySelector('.toggle-label');
  // 檢查 localStorage 是否有儲存 city
  function init() {
    if (mode == 'dark-font') {
      setDarkMode();
    } else {
      setLightMode();
    }

    // 新增網站介紹在初始畫面
    $('#board').html(`
      <div id="weather-info" class="gray-background">
        <img src="assets\\1779940.png" style="width: 200px; height: 200px;">
        <div id="intro-container">
          <h2 class="light-font">歡迎使用天氣查詢服務</h2>
          <div class="intro-content">
            <p class="light-font">使用說明：</p>
            <ul class="light-font">
              <li>點擊左上角選單可選擇城市</li>
              <li>點擊定位圖示可獲取當前位置天氣</li>
              <li>切換右上角快速回應開關可改變資料來源</li>
              <li>使用右上角主題按鈕可切換深淺色模式</li>
            </ul>
            <p class="light-font">請選擇城市開始使用！</p>
          </div>
        </div>
      </div>
    `);

    // 檢查是否有儲存的城市，如果有則獲取天氣資訊
    // const storedCity = localStorage.getItem('city');
    // if (storedCity) {
    //   cityName = storedCity;
    //   fetchWeatherInfo();
    // }
  }
  init();

  lucide.createIcons();

  // 獲取元素


  function setDarkMode() {
    mode = 'dark-font';
    toggleButton.classList.add('light-font');
    toggleButton.classList.remove('dark-font');
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
    locationButton.classList.add('light-font');
    locationButton.classList.remove('dark-font');
  }

  function setLightMode() {
    menuBackground.classList.add('background-menu-dark');
    menuBackground.classList.remove('background-menu-light');
    toggleButton.classList.add('dark-font');
    toggleButton.classList.remove('light-font');
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
    locationButton.classList.remove('light-font');
    locationButton.classList.add('dark-font');
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
      // localStorage.setItem('city', cityName);

      await fetchWeatherInfo();
      popupMenu.classList.add('hidden');


      return false;
    });
  });



  async function fetchWeatherInfoFromBackend() {
    const apiUrl = `https://backend-test-sic9.onrender.com/weather`;
    // const apiUrl = `http://localhost:3000/weather`;

    // 設定 API 請求的共用設定
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': '61a60170273e74a5be90355ffe8e86ad', // 加入 API 金鑰
        'User-Agent': navigator.userAgent // 加入 User-Agent
      },
      timeout: 50000
    };

    // 添加載入動畫
    $('#board').html(
        `<div class="loading-container"><div class="loading-spinner"></div><p class="${
            (mode === 'light-font') ? 'dark-font' : 'light-font'
        }">正在取得天氣資訊...</p></div>`);

    try {
      const response = await $.ajax({
        ...requestConfig,
        url: apiUrl,
        type: 'POST',
        data: JSON.stringify({cityName}),
        success: (data) => {
          displayWeatherInfo(data);
        },
        error: (xhr, status, error) => {
          cityName = '';
          let errorMessage = '無法取得天氣資訊';
          if (xhr.status === 401) {
            errorMessage = '未授權的請求';
          } else if (xhr.status === 403) {
            errorMessage = '請求被拒絕';
          } else if (xhr.status === 429) {
            errorMessage = '請求次數過多，請稍後再試';
          }
          $('#board').html(`<p class="info ${(mode === 'light-font') ? 'dark-font' : 'light-font'}">${errorMessage}</p>`);
        }
      });
    } catch (error) {
      console.error('請求錯誤：', error);
    }
  }


  // 定義取得並顯示天氣資訊的函式
  async function fetchWeatherInfo() {
    if (useFrontendApi) {
      // 使用前端 API
      try {
        const forecastApiUrl =
            'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-089?Authorization=CWA-EBC821F3-9782-4630-8E87-87FF25933C15'
        const main_apiUrl =
            'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-EBC821F3-9782-4630-8E87-87FF25933C15';
        const data = await $.get(main_apiUrl);
        const location =
            data.records.location.find(loc => loc.locationName === cityName);
        const forecastWeather = await $.get(forecastApiUrl);
        const forecastLocation =
            forecastWeather.records.Locations[0].Location.find(
                (loc) => loc.LocationName === cityName);
        const forecastElements = forecastLocation.WeatherElement;
        // 找出天氣現象和綜合描述的資料
        const wxElement = forecastElements.find(
            element => element.ElementName === '天氣現象');
        const weatherDescElement = forecastElements.find(
            element => element.ElementName === '天氣預報綜合描述');
        const tempElement =
            forecastElements.find(element => element.ElementName === '溫度');
        const feelsTempElement = forecastElements.find(
            element => element.ElementName === '體感溫度');
        const forecastWx = [];
        for (let i = 0; i < wxElement.Time.length;
             i += 8) {  // 每天取一個時間點
          const wxTime = wxElement.Time[i];
          const tempTime = tempElement.Time[i];
          const weaDesc = weatherDescElement.Time[i];
          const feelsTempTime = feelsTempElement?.Time[i];
          if (wxTime && tempTime) {
            forecastWx.push({
              date: (wxTime.StartTime) ? wxTime.StartTime.split('T')[0] :
                                         '無日期',
              description:
                  weaDesc.ElementValue[0].WeatherDescription || '無描述',
              temp: tempTime.ElementValue[0]?.Temperature || '無溫度資料',
              feelsTemp: feelsTempTime?.ElementValue[0]?.ApparentTemperature ||
                  '無體感溫度資料'
            });
          }
          if (forecastWx.length >= 3) break;  // 只取三天的資料
        }
        const forecastList =
            forecastWx
                .map(
                    forecast => `日期：${forecast.date}，天氣：${
                        forecast.description}，溫度：${
                        forecast.temp}°C，體感溫度：${forecast.feelsTemp}°C`)
                .join('； ');
        if (location) {
          // 轉換資料格式以符合顯示需求
          const weatherData = {
            timestamp: new Date().toLocaleString(),
            city: cityName,
            currentWeather: {
              weather:
                  location.weatherElement[0].time[0].parameter.parameterName,
              maxTemp:
                  location.weatherElement[4].time[0].parameter.parameterName,
              minTemp:
                  location.weatherElement[2].time[0].parameter.parameterName,
              pop: location.weatherElement[1].time[0].parameter.parameterName
            },
            forecast: forecastList,  // 前端 API 模式不顯示預報
            advice: ''               // 前端 API 模式不顯示建議
          };

          await displayWeatherInfo(weatherData);
        }
      } catch (error) {
        console.error('無法從前端 API 獲取天氣資訊：', error);
        await fetchWeatherInfoFromBackend();
      }
    } else {
      try {
        await fetchWeatherInfoFromBackend();
      } catch {
        console.error(error);
        $('#board').html(`<p class="info ${
            (mode === 'light-font') ? 'dark-font' :
                                      'light-font'}">無法取得天氣資訊。</p>`);
      }
    }
  }

  // 顯示天氣資訊的函式
  function displayWeatherInfo(location) {
    const timestamp = location.timestamp;
    const city = location.city;
    const currentWeather = location.currentWeather;
    const forecast = location.forecast;
    const advice = location.advice || '無建議資訊';
    // 處理預報資訊：將字串以分號分割並格式化
    let formattedForecast = '';


    const temp = forecast.split('；');
    for (let i = 0; i < temp.length; i++) {
      formattedForecast +=
          `<div class='forecast-content'><p class="light-font">`;
      const ttemp = temp[i].split('，');
      for (let j = 0; j < ttemp.length; j++) {
        if (ttemp[j].length < 3) continue;
        formattedForecast += `
        ${(ttemp[j])}</br>
      `;
      }
      formattedForecast += '</div>';
    }



    // 修改預報和建議的顯示邏輯
    const showForecast = forecast;
    const showAdvice = advice;

    $('#board').html(`
      <div id="weather-info" class="gray-background">
        <img src="assets\\1779940.png" style="width: 200px; height: 200px;">
        <div id="weather-container">
          <h3 class="light-font"> ${city} </h3>
         
          <div class="toggle-container">
            <label class="switch">
              <input type="checkbox" id="toggle-weather">
              <span class="slider round"></span>
            </label>
            <span class="light-font">切換天氣顯示</span>
          </div>
          

          <div id="current-weather">
            <p class="light-font">天氣描述: ${currentWeather.weather}</p>
            <p class="light-font">最高溫度: ${currentWeather.maxTemp}°C</p>
            <p class="light-font">最低溫度: ${currentWeather.minTemp}°C</p>
            <p class="light-font">降雨機率: ${currentWeather.pop}%</p>
            <p class="light-font">時間戳記: ${timestamp}</p>
            ${
        showAdvice ? `<div class="light-font advice-content">建議: ${
                         marked.parse(advice)}</div>` :
                     ''}
          </div>

          ${
        showForecast ? `
          <div id="forecast-weather" style="display: none;">
            <h3 class="light-font">未來天氣預報</h3>
            <div class="forecast-content light-font">${formattedForecast}</div>
          </div>
          ` :
                       ''}
        </div>
      </div> 
    `);
    // 只在後端 API 模式下添加切換事件監聽器
    if (showForecast) {
      $('#toggle-weather').on('change', function() {
        if (this.checked) {
          $('#current-weather').hide();
          $('#forecast-weather').show();
        } else {
          $('#forecast-weather').hide();
          $('#current-weather').show();
        }
      });
    }
    if (weatherIntervalId) {
      clearInterval(weatherIntervalId);
    }

    // 設置新的定時器
    weatherIntervalId = setInterval(async () => {
      if (cityName) {
        await fetchWeatherInfo(cityName);
      }
    }, 1800000);  // 每30分鐘更新一次
  }

  // 修改過的 getCityNameFromCoords 函式
  async function getCityNameFromCoords(latitude, longitude) {
    try {
      // const backendUrl = 'http://localhost:3000/weather';
      const backendUrl = 'https://backend-test-sic9.onrender.com/weather';
      const requestConfig = {
        headers: {
          'X-API-Key': '61a60170273e74a5be90355ffe8e86ad',
          'User-Agent': navigator.userAgent
        },
        timeout: 50000
      };

      const response = await $.ajax({
        ...requestConfig,
        url: backendUrl,
        method: 'GET',
        data: {latitude: latitude, longitude: longitude , useFrontendApi: useFrontendApi},
      });
      if (response && response.city && !useFrontendApi) {
        cityName = response.city;
        displayWeatherInfo(response);
        // localStorage.setItem('city', cityName);


        $('#board').removeClass('loading');

        return null;
      } else if(response && response.city && useFrontendApi) {
        cityName = response.city;
        fetchWeatherInfo();
      } else {
      console.error('無法從後端取得縣市名稱');
      $('#board').html('<p class="info">無法偵測到您的城市位置。</p>');
      console.error('Geolocation error:', error);
      $('#board').html('<p class="info">無法取得您的地理位置權限。</p>');
      $('#board').removeClass('loading');
      return null;
      }
    } catch (error) {
      if (error.statusText === 'timeout') {
        console.error('請求後端獲取縣市名稱超時');
      } else {
        console.error('從後端取得縣市名稱時發生錯誤：', error);
      }
      $('#board').removeClass('loading');

      return null;
    }
  }

  // 修改後的 requestUserLocation 函式
  async function requestUserLocation() {
    if (navigator.geolocation) {
      // 添加載入動畫
      $('#board').html(
          `<div class="loading-container"><div class="loading-spinner"></div><p class="${
              (mode === 'light-font') ?
                  'dark-font' :
                  'light-font'}">正在取得天氣資訊...</p></div>`);

      navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        await getCityNameFromCoords(latitude, longitude);
      });
    }
  }

  // 添加定位按鈕事件監聽器
  locationButton.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('是否允許獲取您的位置資訊？')) {
      await requestUserLocation();
    }
  });
}