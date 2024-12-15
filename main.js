
window.onload = function() {
  lucide.createIcons();
  const menuButton = document.querySelector('#menu-button');
  const popupMenu = document.querySelector('#popup-menu');
  const cityButtons = document.querySelectorAll('.city-button');
  let cityName = '';

  menuButton.addEventListener('click', (e) => {
    e.preventDefault();
    popupMenu.classList.toggle('hidden');
  });

  //   setInterval((cityName) => {
  //     if(cityName !== '' || cityName !== undefined) {
  //       await fetchWeatherInfo(cityName);
  //     }
  //   }, 3000);
  // 點擊頁面其他位置時關閉選單（可選）
  document.addEventListener('click', (event) => {
    if (!menuButton.contains(event.target) &&
        !popupMenu.contains(event.target)) {
      popupMenu.classList.add('hidden');
    }
  });

  let weatherIntervalId = null;
  // 為每個城市按鈕添加點擊事件監聽器
  cityButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      cityName = button.value;
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
  let flag = false;
  // 定義取得並顯示天氣資訊的函式
  async function fetchWeatherInfo() {
    try {
      // const apiUrl =
      // 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-EBC821F3-9782-4630-8E87-87FF25933C15&locationName=%E5%AE%9C%E8%98%AD%E7%B8%A3';
      const apiUrl =
          `https://backend-bb-1af6d7085259.herokuapp.com/weather?city=${
              encodeURIComponent(cityName)}`;
      console.log(cityName);
      // const apiUrl =
      // `http://localhost:3000/weather?city=${encodeURIComponent(cityName)}`;
      if (!flag) {
        flag = true;
        $('#board').html('<p class="info">正在取得天氣資訊...</p>');
      }
      const data =
          await $.post(apiUrl, JSON.stringify({city: cityName}), null, 'json');

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
    const weatherDesc =
        location.weatherElement.find(element => element.elementName === 'Wx')
            .time[0]
            .parameter.parameterName;
    const maxT =
        location.weatherElement.find(element => element.elementName === 'MaxT')
            .time[0]
            .parameter.parameterName;
    const minT =
        location.weatherElement.find(element => element.elementName === 'MinT')
            .time[0]
            .parameter.parameterName;
    const rainProb =
        location.weatherElement.find(element => element.elementName === 'PoP')
            .time[0]
            .parameter.parameterName;

    // <div class="weather-icon">${lucide.CloudRain}</div>
    document.querySelector('#board').innerHTML = `
            <div class="weather-info">
                <h3>${location.locationName}</h3>
                <p>天氣狀況：${weatherDesc}</p>
                <p>最高溫度：${maxT}°C</p>
                <p>最低溫度：${minT}°C</p>
                <p>降雨機率：${rainProb}%</p>
            </div>
        `;
  }
}
