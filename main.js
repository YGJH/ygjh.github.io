window.onload = function() {
  let weatherIntervalId = null;
  let flag = false;

  let mode = localStorage.getItem('mode') || 'dark-font';
  const menuButton = document.querySelector('#menu-button');
  const popupMenu = document.querySelector('#popup-menu');
  const cityButtons = document.querySelectorAll('.city-button');
  const weatherDisplay = document.querySelectorAll('#board');
  const container = document.querySelector('#container');

  const darkModeButton = document.querySelector('#dark-mode');
  const lightModeButton = document.querySelector('#light-mode');

  // 如果 localStorage 中有 city 鍵值，則將 cityName 設為該值
  // 否則 cityName 保持為 null
  let cityName;

  // 檢查 localStorage 是否有儲存 city
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
        console.log('更新天氣資訊：', cityName);
        await fetchWeatherInfo(cityName);
      }
    }, 300000);
  }

  lucide.createIcons();

  // 獲取元素


  function setDarkMode() {
    mode = 'dark-font';
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
    mode = 'light-font';
    console.log(darkModeButton);
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
          console.log('更新天氣資訊：', cityName);
          await fetchWeatherInfo(cityName);
        }
      }, 300000);

      return false;
    });
  });
  // 定義取得並顯示天氣資訊的函式
  async function fetchWeatherInfo() {
    try {
      // console.log("fetchWeatherInfo");
      // const apiUrl =
      // 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-EBC821F3-9782-4630-8E87-87FF25933C15&locationName=%E5%AE%9C%E8%98%AD%E7%B8%A3';
      const apiUrl =
          `https://backend-bb-1af6d7085259.herokuapp.com/weather?city=${encodeURIComponent(cityName)}`;
      // console.log(cityName);
      // const apiUrl =
      // `http://localhost:3000/weather?city=${encodeURIComponent(cityName)}`;
      if (!flag) {
        flag = true;
        $('#board').html('<p class="info">正在取得天氣資訊...</p>');
      }
      const data =
          await $.post(apiUrl, JSON.stringify({city: cityName}), null, 'json');
      console.log('資料獲取成功：', data);
      displayWeatherInfo(data);

    } catch (error) {
      console.error('資料獲取錯誤：', error);
      cityName = '';
      console.log('清除定時器');
      clearInterval(weatherIntervalId);
      $('#board').html('<p class="info">無法取得天氣資訊。</p>');
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
}